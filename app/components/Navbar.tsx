'use client';

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";

function NavbarContent() {
  const [isMobile, setIsMobile] = useState(false);
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInfoOpen = searchParams.get("info") === "open";

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const infoHref = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("info", "open");
    return `${pathname}?${params.toString()}`;
  })();

  const handleCloseInfo = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("info");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <nav>
      <Link href="/" className="nav-logo">
        Goya Curtain
      </Link>

      {!isInfoOpen &&
        (isMobile ? (
          <div className="nav-link-item">
            <Link href="/exhibitions">Exhibitions</Link>
            <Link href="/35mm-archives">35mm archives</Link>
            <Link href={infoHref} scroll={false}>
              Information
            </Link>
          </div>
        ) : (
          <div className="nav-link-item">
            <Link href="/exhibitions">Exhibitions</Link>
            <Link href="/35mm-archives">35mm archives</Link>
            <Link href={infoHref} scroll={false}>
              Information
            </Link>
          </div>
        ))}

      <div className="nav-language">
        {isInfoOpen ? (
          <button type="button" className="nav-close-button" onClick={handleCloseInfo}>
            Close
          </button>
        ) : (
          <>
            <button
              onClick={() => setLanguage("en")}
              className={language === "en" ? "active" : ""}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("jp")}
              className={language === "jp" ? "active" : ""}
            >
              JP
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}
