"use client";

import { useEffect, useState } from "react";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText } from "@/lib/i18nData";

const STALE_HOURS = 48;

export default function Footer({
  generatedAt,
  disclaimer,
  disclaimerEn,
}: {
  generatedAt: string;
  disclaimer: string;
  disclaimerEn?: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const formatted = new Date(generatedAt).toLocaleString(locale === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  });

  // Freshness is computed from the viewer's own clock, so it can only be
  // known after mount — computing it during the server render would produce
  // a value that never matches the client's first render and trip a
  // hydration mismatch. `hoursAgo` stays null (renders nothing) until then.
  const [hoursAgo, setHoursAgo] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const diffMs = Date.now() - new Date(generatedAt).getTime();
      setHoursAgo(Math.max(0, Math.floor(diffMs / (1000 * 60 * 60))));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [generatedAt]);
  const stale = hoursAgo !== null && hoursAgo > STALE_HOURS;

  return (
    <footer className="mt-8 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="border-l-2 border-[var(--up)] bg-[var(--up-bg)] px-4 py-3.5 text-xs leading-relaxed text-[var(--foreground)]">
          {translateDataText(disclaimer, disclaimerEn, locale)}
        </p>
        <div className="mt-5 flex flex-col gap-2 text-xs text-[var(--muted-2)] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex flex-wrap items-center gap-2">
            <span className="tnum">
              {t.footer.lastUpdated} {formatted} {t.footer.kstSuffix}
            </span>
            {hoursAgo !== null && (
              <span
                title={t.footer.freshLabel}
                className={`tnum flex items-center gap-1.5 border px-1.5 py-0.5 text-[10px] font-medium ${
                  stale
                    ? "border-[var(--up)] text-[var(--up)]"
                    : "border-[var(--control)] text-[var(--muted-2)]"
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${stale ? "bg-[var(--up)]" : "pulse-dot bg-[var(--accent)]"}`}
                  aria-hidden
                />
                {stale ? t.footer.stale : hoursAgo === 0 ? t.footer.justNow : t.footer.updatedAgo(hoursAgo)}
              </span>
            )}
          </span>
          <span>{t.footer.notAdvice}</span>
        </div>
      </div>
    </footer>
  );
}
