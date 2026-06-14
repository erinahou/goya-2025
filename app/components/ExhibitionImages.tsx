'use client';

import Image from "next/image";
import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FadeInOnScroll } from "./FadeInOnScroll";
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
        {images.map((img, index) => (
          <FadeInOnScroll
            key={index}
            className={`exhibition-image-container ${img.isVertical ? "has-vertical-image" : ""}`}
          >
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
            {img.captionEn && (
              <p className="exhibition-image-caption">{img.captionEn}</p>
            )}
          </FadeInOnScroll>
        ))}
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
