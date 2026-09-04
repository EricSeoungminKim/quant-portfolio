"use client";

import { useCallback, type ReactNode } from "react";
import type { Costs } from "@/types/performance";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText } from "@/lib/i18nData";
import SectionHeading from "./SectionHeading";
import AnimatedNumber from "./AnimatedNumber";

/**
 * The honesty story's loudest section. On this record the costs, not the
 * signals, are the dominant term — so the fee-drag figure gets the largest
 * type on the page and sits above the per-instrument breakdown rather than
 * under it.
 */
export default function CostTruth({ costs }: { costs: Costs }) {
  const t = useT();
  const { locale } = useLocale();
  const maxBp = Math.max(
    costs.kr_stock_roundtrip_bp,
    costs.kr_etf_roundtrip_bp,
    costs.us_roundtrip_bp
  );
  const taxBp = costs.kr_tax_bp;
  const otherBp = costs.kr_stock_roundtrip_bp - taxBp;

  const bars = [
    { label: t.cost.bars[0].label, value: costs.kr_stock_roundtrip_bp, breakdown: true },
    { label: t.cost.bars[1].label, value: costs.kr_etf_roundtrip_bp, breakdown: false },
    { label: t.cost.bars[2].label, value: costs.us_roundtrip_bp, breakdown: false },
  ];

  const pctFormat = useCallback((v: number) => `${v.toFixed(0)}%`, []);

  return (
    <section id="cost" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHeading
        index="03"
        eyebrow={t.cost.eyebrow}
        title={t.cost.title}
        description={t.cost.description}
      />

      {costs.fee_drag_pct_of_gross != null && (
        <div
          className="mt-10 border-y-2 border-[var(--down)] bg-[var(--down-bg)] px-5 py-9 sm:px-8 sm:py-12"
          data-reveal
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
            <p className="tnum text-[4.5rem] font-semibold leading-[0.85] text-[var(--down)] sm:text-[7rem] md:text-[8.5rem]">
              <AnimatedNumber value={costs.fee_drag_pct_of_gross} format={pctFormat} />
            </p>
            <div className="max-w-md pb-1">
              <p className="text-base font-medium leading-snug text-[var(--foreground)] sm:text-lg">
                {t.cost.feeDragHeadline}
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-[var(--muted)]">
                {t.cost.feeDragCaption}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="plate mt-8 p-5 md:p-7" data-reveal>
        <div className="flex items-center gap-3">
          <h3 className="mono-label text-[10px] text-[var(--accent)]">
            {t.cost.breakdownTitle}
          </h3>
          <span className="h-px flex-1 bg-[var(--hairline)]" aria-hidden />
        </div>

        <div className="mt-6 space-y-5">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{b.label}</span>
                <span className="tnum shrink-0 font-medium">{b.value}bp</span>
              </div>
              <div className="h-5 w-full overflow-hidden bg-[var(--surface-2)]">
                {b.breakdown ? (
                  <div className="flex h-full">
                    <div
                      className="h-full bg-[var(--down)]"
                      style={{ width: `${(taxBp / maxBp) * 100}%` }}
                    />
                    <div
                      className="h-full bg-[var(--muted-2)]"
                      style={{ width: `${(otherBp / maxBp) * 100}%` }}
                    />
                  </div>
                ) : (
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${(b.value / maxBp) * 100}%` }}
                  />
                )}
              </div>
              {/* Segment labels sit under the bar, not inside it: the
                  fee-and-slippage slice is 3bp of 23 and would be clipped to
                  an ellipsis at phone widths. */}
              {b.breakdown && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Swatch color="var(--down)" label={t.cost.taxLabel(taxBp)} />
                  <Swatch color="var(--muted-2)" label={t.cost.otherLabel(otherBp)} />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm leading-relaxed text-[var(--muted)]">
          {translateDataText(costs.note, costs.note_en, locale)}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Note title={t.cost.noteMeasuredTitle}>{t.cost.noteMeasuredBody}</Note>
        <Note title={t.cost.noteEdgeTitle}>{t.cost.noteEdgeBody}</Note>
      </div>
    </section>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="tnum flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
      <span className="inline-block h-2 w-2 shrink-0" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="plate p-4">
      <p className="mono-label text-[10px] text-[var(--accent)]">{title}</p>
      <p className="mt-2.5 text-xs leading-relaxed text-[var(--muted)]">{children}</p>
    </div>
  );
}
