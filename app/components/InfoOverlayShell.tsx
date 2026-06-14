import { Suspense } from "react";
import { InfoOverlay } from "./InfoOverlay";

export default function InfoOverlayShell() {
  return (
    <Suspense fallback={null}>
      <InfoOverlay />
    </Suspense>
  );
}
