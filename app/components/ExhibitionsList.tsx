'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ExhibitionListItem = {
  id: string;
  slug: string;
  year: string;
  artistNames: string;
  titleEn: string;
  dontDisplayTitle?: boolean;
  thumbnail: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null;
};

interface ExhibitionsListProps {
  exhibitions: ExhibitionListItem[];
}

const THUMBNAIL_FADE_MS = 600;
const THUMBNAIL_MEDIA_QUERY = "(max-width: 768px)";

export function ExhibitionsList({ exhibitions }: ExhibitionsListProps) {
  const [displayedThumbnail, setDisplayedThumbnail] =
    useState<ExhibitionListItem["thumbnail"]>(null);
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(false);
  const [thumbnailsEnabled, setThumbnailsEnabled] = useState(true);
  const hideTimeoutRef = useRef<number | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia(THUMBNAIL_MEDIA_QUERY);
    const updateThumbnailsEnabled = () => {
      const enabled = !mediaQuery.matches;
      setThumbnailsEnabled(enabled);
      if (!enabled) {
        clearHideTimeout();
        setIsThumbnailVisible(false);
        setDisplayedThumbnail(null);
      }
    };

    updateThumbnailsEnabled();
    mediaQuery.addEventListener("change", updateThumbnailsEnabled);

    return () => {
      mediaQuery.removeEventListener("change", updateThumbnailsEnabled);
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const showThumbnail = (thumbnail: ExhibitionListItem["thumbnail"]) => {
    if (!thumbnailsEnabled) return;

    clearHideTimeout();

    if (!thumbnail) {
      setIsThumbnailVisible(false);
      hideTimeoutRef.current = window.setTimeout(() => {
        setDisplayedThumbnail(null);
        hideTimeoutRef.current = null;
      }, THUMBNAIL_FADE_MS);
      return;
    }

    setDisplayedThumbnail(thumbnail);
    requestAnimationFrame(() => setIsThumbnailVisible(true));
  };

  return (
    <div
      className="exhibitions-list-page"
      onMouseLeave={() => thumbnailsEnabled && showThumbnail(null)}
    >
      {thumbnailsEnabled && (
        <div
          className={`exhibitions-list-thumbnail-slot ${
            isThumbnailVisible ? "is-visible" : ""
          }`}
          aria-hidden={!displayedThumbnail}
        >
          {displayedThumbnail && (
            <Image
              key={displayedThumbnail.src}
              src={displayedThumbnail.src}
              alt={displayedThumbnail.alt}
              width={displayedThumbnail.width}
              height={displayedThumbnail.height}
              className="exhibitions-list-thumbnail-image"
            />
          )}
        </div>
      )}

      <ul className="exhibitions-list-container">
        {exhibitions.map((exhibition) => (
          <li
            key={exhibition.id}
            className="exhibitions-list-item-wrapper"
            onMouseEnter={() => showThumbnail(exhibition.thumbnail)}
          >
            <Link
              href={`/exhibitions/${exhibition.slug}`}
              className="exhibitions-list-item"
            >
              <h2 className="year">{exhibition.year}</h2>
              <h2 className="title">
                <span>{exhibition.artistNames}</span>
                {!exhibition.dontDisplayTitle && (
                  <>
                    <span>:&nbsp;</span>
                    <span className="italic">{exhibition.titleEn}</span>
                  </>
                )}
              </h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
