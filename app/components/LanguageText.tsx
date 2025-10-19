'use client';

import { useLanguage } from '../contexts/LanguageContext';

interface LanguageTextProps {
  en: string;
  jp: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function LanguageText({ en, jp, className = '', as: Component = 'span' }: LanguageTextProps) {
  const { language } = useLanguage();

  const isJapanese = language === 'jp';
  const text = isJapanese ? jp : en;

  // Apply appropriate font class based on language
  const fontClass = isJapanese ? 'font-japanese' : 'font-english';
  const combinedClassName = `${fontClass} ${className}`.trim();

  return <Component className={combinedClassName}>{text}</Component>;
}
