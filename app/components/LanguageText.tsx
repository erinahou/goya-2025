'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { renderMixedText } from '../lib/mixedLanguageText';

interface LanguageTextProps {
  en: string;
  jp: string;
  className?: string;
  mixedLanguage?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function LanguageText({
  en,
  jp,
  className = '',
  mixedLanguage = false,
  as: Component = 'span',
}: LanguageTextProps) {
  const { language } = useLanguage();

  const isJapanese = language === 'jp';
  const text = isJapanese ? jp : en;

  if (mixedLanguage) {
    return (
      <Component className={className}>
        {renderMixedText(text, isJapanese)}
      </Component>
    );
  }

  const fontClass = isJapanese ? 'font-japanese' : 'font-english';
  const combinedClassName = `${fontClass} ${className}`.trim();

  return <Component className={combinedClassName}>{text}</Component>;
}
