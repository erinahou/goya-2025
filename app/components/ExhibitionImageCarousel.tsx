'use client';

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ExhibitionCarouselImage = {
  src: string;
  alt: string;
  captionEn: string;
  isVertical: boolean;
  width: number;
  height: number;
};

interface ExhibitionImageCarouselProps {
  images: ExhibitionCarouselImage[];
}

type CarouselNavAction = 'prev' | 'next' | null;

function parseImageIndex(value: string | null, total: number) {
  if (value === null) return null;

  const index = Number.parseInt(value, 10);
  if (Number.isNaN(index) || index < 0 || index >= total) return null;

  return index;
}

export function ExhibitionImageCarousel({ images }: ExhibitionImageCarouselProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeIndex = parseImageIndex(searchParams.get("image"), images.length);
  const isOpen = activeIndex !== null;
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [navAction, setNavAction] = useState<CarouselNavAction>(null);

  const updateIndex = useCallback(
    (index: number | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (index === null) {
        params.delete("image");
      } else {
        params.set("image", String(index));
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const closeCarousel = useCallback(() => updateIndex(null), [updateIndex]);

  const goNext = useCallback(() => {
    if (activeIndex === null || activeIndex >= images.length - 1) return;
    updateIndex(activeIndex + 1);
  }, [activeIndex, images.length, updateIndex]);

  const goPrev = useCallback(() => {
    if (activeIndex === null || activeIndex <= 0) return;
    updateIndex(activeIndex - 1);
  }, [activeIndex, updateIndex]);

  const updateNavFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const viewport = viewportRef.current;
      if (!viewport || activeIndex === null) return;

      const rect = viewport.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const isLeftHalf = relativeX < rect.width / 2;

      setCursorPos({ x: clientX, y: clientY });

      if (isLeftHalf && activeIndex > 0) {
        setNavAction("prev");
        return;
      }

      if (!isLeftHalf && activeIndex < images.length - 1) {
        setNavAction("next");
        return;
      }

      setNavAction(null);
    },
    [activeIndex, images.length]
  );

  const handleViewportMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      updateNavFromPointer(event.clientX, event.clientY);
    },
    [updateNavFromPointer]
  );

  const handleViewportMouseLeave = useCallback(() => {
    setCursorPos(null);
    setNavAction(null);
  }, []);

  const handleViewportClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      if (!viewport || activeIndex === null) return;

      const rect = viewport.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const isLeftHalf = relativeX < rect.width / 2;

      if (isLeftHalf && activeIndex > 0) {
        goPrev();
        return;
      }

      if (!isLeftHalf && activeIndex < images.length - 1) {
        goNext();
      }
    },
    [activeIndex, goNext, goPrev, images.length]
  );

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => setIsMounted(false), 400);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    document.body.classList.toggle("image-carousel-open", isOpen);

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("image-carousel-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCursorPos(null);
      setNavAction(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCarousel();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCarousel, goNext, goPrev, isOpen]);

  if (!isMounted || activeIndex === null) return null;

  return (
    <div
      className={`image-carousel ${isVisible ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Exhibition image viewer"
    >
      <div className="image-carousel-top">
        <p className="image-carousel-count">
          {activeIndex + 1} of {images.length}
        </p>
        <button type="button" className="image-carousel-close" onClick={closeCarousel}>
          Close
        </button>
      </div>

      <div
        ref={viewportRef}
        className={`image-carousel-viewport ${navAction ? `is-${navAction}` : ""}`}
        onMouseMove={handleViewportMouseMove}
        onMouseLeave={handleViewportMouseLeave}
        onClick={handleViewportClick}
      >
        <div
          className="image-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={`${image.src}-${index}`} className="image-carousel-slide">
              <div className="image-carousel-image-frame">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width || 1600}
                  height={image.height || 1200}
                  sizes="100vw"
                  className={`image-carousel-image ${
                    image.isVertical
                      ? "image-carousel-image-vertical"
                      : "image-carousel-image-horizontal"
                  }`}
                  priority={index === activeIndex}
                />
              </div>
            </div>
          ))}
        </div>

        {cursorPos && navAction && (
          <span
            className={`image-carousel-cursor-nav image-carousel-cursor-nav-${navAction}`}
            style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
            aria-hidden="true"
          >
            {navAction === "prev" ? "Prev" : "Next"}
          </span>
        )}
      </div>
    </div>
  );
}
