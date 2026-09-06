"use client";

import { useT } from "@/lib/i18n";

/**
 * Short "how to read this page" primer (2026-09-06 Phase 5 live-readiness) —
 * placed right after the account-model banner so a first-time reader has the
 * vocabulary (epoch, account model, bp, Wilson CI, verdict) before the charts
 * start, plus two facts neither the hero nor the footer states outright: where
 * the numbers come from, and what this project explicitly is not. Full term
 * definitions still live in Methodology's glossary further down — this is a
 * compact index, not a duplicate.
 */
export default function HowToRead() {
  const t = useT();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 md:pb-12" data-reveal>
      <div className="plate max-w-3xl p-5 sm:p-6">
        <p className="mono-label text-[10px] text-[var(--accent)]">{t.howToRead.eyebrow}</p>
        <h2 className="mt-1.5 text-sm font-semibold tracking-tight">{t.howToRead.title}</h2>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {t.howToRead.items.map((item) => (
            <div key={item.term} className="min-w-0">
              <dt className="text-[13px] font-medium">{item.term}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{item.detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
          <div>
            <p className="mono-label text-[9px] text-[var(--muted-2)]">{t.howToRead.sourceLabel}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              {t.howToRead.sourceDetail}
            </p>
          </div>
          <div>
            <p className="mono-label text-[9px] text-[var(--up)]">{t.howToRead.notLabel}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{t.howToRead.notDetail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
