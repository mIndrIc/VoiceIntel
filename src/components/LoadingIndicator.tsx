'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';

interface LoadingIndicatorProps {
  type: 'transcribing' | 'enriching';
}

export function LoadingIndicator({ type }: LoadingIndicatorProps) {
  const { language } = useAppStore();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(5);
  
  const transcribingPhases = [
    t('audioProcessing', language),
    t('speechRecognition', language),
    t('textExtraction', language)
  ];
  
  const enrichingPhases = [
    t('textAnalysis', language),
    t('aiProcessing', language),
    t('outputFormatting', language)
  ];
  
  const phases = type === 'transcribing' ? transcribingPhases : enrichingPhases;
  
  useEffect(() => {
    // Phase wechseln alle 2 Sekunden
    const phaseInterval = setInterval(() => {
      setPhaseIndex(prev => (prev + 1) % phases.length);
    }, 2000);
    
    // Progress animieren
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 400);
    
    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, [phases.length]);
  
  return (
    <div className="flex flex-col gap-4">
      {/* Animated Dots + Text */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
        <span className="text-sm text-zinc-400">
          {phases[phaseIndex]}...
        </span>
      </div>
      
      {/* Progress Bar */}
      <div 
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: '#262626' }}
      >
        <div
          className="progress-bar"
          style={{ width: `${Math.min(progress, 95)}%` }}
        />
      </div>
    </div>
  );
}
