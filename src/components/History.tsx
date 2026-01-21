'use client';

import { X, Copy, Trash2, Clock, ChevronDown, ChevronUp, Check, FileText } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function History() {
  const { showHistory, toggleHistory, history, clearHistory } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await invoke('copy_to_clipboard', { text });
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      original: 'Original',
      structured: 'Strukturiert',
      summary: 'Zusammenfassung',
      context: 'Kontext',
    };
    return labels[mode] || mode;
  };
  
  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      original: '#6b7280',
      structured: '#3b82f6',
      summary: '#8b5cf6',
      context: '#f97316',
    };
    return colors[mode] || '#6b7280';
  };
  
  if (!showHistory) return null;
  
  return (
    <div 
      className="fixed inset-0"
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleHistory();
      }}
    >
      <div 
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          backgroundColor: '#1c1c1e',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px 24px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} style={{ color: '#f97316' }} />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#fff' }}>
              Verlauf
            </h2>
            {history.length > 0 && (
              <span style={{ 
                fontSize: '12px', 
                backgroundColor: '#333', 
                color: '#888', 
                padding: '2px 8px', 
                borderRadius: '10px' 
              }}>
                {history.length} {history.length === 1 ? 'Eintrag' : 'Einträge'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Möchtest du den gesamten Verlauf löschen?')) {
                    clearHistory();
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Trash2 size={14} />
                Alle löschen
              </button>
            )}
            <button 
              onClick={toggleHistory}
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
        </div>
        
        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px',
        }}>
          {history.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center',
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: '#262626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <FileText size={28} style={{ color: '#555' }} />
              </div>
              <p style={{ fontSize: '15px', color: '#888', marginBottom: '8px' }}>
                Noch keine Einträge
              </p>
              <p style={{ fontSize: '13px', color: '#555' }}>
                Deine gespeicherten Aufnahmen erscheinen hier
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const isCopied = copiedId === entry.id;
                
                return (
                  <div 
                    key={entry.id}
                    style={{ 
                      backgroundColor: '#0d0d0d',
                      borderRadius: '12px',
                      border: '1px solid #262626',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Card Header */}
                    <div 
                      style={{ 
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Meta Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {formatDate(entry.timestamp)}
                          </span>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 600,
                            backgroundColor: `${getModeColor(entry.mode)}20`,
                            color: getModeColor(entry.mode),
                            padding: '2px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            {getModeLabel(entry.mode)}
                          </span>
                        </div>
                        
                        {/* Preview */}
                        <p style={{ 
                          fontSize: '13px', 
                          color: '#ccc',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.5',
                        }}>
                          {entry.enrichedText}
                        </p>
                      </div>
                      
                      {/* Expand Icon */}
                      <div style={{ color: '#666', flexShrink: 0 }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #262626' }}>
                        {/* Original Transcript */}
                        <div style={{ padding: '14px 16px', backgroundColor: '#080808' }}>
                          <p style={{ fontSize: '11px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Transkript
                          </p>
                          <p style={{ fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.5' }}>
                            {entry.transcript}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div style={{ 
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '8px',
                          borderTop: '1px solid #262626',
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(entry.enrichedText, entry.id);
                            }}
                            style={{
                              padding: '8px 14px',
                              backgroundColor: isCopied ? 'rgba(34, 197, 94, 0.15)' : '#1a1a1a',
                              border: isCopied ? '1px solid #22c55e' : '1px solid #333',
                              borderRadius: '8px',
                              color: isCopied ? '#22c55e' : '#fff',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            {isCopied ? 'Kopiert!' : 'Kopieren'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #333',
          backgroundColor: '#151515',
          flexShrink: 0,
        }}>
          <button
            onClick={toggleHistory}
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
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
