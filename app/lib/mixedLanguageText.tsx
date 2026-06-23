import type { ReactNode } from "react";

export const ENGLISH_FONT_MARK = "englishFont";

const LATIN_CHAR = /[a-zA-Z0-9]/;
const LATIN_PUNCTUATION = /[@._\-/:]/;

export function isLatinChar(char: string): boolean {
  return LATIN_CHAR.test(char);
}

export function splitTextIntoSegments(
  text: string
): Array<{ text: string; isEnglish: boolean }> {
  const segments: Array<{ text: string; isEnglish: boolean }> = [];
  let currentSegment = "";
  let currentIsEnglish: boolean | null = null;

  for (const char of text) {
    let charIsEnglish = isLatinChar(char);

    if (
      !charIsEnglish &&
      currentIsEnglish === true &&
      LATIN_PUNCTUATION.test(char)
    ) {
      charIsEnglish = true;
    }

    if (currentIsEnglish === null) {
      currentIsEnglish = charIsEnglish;
      currentSegment = char;
      continue;
    }

    if (charIsEnglish !== currentIsEnglish) {
      segments.push({ text: currentSegment, isEnglish: currentIsEnglish });
      currentSegment = char;
      currentIsEnglish = charIsEnglish;
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment) {
    segments.push({
      text: currentSegment,
      isEnglish: currentIsEnglish ?? false,
    });
  }

  return segments;
}

export function renderMixedText(text: string, isJapanese: boolean): ReactNode {
  if (!isJapanese) {
    return <span className="font-english">{text}</span>;
  }

  const segments = splitTextIntoSegments(text);

  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={segment.isEnglish ? "font-english" : "font-japanese"}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}

export function preprocessPortableTextForMixedLanguage(
  blocks: unknown
): unknown {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map((block) => {
    if (
      typeof block !== "object" ||
      block === null ||
      (block as { _type?: string })._type !== "block" ||
      !Array.isArray((block as { children?: unknown[] }).children)
    ) {
      return block;
    }

    const typedBlock = block as {
      children: Array<{
        _type?: string;
        _key?: string;
        text?: string;
        marks?: string[];
      }>;
    };

    const newChildren = typedBlock.children.flatMap((child, childIndex) => {
      if (child._type !== "span" || typeof child.text !== "string") {
        return [child];
      }

      const segments = splitTextIntoSegments(child.text);

      if (segments.length === 1 && !segments[0].isEnglish) {
        return [child];
      }

      return segments.map((segment, segmentIndex) => {
        const marks = [...(child.marks || [])];

        if (segment.isEnglish && !marks.includes(ENGLISH_FONT_MARK)) {
          marks.push(ENGLISH_FONT_MARK);
        }

        return {
          ...child,
          _key: `${child._key || `span-${childIndex}`}-mixed-${segmentIndex}`,
          text: segment.text,
          marks,
        };
      });
    });

    return { ...block, children: newChildren };
  });
}
