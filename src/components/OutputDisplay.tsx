'use client';

import { Copy, Save, RotateCcw, Check } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';

export function OutputDisplay() {
  const { 
    enrichedOutput, 
    currentTranscript, 
    status, 
    reset, 
    addHistoryEntry, 
    selectedMode,
    selectedContextType 
  } = useAppStore();
  
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(enrichedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };
  
  const handleSave = () => {
    addHistoryEntry({
      transcript: currentTranscript,
      enrichedText: enrichedOutput,
      mode: selectedMode,
      contextType: selectedMode === 'context' ? selectedContextType : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  if (!enrichedOutput || status !== 'done' || selectedMode === 'original') {
    return null;
  }
  
  return (
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
      {/* Überschrift */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        ERGEBNIS
      </h2>
      
      {/* Textausgabe */}
      <div 
        className="text-base leading-relaxed text-white whitespace-pre-wrap"
        style={{ maxHeight: '300px', overflowY: 'auto' }}
      >
        {enrichedOutput}
      </div>
      
      {/* Buttons unten rechts */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: '#262626',
            color: '#a1a1aa',
            border: '1px solid #404040'
          }}
        >
          <RotateCcw size={14} />
          <span>Neu</span>
        </button>
        
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: saved ? 'rgba(34, 197, 94, 0.2)' : '#262626',
            color: saved ? '#22c55e' : '#a1a1aa',
            border: saved ? '1px solid #22c55e' : '1px solid #404040'
          }}
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          <span>{saved ? 'Gespeichert!' : 'Speichern'}</span>
        </button>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: copied ? 'rgba(34, 197, 94, 0.2)' : '#f97316',
            color: copied ? '#22c55e' : 'white',
            border: copied ? '1px solid #22c55e' : 'none'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
        </button>
      </div>
    </section>
  );
}
