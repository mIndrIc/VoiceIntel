'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Settings as SettingsIcon, Clock, Mic, Square, Loader2, Copy, Save, Trash2, Check } from 'lucide-react';
import { ModeSelector } from '@/components/ModeSelector';
import { Settings } from '@/components/Settings';
import { History } from '@/components/History';
import { SaveDialog } from '@/components/SaveDialog';
import { AudioWaveform } from '@/components/AudioWaveform';
import { TextStats } from '@/components/TextStats';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useAppStore, EnrichmentMode, ContextType } from '@/stores/appStore';
import { audioRecorder } from '@/lib/audioRecorder';
import { transcribeAudio, enrichText } from '@/lib/api';
import { playStartSound, playStopSound, playSuccessSound } from '@/lib/sounds';
import { t } from '@/lib/i18n';

function ResultButtons() {
  const { enrichedOutput, currentTranscript, addHistoryEntry, selectedMode, selectedContextType, reset, language } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(enrichedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };
  
  const getModeLabel = () => {
    const labels: Record<string, string> = {
      original: 'Original',
      structured: 'Strukturiert',
      summary: 'Zusammenfassung',
      context: 'Kontext',
    };
    return labels[selectedMode] || selectedMode;
  };
  
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={reset}
          className="result-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          title={t('delete', language)}
        >
          <Trash2 size={14} />
          <span>{t('delete', language)}</span>
        </button>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="result-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Save size={14} />
          <span>{t('save', language)}</span>
        </button>
        <button
          onClick={handleCopy}
          className="result-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={copied ? {
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
            border: '1px solid #22c55e'
          } : undefined}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? t('copied', language) : t('copy', language)}</span>
        </button>
      </div>
      
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false);
          // Also save to history when closing after export
          addHistoryEntry({
            transcript: currentTranscript,
            enrichedText: enrichedOutput,
            mode: selectedMode,
            contextType: selectedMode === 'context' ? selectedContextType : undefined,
          });
        }}
        transcript={currentTranscript}
        enrichedText={enrichedOutput}
        mode={getModeLabel()}
      />
    </>
  );
}

