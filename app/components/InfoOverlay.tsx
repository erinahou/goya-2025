'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InfoContent } from "./InfoContent";

export function InfoOverlay() {
  const searchParams = useSearchParams();
  const shouldBeOpen = searchParams.get("info") === "open";
  const [isMounted, setIsMounted] = useState(shouldBeOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldBeOpen) {
      setIsMounted(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => setIsMounted(false), 400);
    return () => window.clearTimeout(timeout);
  }, [shouldBeOpen]);

  useEffect(() => {
    document.body.style.overflow = shouldBeOpen ? "hidden" : "";
    document.body.classList.toggle("info-overlay-open", shouldBeOpen);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("info-overlay-open");
    };
  }, [shouldBeOpen]);

  if (!isMounted) return null;

  return (
    <div
      className={`info-overlay ${isVisible ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Information about Goya Curtain"
    >
      <div className="info-overlay-backdrop" aria-hidden="true">
        <div className="info-overlay-tint-layer" />
      </div>
      <div className="info-overlay-content">
        <InfoContent />
      </div>
    </div>
  );
}
