'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <nav>
      <Link href="/" className="nav-logo">
        Goya Curtain
      </Link>

      {isMobile ? (
        // Mobile: All links in one nav-link-item
        <div className="nav-link-item">
          <Link href="/exhibitions">Exhibitions</Link>
          <Link href="/info">Info</Link>
          <Link href="/35mm-archives">35mm archives</Link>
          <Link href="/">Subscribe</Link>
        </div>
      ) : (
        // Desktop: Two separate nav-link-item divs
        <>
          <div className="nav-link-item">
            <Link href="/exhibitions">Exhibitions</Link>
            <Link href="/info">Info</Link>
          </div>
          <div className="nav-link-item">
            <Link href="/35mm-archives">35mm archives</Link>
            <Link href="/">Subscribe</Link>
          </div>
        </>
      )}

      <div className="nav-language">
        <button
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'active' : ''}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('jp')}
          className={language === 'jp' ? 'active' : ''}
        >
          JP
        </button>
      </div>
    </nav>
  );
}
