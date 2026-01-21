'use client';

import { X, FileText, FileCode, File, Download } from 'lucide-react';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

type FileFormat = 'txt' | 'md' | 'pdf' | 'json';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  enrichedText: string;
  mode: string;
}

const FORMAT_OPTIONS: { id: FileFormat; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'txt', label: 'Text (.txt)', icon: <FileText size={20} />, description: 'Einfache Textdatei' },
  { id: 'md', label: 'Markdown (.md)', icon: <FileCode size={20} />, description: 'Formatierter Text für Notion, Obsidian, etc.' },
  { id: 'pdf', label: 'PDF (.pdf)', icon: <File size={20} />, description: 'Druckfertiges Dokument' },
  { id: 'json', label: 'JSON (.json)', icon: <FileCode size={20} />, description: 'Strukturierte Daten' },
];

export function SaveDialog({ isOpen, onClose, transcript, enrichedText, mode }: SaveDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('txt');
  const [fileName, setFileName] = useState('voiceintel-export');
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeEnriched, setIncludeEnriched] = useState(true);

  if (!isOpen) return null;

  const generateContent = () => {
    const timestamp = new Date().toLocaleString('de-DE');
    let content = '';
    
    // Bestimme das Label für die angereicherte Ausgabe basierend auf dem Modus
    const enrichedLabel = mode === 'Original' ? 'Original' : mode;

    if (selectedFormat === 'json') {
      return JSON.stringify({
        exportDate: timestamp,
        mode: mode,
        transcript: includeTranscript ? transcript : undefined,
        [mode.toLowerCase()]: includeEnriched ? enrichedText : undefined,
      }, null, 2);
    }

    if (selectedFormat === 'md') {
      content += `# VoiceIntel Export\n\n`;
      content += `**Datum:** ${timestamp}\n`;
      content += `**Modus:** ${mode}\n\n`;
      content += `---\n\n`;
      
      if (includeTranscript && transcript) {
        content += `## Transkript\n\n${transcript}\n\n`;
      }
      if (includeEnriched && enrichedText) {
        content += `## ${enrichedLabel}\n\n${enrichedText}\n`;
      }
    } else {
      // TXT format
      content += `VoiceIntel Export\n`;
      content += `==================\n\n`;
      content += `Datum: ${timestamp}\n`;
      content += `Modus: ${mode}\n\n`;
      content += `---\n\n`;
      
      if (includeTranscript && transcript) {
        content += `TRANSKRIPT:\n\n${transcript}\n\n`;
      }
      if (includeEnriched && enrichedText) {
        content += `${enrichedLabel.toUpperCase()}:\n\n${enrichedText}\n`;
      }
    }

    return content;
  };

  const handleSave = () => {
    const content = generateContent();
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${timestamp}`;

    if (selectedFormat === 'pdf') {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('VoiceIntel Export', margin, 25);
      
      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Datum: ${new Date().toLocaleString('de-DE')}`, margin, 35);
      doc.text(`Modus: ${mode}`, margin, 42);
      
      let yPosition = 55;
      doc.setTextColor(0);
      
      // Transcript
      if (includeTranscript && transcript) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Transkript', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const transcriptLines = doc.splitTextToSize(transcript, maxWidth);
        transcriptLines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }
      
      // Enriched Text
      if (includeEnriched && enrichedText) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(mode === 'Original' ? 'Original' : mode, margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const enrichedLines = doc.splitTextToSize(enrichedText, maxWidth);
        enrichedLines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
      }
      
      doc.save(`${fullFileName}.pdf`);
    } else {
      const mimeTypes: Record<FileFormat, string> = {
        txt: 'text/plain;charset=utf-8',
        md: 'text/markdown;charset=utf-8',
        json: 'application/json;charset=utf-8',
        pdf: 'application/pdf',
      };
      
      const blob = new Blob([content], { type: mimeTypes[selectedFormat] });
      saveAs(blob, `${fullFileName}.${selectedFormat}`);
    }
    
    onClose();
  };

  return (
    <div 
      className="fixed inset-0"
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '450px',
          maxWidth: '95vw',
          backgroundColor: '#1c1c1e',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
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
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} style={{ color: '#f97316' }} />
            Exportieren
          </h2>
          <button 
            onClick={onClose}
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
          
          {/* Filename */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: '#888', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
              Dateiname
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              style={{
                width: '100%',
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
          </div>
          
          {/* Format Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: '#888', fontWeight: 500, display: 'block', marginBottom: '12px' }}>
              Format wählen
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  style={{
                    padding: '14px',
                    backgroundColor: selectedFormat === format.id ? 'rgba(249, 115, 22, 0.15)' : '#0d0d0d',
                    border: selectedFormat === format.id ? '2px solid #f97316' : '1px solid #333',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ color: selectedFormat === format.id ? '#f97316' : '#666' }}>
                    {format.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: selectedFormat === format.id ? '#f97316' : '#fff' }}>
                      {format.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                      {format.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Include Options */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#888', fontWeight: 500, display: 'block', marginBottom: '12px' }}>
              Inhalt
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px',
              backgroundColor: '#0d0d0d',
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: '8px',
            }}>
              <input
                type="checkbox"
                checked={includeTranscript}
                onChange={(e) => setIncludeTranscript(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: '#f97316',
                  cursor: 'pointer',
                }}
              />
              <div>
                <div style={{ fontSize: '13px', color: '#fff' }}>Transkript</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Original-Sprachaufnahme als Text</div>
              </div>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px',
              backgroundColor: '#0d0d0d',
              borderRadius: '10px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={includeEnriched}
                onChange={(e) => setIncludeEnriched(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: '#f97316',
                  cursor: 'pointer',
                }}
              />
              <div>
                <div style={{ fontSize: '13px', color: '#fff' }}>Angereicherte Ausgabe</div>
                <div style={{ fontSize: '11px', color: '#666' }}>KI-verarbeiteter Text</div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #333',
          backgroundColor: '#151515',
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: 'transparent',
              border: '1px solid #333',
              borderRadius: '10px',
              color: '#888',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!includeTranscript && !includeEnriched}
            style={{
              flex: 2,
              padding: '14px',
              backgroundColor: '#f97316',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (!includeTranscript && !includeEnriched) ? 'not-allowed' : 'pointer',
              opacity: (!includeTranscript && !includeEnriched) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => { if (includeTranscript || includeEnriched) e.currentTarget.style.backgroundColor = '#ea580c'; }}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
          >
            <Download size={16} />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
