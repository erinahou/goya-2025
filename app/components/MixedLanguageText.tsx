'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { renderMixedText } from '../lib/mixedLanguageText';

interface MixedLanguageTextProps {
  en: string;
  jp: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function MixedLanguageText({
  en,
  jp,
  className = '',
  as: Component = 'span',
}: MixedLanguageTextProps) {
  const { language } = useLanguage();

  const isJapanese = language === 'jp';
  const text = isJapanese ? jp : en;

  return (
    <Component className={className}>
      {renderMixedText(text, isJapanese)}
    </Component>
  );
}