export default function Home() {
  const {
    status,
    setStatus,
    recordingTime,
    setRecordingTime,
    setCurrentTranscript,
    setLiveTranscript,
    liveTranscript,
    currentTranscript,
    enrichedOutput,
    setEnrichedOutput,
    setErrorMessage,
    errorMessage,
    selectedMode,
    selectedContextType,
    openaiApiKey,
    anthropicApiKey,
    selectedLLM,
    selectedMicrophone,
    setAvailableMicrophones,
    setIsReprocessing,
    isReprocessing,
    toggleSettings,
    toggleHistory,
    language,
  } = useAppStore();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  useEffect(() => {
    const loadMics = async () => {
      try {
        const devices = await audioRecorder.getAudioDevices();
        setAvailableMicrophones(devices);
      } catch (error) {
        console.log('Could not load microphones:', error);
      }
    };
    loadMics();
  }, [setAvailableMicrophones]);
  
  useEffect(() => {
    if (selectedMicrophone) {
      audioRecorder.setSelectedDevice(selectedMicrophone);
    }
  }, [selectedMicrophone]);
  
  const startLiveTranscription = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'de-DE';
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setLiveTranscript(transcript);
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  }, [setLiveTranscript]);
  
  const stopLiveTranscription = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);
  
  const handleModeChange = useCallback(async (mode: EnrichmentMode, contextType?: ContextType) => {
    if (!currentTranscript || isReprocessing) return;
    
    if (mode === 'original') {
      setEnrichedOutput(currentTranscript);
      return;
    }
    
    setIsReprocessing(true);
    setErrorMessage('');
    
    try {
      const enrichedText = await enrichText(currentTranscript, mode, selectedLLM, openaiApiKey, anthropicApiKey, contextType);
      setEnrichedOutput(enrichedText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Verarbeitung fehlgeschlagen');
    } finally {
      setIsReprocessing(false);
    }
  }, [currentTranscript, isReprocessing, selectedLLM, openaiApiKey, anthropicApiKey, setEnrichedOutput, setErrorMessage, setIsReprocessing]);
  
  const startRecording = useCallback(async () => {
    if (!openaiApiKey) {
      setErrorMessage('Bitte OpenAI API Key in den Einstellungen konfigurieren.');
      toggleSettings();
      return;
    }
    
    try {
      setLiveTranscript('');
      setCurrentTranscript('');
      setEnrichedOutput('');
      setErrorMessage('');
      
      await audioRecorder.start();
      setMediaStream(audioRecorder.getStream());
      startLiveTranscription();
      setStatus('recording');
      playStartSound();
      recordingStartRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        setRecordingTime(elapsed);
      }, 1000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Aufnahme fehlgeschlagen');
      setStatus('error');
    }
  }, [openaiApiKey, setStatus, setRecordingTime, setErrorMessage, setLiveTranscript, setCurrentTranscript, setEnrichedOutput, toggleSettings, startLiveTranscription]);
  
  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopLiveTranscription();
    setMediaStream(null);
    playStopSound();
    
    try {
      setStatus('transcribing');
      const audioBlob = await audioRecorder.stop();
      
      if (audioBlob.size < 1000) {
        setErrorMessage('Aufnahme zu kurz.');
        setStatus('idle');
        return;
      }
      
      const transcript = await transcribeAudio(audioBlob, openaiApiKey);
      setCurrentTranscript(transcript);
      setLiveTranscript('');
      
      if (!transcript.trim()) {
        setErrorMessage('Keine Sprache erkannt.');
        setStatus('idle');
        return;
      }
      
      if (selectedMode === 'original') {
        setEnrichedOutput(transcript);
        setStatus('done');
        playSuccessSound();
        return;
      }
      
      setStatus('enriching');
      const enrichedText = await enrichText(transcript, selectedMode, selectedLLM, openaiApiKey, anthropicApiKey, selectedMode === 'context' ? selectedContextType : undefined);
      setEnrichedOutput(enrichedText);
      setStatus('done');
      playSuccessSound();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Fehler');
      setStatus('error');
    }
  }, [openaiApiKey, anthropicApiKey, selectedMode, selectedContextType, selectedLLM, setStatus, setCurrentTranscript, setEnrichedOutput, setErrorMessage, setLiveTranscript, stopLiveTranscription]);
  
  const toggleRecording = useCallback(() => {
    if (status === 'recording') stopRecording();
    else if (['idle', 'done', 'error'].includes(status)) startRecording();
  }, [status, startRecording, stopRecording]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        toggleRecording();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRecording]);
  
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const isProcessing = status === 'transcribing' || status === 'enriching';
  
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      
      {/* Header */}
      <header 
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #262626' }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-black"
            style={{ background: '#f97316' }}
          >
            VI
          </div>
          <span className="font-semibold text-white">VoiceIntel</span>
        </div>
        
        {/* Right: Navigation */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleHistory()} 
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <Clock size={16} />
            <span>{t('history', language)}</span>
          </button>
          <button 
            onClick={() => toggleSettings()} 
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            style={{ background: '#f97316', color: 'white' }}
          >
            <SettingsIcon size={16} />
            <span>{t('settings', language)}</span>
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        
        {/* CONTAINER */}
        <div 
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}
        >
          
          {/* Recording Button - Always visible */}
          <section className="flex flex-col items-center text-center" style={{ gap: '16px' }}>
            <div className="relative">
              {status === 'recording' && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: '#f97316', opacity: 0.3 }}
                />
              )}
              <button
                onClick={toggleRecording}
                disabled={isProcessing}
                className="relative w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                style={{ 
                  background: status === 'recording' ? '#f97316' : '#262626',
                  border: status === 'recording' ? 'none' : '2px solid #404040'
                }}
              >
                {isProcessing ? (
                  <Loader2 size={28} className="animate-spin text-zinc-400" />
                ) : status === 'recording' ? (
                  <Square size={24} fill="white" color="white" />
                ) : (
                  <Mic size={28} style={{ color: '#f97316' }} />
                )}
              </button>
            </div>
            
            {status === 'recording' ? (
              <div className="flex flex-col items-center">
                <p className="text-xl font-mono font-medium" style={{ color: '#f97316' }}>{formatTime(recordingTime)}</p>
                <AudioWaveform isRecording={status === 'recording'} stream={mediaStream} />
              </div>
            ) : status === 'transcribing' ? (
              <LoadingIndicator type="transcribing" />
            ) : status === 'enriching' ? (
              <LoadingIndicator type="enriching" />
            ) : (
              <div>
                <p className="text-sm text-zinc-400">{t('clickToRecord', language)}</p>
                <p className="text-xs text-zinc-600">{t('orShortcut', language)}</p>
              </div>
            )}
            
            {errorMessage && (
              <p className="text-sm px-4 py-2 rounded-lg bg-red-500/10 text-red-400">
                {errorMessage}
              </p>
            )}
          </section>
          
          {/* Live Transcript während Aufnahme */}
          {status === 'recording' && liveTranscript && (
            <section
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#f97316' }}>
                LIVE
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">
                {liveTranscript}
              </p>
            </section>
          )}
          
          {/* 1. TRANSKRIPT-Section - Immer sichtbar */}
          <section
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4 text-zinc-500">
              {t('transcript', language)}
            </h2>
            {currentTranscript ? (
              <>
                <p className="text-base leading-relaxed text-white">
                  {currentTranscript}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #262626' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentTranscript);
                      setError(t('copied', language));
                      setTimeout(() => setError(null), 2000);
                    }}
                    className="text-xs px-3 py-1.5 rounded transition-all hover:bg-orange-500 hover:text-white"
                    style={{ background: '#262626', color: '#a1a1aa', border: '1px solid #404040' }}
                  >
                    {t('copyTranscript', language)}
                  </button>
                  <div className="flex gap-6 text-xs" style={{ color: '#525252' }}>
                    <span>{currentTranscript.trim().split(/\s+/).filter(w => w.length > 0).length} {t('words', language)}</span>
                    <span>{currentTranscript.length} {t('characters', language)}</span>
                  </div>
                </div>
              </>
            ) : status === 'transcribing' ? (
              <LoadingIndicator type="transcribing" />
            ) : (
              <p className="text-sm text-zinc-600">{t('noTranscriptYet', language)}</p>
            )}
          </section>
          
          {/* 2. FORMAT-Section - Immer sichtbar */}
          <section
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4 text-zinc-500">
              {t('selectFormat', language)}
            </h2>
            <ModeSelector onModeChange={handleModeChange} />
          </section>
          
          {/* 3. ERGEBNIS-Section - Immer sichtbar */}
          <section
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t('result', language)}
            </h2>
            {enrichedOutput ? (
              <>
                <div 
                  className="text-base leading-relaxed text-white whitespace-pre-wrap"
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  {enrichedOutput}
                </div>
                <TextStats text={enrichedOutput} />
                <ResultButtons />
              </>
            ) : status === 'enriching' ? (
              <LoadingIndicator type="enriching" />
            ) : (
              <p className="text-sm text-zinc-600">{t('selectFormatHint', language)}</p>
            )}
          </section>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer 
        className="grid grid-cols-3 items-center px-6 py-3 text-xs"
        style={{ borderTop: '1px solid #262626', color: '#666' }}
      >
        {/* Links: Status */}
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: openaiApiKey ? '#22c55e' : '#ef4444',
              boxShadow: openaiApiKey 
                ? '0 0 8px rgba(34, 197, 94, 0.6)' 
                : '0 0 8px rgba(239, 68, 68, 0.6)',
            }}
          />
          <span style={{ color: openaiApiKey ? '#22c55e' : '#ef4444' }}>
            {openaiApiKey ? t('ready', language) : t('apiKeyMissing', language)}
          </span>
        </div>
        
        {/* Mitte: Shortcut */}
        <div className="text-center" style={{ color: '#444' }}>
          Ctrl+Shift+V
        </div>
        
        {/* Rechts: Credit */}
        <div className="text-right" style={{ color: '#555' }}>
          Developed by <span style={{ color: '#f97316', fontWeight: 500 }}>mindric lab</span>
        </div>
      </footer>
      
      <Settings />
      <History />
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
