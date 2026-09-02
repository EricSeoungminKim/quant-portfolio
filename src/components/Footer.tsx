"use client";

import { useLocale, useT } from "@/lib/i18n";
import { translateDataText } from "@/lib/i18nData";

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

  return (
    <footer className="mt-8 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="rounded border border-[var(--up)] bg-[var(--up-bg)] p-3.5 text-xs leading-relaxed text-[var(--foreground)]">
          {translateDataText(disclaimer, disclaimerEn, locale)}
        </p>
        <div className="mt-5 flex flex-col gap-1 text-xs text-[var(--muted-2)] sm:flex-row sm:justify-between">
          <span className="tnum">
            {t.footer.lastUpdated} {formatted} {t.footer.kstSuffix}
          </span>
          <span>{t.footer.notAdvice}</span>
        </div>
      </div>
    </footer>
  );
}
