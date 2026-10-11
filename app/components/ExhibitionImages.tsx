'use client';

import Image from "next/image";
import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { FadeInOnScroll } from "./FadeInOnScroll";
import { LanguageContent } from "./LanguageContent";
import {
  ExhibitionImageCarousel,
  type ExhibitionCarouselImage,
} from "./ExhibitionImageCarousel";

interface ExhibitionImagesProps {
  images: ExhibitionCarouselImage[];
}

function ExhibitionImagesContent({ images }: ExhibitionImagesProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const openCarousel = useCallback(
    (index: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("image", String(index));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <>
      <div className="exhibition-images">
        {images.map((img, index) => {
          const captionEn = img.captionEn || "";
          const captionJa = img.captionJa || captionEn;
          const hasCaption =
            language === "jp" ? Boolean(captionJa) : Boolean(captionEn);

          const imageButton = (
            <button
              type="button"
              className={`exhibition-image-button ${img.isVertical ? "exhibition-image-vertical" : "exhibition-image-horizontal"}`}
              onClick={() => openCarousel(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="exhibition-image"
              />
            </button>
          );

          const caption = hasCaption ? (
            <p className="exhibition-image-caption">
              <LanguageContent
                en={captionEn}
                jp={captionJa}
                mixedLanguage
              />
            </p>
          ) : null;

          return (
            <FadeInOnScroll
              key={index}
              className={`exhibition-image-container ${img.isVertical ? "has-vertical-image" : ""}`}
            >
              {img.isVertical ? (
                <div className="exhibition-image-vertical-stack">
                  {imageButton}
                  {caption}
                </div>
              ) : (
                <>
                  {imageButton}
                  {caption}
                </>
              )}
            </FadeInOnScroll>
          );
        })}
      </div>
      <ExhibitionImageCarousel images={images} />
    </>
  );
}

export function ExhibitionImages({ images }: ExhibitionImagesProps) {
  return (
    <Suspense fallback={null}>
      <ExhibitionImagesContent images={images} />
    </Suspense>
  );
}
