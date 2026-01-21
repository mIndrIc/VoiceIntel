'use client';

import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';

interface TextStatsProps {
  text: string;
}

export function TextStats({ text }: TextStatsProps) {
  const { language } = useAppStore();
  
  if (!text || text.trim().length === 0) return null;
  
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  return (
    <div 
      className="flex items-center justify-end mt-3 pt-3"
      style={{ borderTop: '1px solid #262626', gap: '24px' }}
    >
      <span className="text-xs" style={{ color: '#525252' }}>
        {wordCount} {wordCount === 1 ? t('word', language) : t('words', language)}
      </span>
      <span className="text-xs" style={{ color: '#525252' }}>
        {charCount} {t('characters', language)}
      </span>
    </div>
  );
}
