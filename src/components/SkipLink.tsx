"use client";

import { useT } from "@/lib/i18n";

/**
 * First tab stop on the page (2026-09-06 Phase 5 a11y pass) — visually
 * hidden until focused, then a keyboard/screen-reader user can jump straight
 * past the nav bar and locale/theme toggles to the record itself, rather
 * than tabbing through the whole header on every page load.
 */
export default function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:border focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-[var(--foreground)]"
    >
      {t.skipToContent}
    </a>
  );
}
