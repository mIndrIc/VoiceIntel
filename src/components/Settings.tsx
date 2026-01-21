'use client';

import { X, Mic, Sparkles, RefreshCw, Trash2, Info, Globe } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useEffect, useState, useRef, useCallback } from 'react';
import { audioRecorder } from '@/lib/audioRecorder';
import type { Language } from '@/lib/i18n';

export function Settings() {
  const {
    showSettings,
    toggleSettings,
    openaiApiKey,
    setOpenaiApiKey,
    anthropicApiKey,
    setAnthropicApiKey,
    selectedLLM,
    setSelectedLLM,
    availableMicrophones,
    selectedMicrophone,
    setSelectedMicrophone,
    setAvailableMicrophones,
    language,
    setLanguage,
  } = useAppStore();
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (showSettings) {
      setPosition({ x: 0, y: 0 });
      loadMicrophones();
    }
  }, [showSettings]);
  
  const loadMicrophones = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await audioRecorder.getAudioDevices();
      setAvailableMicrophones(devices);
    } catch (error) {
      console.log('Mic access error:', error);
    }
  };
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [position]);
  
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  if (!showSettings) return null;
  
  return (
    <div 
      className="fixed inset-0"
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleSettings();
      }}
    >
      {/* Modal - Absolute Center */}
      <div 
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          width: '420px',
          maxWidth: '95vw',
          backgroundColor: '#1c1c1e',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Draggable */}
        <div 
          style={{ 
            padding: '20px 24px',
            borderBottom: '1px solid #333',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onMouseDown={handleMouseDown}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#fff' }}>
            ⚙️ Einstellungen
          </h2>
          <button 
            onClick={toggleSettings}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              borderRadius: '6px',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Section: API Keys */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#f97316', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={14} />
              API Schlüssel
            </h3>
            
            {/* OpenAI Key */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>OpenAI API Key <span style={{ color: '#ef4444' }}>*</span></label>
                {openaiApiKey && (
                  <span style={{ fontSize: '11px', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    ✓ Aktiv
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    backgroundColor: '#0d0d0d',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                {openaiApiKey && (
                  <button
                    onClick={() => setOpenaiApiKey('')}
                    title="API Key löschen"
                    style={{
                      padding: '12px',
                      backgroundColor: '#0d0d0d',
                      border: '1px solid #333',
                      borderRadius: '10px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0d0d0d'}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                <strong>Pflicht:</strong> Für Whisper (Transkription) + optional GPT-4 (Anreicherung)
              </p>
            </div>
            
            {/* Anthropic Key */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>
                  Anthropic API Key <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span>
                </label>
                {anthropicApiKey && (
                  <span style={{ fontSize: '11px', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    ✓ Aktiv
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={anthropicApiKey}
                  onChange={(e) => setAnthropicApiKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    backgroundColor: '#0d0d0d',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                {anthropicApiKey && (
                  <button
                    onClick={() => {
                      setAnthropicApiKey('');
                      if (selectedLLM === 'anthropic') setSelectedLLM('openai');
                    }}
                    title="API Key löschen"
                    style={{
                      padding: '12px',
                      backgroundColor: '#0d0d0d',
                      border: '1px solid #333',
                      borderRadius: '10px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0d0d0d'}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                Nur nötig, wenn du Claude statt GPT-4 für die Anreicherung nutzen willst
              </p>
            </div>
            
            {/* Info Box */}
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '10px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <Info size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: '#93c5fd', margin: 0, lineHeight: '1.5' }}>
                Deine API Keys werden <strong>lokal im Browser</strong> gespeichert (localStorage) und bleiben nach Neustart erhalten. Sie werden niemals an einen Server gesendet.
              </p>
            </div>
          </div>
          
          {/* Section: KI-Modell */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#f97316', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              KI-Modell für Textanreicherung
            </h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
              Wähle, welches Modell deine Texte anreichern soll (Strukturieren, Zusammenfassen, etc.)
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedLLM('openai')}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: selectedLLM === 'openai' ? 'rgba(249, 115, 22, 0.15)' : '#0d0d0d',
                  border: selectedLLM === 'openai' ? '2px solid #f97316' : '1px solid #333',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: selectedLLM === 'openai' ? '#f97316' : '#fff' }}>
                  GPT-4
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>OpenAI</div>
              </button>
              
              <button
                onClick={() => anthropicApiKey && setSelectedLLM('anthropic')}
                disabled={!anthropicApiKey}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: selectedLLM === 'anthropic' ? 'rgba(249, 115, 22, 0.15)' : '#0d0d0d',
                  border: selectedLLM === 'anthropic' ? '2px solid #f97316' : '1px solid #333',
                  borderRadius: '12px',
                  cursor: anthropicApiKey ? 'pointer' : 'not-allowed',
                  opacity: anthropicApiKey ? 1 : 0.4,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: selectedLLM === 'anthropic' ? '#f97316' : '#fff' }}>
                  Claude
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Anthropic</div>
              </button>
            </div>
            
            <p style={{ fontSize: '11px', color: '#555', marginTop: '12px', fontStyle: 'italic' }}>
              💡 Hinweis: Whisper (OpenAI) wird immer für die Transkription verwendet. Hier wählst du nur das Modell für die Anreicherung.
            </p>
          </div>
          
          {/* Section: Audio */}
          <div>
            <h3 style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#f97316', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Mic size={14} />
              Audio-Einstellungen
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', color: '#fff', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                Mikrofon
              </label>
              <select
                value={selectedMicrophone || ''}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#0d0d0d',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Standard-Mikrofon</option>
                {availableMicrophones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Mikrofon ${mic.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={loadMicrophones}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px',
                backgroundColor: 'transparent',
                border: '1px dashed #444',
                borderRadius: '10px',
                color: '#888',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888'; }}
            >
              <RefreshCw size={14} />
              Mikrofone neu laden
            </button>
          </div>
          
          {/* Section: Sprache */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#f97316', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Globe size={14} />
              Sprache / Language
            </h3>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setLanguage('de')}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: language === 'de' ? 'rgba(249, 115, 22, 0.15)' : '#0d0d0d',
                  border: language === 'de' ? '2px solid #f97316' : '1px solid #333',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>🇩🇪</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: language === 'de' ? '#f97316' : '#fff' }}>
                  Deutsch
                </div>
              </button>
              
              <button
                onClick={() => setLanguage('en')}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: language === 'en' ? 'rgba(249, 115, 22, 0.15)' : '#0d0d0d',
                  border: language === 'en' ? '2px solid #f97316' : '1px solid #333',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>🇬🇧</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: language === 'en' ? '#f97316' : '#fff' }}>
                  English
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #333',
          backgroundColor: '#151515',
        }}>
          <button
            onClick={toggleSettings}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#f97316',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
          >
            Speichern & Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
