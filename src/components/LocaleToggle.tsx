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
      className="flex h-8 shrink-0 items-center rounded border border-[var(--border)] p-0.5 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-sm px-2 py-1 transition-colors ${
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
        className={`rounded-sm px-2 py-1 transition-colors ${
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
