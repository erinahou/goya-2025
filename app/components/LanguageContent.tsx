'use client';

import { useLanguage } from '../contexts/LanguageContext';

interface LanguageContentProps {
  en: React.ReactNode;
  jp: React.ReactNode;
  className?: string;
  mixedLanguage?: boolean; // New prop to enable mixed language handling
}

// Function to detect if a character is English (Latin alphabet)
function isEnglishChar(char: string): boolean {
  return /[a-zA-Z]/.test(char);
}

// Function to render text with mixed language support
function renderMixedText(text: string, isJapanese: boolean) {
  if (!isJapanese) {
    return <span className="font-english">{text}</span>;
  }

  const segments: Array<{ text: string; isEnglish: boolean }> = [];
  let currentSegment = '';
  let currentIsEnglish = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charIsEnglish = isEnglishChar(char);

    if (i === 0) {
      currentIsEnglish = charIsEnglish;
      currentSegment = char;
    } else if (charIsEnglish !== currentIsEnglish) {
      segments.push({ text: currentSegment, isEnglish: currentIsEnglish });
      currentSegment = char;
      currentIsEnglish = charIsEnglish;
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment) {
    segments.push({ text: currentSegment, isEnglish: currentIsEnglish });
  }

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

// Function to process PortableText content for mixed language
function processPortableTextForMixedLanguage(content: any, isJapanese: boolean) {
  if (!isJapanese || !content) return content;

  // Recursively process PortableText content
  function processNode(node: any): any {
    if (node._type === 'block' && node.children) {
      return {
        ...node,
        children: node.children.map((child: any) => {
          if (child._type === 'span' && child.text) {
            // For Japanese content, we'll let the CSS handle the font
            // Just return the original content
            return child;
          }
          return processNode(child);
        })
      };
    }
    return node;
  }

  if (Array.isArray(content)) {
    return content.map(processNode);
  }
  return processNode(content);
}

export function LanguageContent({ en, jp, className = '', mixedLanguage = false }: LanguageContentProps) {
  const { language } = useLanguage();

  const isJapanese = language === 'jp';

  // If mixedLanguage is true and content is text, apply mixed language rendering
  if (mixedLanguage && typeof en === 'string' && typeof jp === 'string') {
    const text = isJapanese ? jp : en;
    return (
      <span className={className}>
        {renderMixedText(text, isJapanese)}
      </span>
    );
  }

  // Handle PortableText with mixed language support
  if (mixedLanguage && isJapanese && jp) {
    const processedContent = processPortableTextForMixedLanguage(jp, isJapanese);
    const fontClass = 'font-japanese';
    const combinedClassName = `${fontClass} ${className}`.trim();
    return (
      <span className={combinedClassName}>
        {processedContent}
      </span>
    );
  }

  // Default behavior for complex content (like PortableText)
  const fontClass = isJapanese ? 'font-japanese' : 'font-english';
  const combinedClassName = `${fontClass} ${className}`.trim();

  return (
    <span className={combinedClassName}>
      {isJapanese ? jp : en}
    </span>
  );
}
