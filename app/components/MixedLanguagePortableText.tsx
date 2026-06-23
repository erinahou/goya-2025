'use client';

import { PortableText, type PortableTextComponents } from "next-sanity";
import type { TypedObject } from "@portabletext/types";
import { useLanguage } from "../contexts/LanguageContext";
import {
  ENGLISH_FONT_MARK,
  preprocessPortableTextForMixedLanguage,
} from "../lib/mixedLanguageText";

const japaneseComponents: PortableTextComponents = {
  marks: {
    [ENGLISH_FONT_MARK]: ({ children }) => (
      <span className="font-english">{children}</span>
    ),
    link: ({ children, value }) => (
      <a href={value?.href} rel="noreferrer">
        {children}
      </a>
    ),
  },
  block: {
    normal: ({ children }) => <p className="font-japanese">{children}</p>,
  },
};

const englishComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="font-english">{children}</p>,
  },
};

interface MixedLanguagePortableTextProps {
  valueEn: TypedObject | TypedObject[] | null | undefined;
  valueJp: TypedObject | TypedObject[] | null | undefined;
}

export function MixedLanguagePortableText({
  valueEn,
  valueJp,
}: MixedLanguagePortableTextProps) {
  const { language } = useLanguage();
  const isJapanese = language === "jp";
  const value = (isJapanese ? valueJp : valueEn) ?? [];
  const processedValue = (
    isJapanese ? preprocessPortableTextForMixedLanguage(value) : value
  ) as TypedObject | TypedObject[];

  return (
    <PortableText
      value={processedValue}
      components={isJapanese ? japaneseComponents : englishComponents}
    />
  );
}
