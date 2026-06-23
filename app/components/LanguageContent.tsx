'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { renderMixedText } from '../lib/mixedLanguageText';

interface LanguageContentProps {
  en: React.ReactNode;
  jp: React.ReactNode;
  className?: string;
  mixedLanguage?: boolean;
}

export function LanguageContent({
  en,
  jp,
  className = '',
  mixedLanguage = false,
}: LanguageContentProps) {
  const { language } = useLanguage();

  const isJapanese = language === 'jp';

  if (mixedLanguage && typeof en === 'string' && typeof jp === 'string') {
    const text = isJapanese ? jp : en;
    return (
      <span className={className}>
        {renderMixedText(text, isJapanese)}
      </span>
    );
  }

  const fontClass = isJapanese ? 'font-japanese' : 'font-english';
  const combinedClassName = `${fontClass} ${className}`.trim();

  return (
    <span className={combinedClassName}>
      {isJapanese ? jp : en}
    </span>
  );
}
