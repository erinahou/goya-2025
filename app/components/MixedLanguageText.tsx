'use client';

import { useLanguage } from '../contexts/LanguageContext';

interface MixedLanguageTextProps {
  en: string;
  jp: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

// Function to detect if a character is English (Latin alphabet)
function isEnglishChar(char: string): boolean {
  return /[a-zA-Z]/.test(char);
}

// Function to split text into segments and apply appropriate fonts
function renderMixedLanguageText(text: string, isJapanese: boolean) {
  if (!isJapanese) {
    // For English content, use ROM font for everything
    return <span className="font-english">{text}</span>;
  }

  // For Japanese content, detect English segments
  const segments: Array<{ text: string; isEnglish: boolean }> = [];
  let currentSegment = '';
  let currentIsEnglish = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charIsEnglish = isEnglishChar(char);

    // If this is the first character, set the initial state
    if (i === 0) {
      currentIsEnglish = charIsEnglish;
      currentSegment = char;
    }
    // If the character type changes, save the current segment and start a new one
    else if (charIsEnglish !== currentIsEnglish) {
      segments.push({ text: currentSegment, isEnglish: currentIsEnglish });
      currentSegment = char;
      currentIsEnglish = charIsEnglish;
    }
    // If the character type is the same, add to current segment
    else {
      currentSegment += char;
    }
  }

  // Don't forget the last segment
  if (currentSegment) {
    segments.push({ text: currentSegment, isEnglish: currentIsEnglish });
  }

  // Render segments with appropriate fonts
  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={segment.isEnglish ? 'font-english' : 'font-japanese'}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

export function MixedLanguageText({ en, jp, className = '', as: Component = 'span' }: MixedLanguageTextProps) {
  const { language } = useLanguage();

  const isJapanese = language === 'jp';
  const text = isJapanese ? jp : en;

  return (
    <Component className={className}>
      {renderMixedLanguageText(text, isJapanese)}
    </Component>
  );
}
