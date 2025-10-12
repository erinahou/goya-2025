import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className="nav-logo">
        Goya Curtain
      </Link>
      <div className="nav-link-item">
        <Link href="/exhibitions">Exhibitions</Link>
        <Link href="/info">Info</Link>
      </div>
      <div className="nav-link-item">
        <Link href="/35mm-archives">35mm archives</Link>
        <Link href="/">Subscribe</Link>
      </div>
      <Link href="/" className="nav-language">
        EN/JP
      </Link>
    </nav>
  );
}
