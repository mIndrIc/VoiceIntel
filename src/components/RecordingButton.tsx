'use client';

import { Mic, Square, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface RecordingButtonProps {
  onToggleRecording: () => void;
}

export function RecordingButton({ onToggleRecording }: RecordingButtonProps) {
  const { status, recordingTime } = useAppStore();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Klicke zum Aufnehmen';
      case 'recording':
        return formatTime(recordingTime);
      case 'transcribing':
        return 'Transkribiere...';
      case 'enriching':
        return 'Verarbeite...';
      case 'done':
        return 'Neue Aufnahme starten';
      case 'error':
        return 'Erneut versuchen';
      default:
        return '';
    }
  };
  
  const isProcessing = status === 'transcribing' || status === 'enriching';
  
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Main Button - 120px wie in der Spec */}
      <button
        className={`
          relative w-[120px] h-[120px] rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}
          ${status === 'recording' 
            ? 'bg-[var(--color-accent)] scale-110 shadow-[0_0_60px_rgba(255,165,0,0.5)]' 
            : 'bg-transparent border-[3px] border-[var(--color-accent)] hover:shadow-[0_0_40px_rgba(255,165,0,0.3)] hover:scale-105'
          }
          ${isProcessing ? 'bg-[var(--color-accent)] opacity-80' : ''}
        `}
        onClick={onToggleRecording}
        disabled={isProcessing}
        aria-label={status === 'recording' ? 'Aufnahme stoppen' : 'Aufnahme starten'}
      >
        {/* Pulse Ring Animation */}
        {status === 'recording' && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: 'var(--color-accent)' }} />
            <span className="absolute inset-[-8px] rounded-full border-2 border-[var(--color-accent)] animate-pulse opacity-50" />
          </>
        )}
        
        {/* Icon */}
        {isProcessing ? (
          <Loader2 
            size={48} 
            className="animate-spin" 
            style={{ color: 'var(--color-background)' }} 
          />
        ) : status === 'recording' ? (
          <Square 
            size={36} 
            fill="var(--color-background)" 
            style={{ color: 'var(--color-background)' }} 
          />
        ) : (
          <Mic 
            size={48} 
            style={{ color: 'var(--color-accent)' }} 
          />
        )}
      </button>
      
      {/* Status Text */}
      <p 
        className={`text-base font-medium transition-all ${status === 'recording' ? 'text-[var(--color-accent)]' : ''}`}
        style={{ color: status === 'recording' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
      >
        {getStatusText()}
      </p>
      
      {/* Waveform Visualization */}
      {status === 'recording' && (
        <div className="flex items-end justify-center gap-1.5 h-8">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-1.5 rounded-full waveform-bar"
              style={{
                background: 'var(--color-accent)',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
