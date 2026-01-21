'use client';

import { ChevronDown } from 'lucide-react';
import { useAppStore, EnrichmentMode, ContextType, CONTEXT_TYPE_LABELS } from '@/stores/appStore';

const modes: { id: EnrichmentMode; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'structured', label: 'Strukturiert' },
  { id: 'summary', label: 'Zusammenfassung' },
  { id: 'context', label: 'Kontext' },
];

interface ModeSelectorProps {
  onModeChange?: (mode: EnrichmentMode, contextType?: ContextType) => void;
}

export function ModeSelector({ onModeChange }: ModeSelectorProps) {
  const { 
    selectedMode, 
    setSelectedMode, 
    selectedContextType, 
    setSelectedContextType,
    currentTranscript,
    isReprocessing
  } = useAppStore();
  
  const handleModeChange = (mode: EnrichmentMode) => {
    if (isReprocessing) return;
    setSelectedMode(mode);
    if (currentTranscript && onModeChange) {
      onModeChange(mode, mode === 'context' ? selectedContextType : undefined);
    }
  };
  
  const handleContextTypeChange = (type: ContextType) => {
    if (isReprocessing) return;
    setSelectedContextType(type);
    if (currentTranscript && selectedMode === 'context' && onModeChange) {
      onModeChange('context', type);
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 4 Buttons horizontal */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {modes.map((mode) => {
          const isActive = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={isReprocessing}
              className="flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive ? '#f97316' : '#262626',
                color: isActive ? 'white' : '#a1a1aa',
                border: isActive ? 'none' : '1px solid #404040',
                opacity: isReprocessing ? 0.5 : 1,
                cursor: isReprocessing ? 'not-allowed' : 'pointer'
              }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
      
      {/* Context Dropdown */}
      {selectedMode === 'context' && (
        <div className="relative">
          <select
            value={selectedContextType}
            onChange={(e) => handleContextTypeChange(e.target.value as ContextType)}
            disabled={isReprocessing}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-lg text-sm font-medium"
            style={{
              background: '#262626',
              border: '2px solid #f97316',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {Object.entries(CONTEXT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown 
            size={16} 
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#f97316' }}
          />
        </div>
      )}
      
      {/* Processing */}
      {isReprocessing && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div 
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#f97316', borderTopColor: 'transparent' }}
          />
          <span className="text-sm text-zinc-400">Verarbeite...</span>
        </div>
      )}
    </div>
  );
}
