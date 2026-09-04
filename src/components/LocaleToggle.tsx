"use client";

import { useLocale } from "@/lib/i18n";

// Visible EN / 한국어 switch, sitting next to ThemeToggle. Default locale
// is English (matches the static-export HTML); clicking flips instantly
// and remembers the choice in localStorage (see LocaleProvider).
export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language / 언어"
      className="flex h-8 shrink-0 items-center border border-[var(--control)] p-0.5 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`cursor-pointer px-2 py-1 text-[11px] font-medium transition-colors ${
          locale === "en"
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("ko")}
        aria-pressed={locale === "ko"}
        className={`cursor-pointer px-2 py-1 text-[11px] font-medium transition-colors ${
          locale === "ko"
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        한국어
      </button>
    </div>
  );
}
