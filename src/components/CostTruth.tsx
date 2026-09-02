"use client";

import type { ReactNode } from "react";
import type { Costs } from "@/types/performance";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText } from "@/lib/i18nData";
import SectionHeading from "./SectionHeading";

export default function CostTruth({ costs }: { costs: Costs }) {
  const t = useT();
  const { locale } = useLocale();
  const maxBp = Math.max(costs.kr_stock_roundtrip_bp, costs.kr_etf_roundtrip_bp, costs.us_roundtrip_bp);
  const taxBp = costs.kr_tax_bp;
  const otherBp = costs.kr_stock_roundtrip_bp - taxBp;

  const bars = [
    { label: t.cost.bars[0].label, value: costs.kr_stock_roundtrip_bp, breakdown: true },
    { label: t.cost.bars[1].label, value: costs.kr_etf_roundtrip_bp },
    { label: t.cost.bars[2].label, value: costs.us_roundtrip_bp },
  ];

  return (
    <section id="cost" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading eyebrow={t.cost.eyebrow} title={t.cost.title} description={t.cost.description} />

      <div className="mt-8 rounded border border-[var(--border)] bg-[var(--surface)] p-5 md:p-7">
        <div className="space-y-5">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span>{b.label}</span>
                <span className="tnum font-medium">{b.value}bp</span>
              </div>
              <div className="h-5 w-full overflow-hidden rounded-sm bg-[var(--surface-2)]">
                {b.breakdown ? (
                  <div className="flex h-full">
                    <div
                      className="flex h-full items-center overflow-hidden whitespace-nowrap bg-[var(--down)] pl-2 text-[10px] font-medium text-white"
                      style={{ width: `${(taxBp / maxBp) * 100}%` }}
                    >
                      {t.cost.taxLabel(taxBp)}
                    </div>
                    <div
                      className="flex h-full items-center overflow-hidden whitespace-nowrap bg-[var(--muted-2)] pl-2 text-[10px] font-medium text-[var(--surface)]"
                      style={{ width: `${(otherBp / maxBp) * 100}%` }}
                    >
                      {t.cost.otherLabel(otherBp)}
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${(b.value / maxBp) * 100}%` }} />
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm leading-relaxed text-[var(--muted)]">
          {translateDataText(costs.note, costs.note_en, locale)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Note title={t.cost.noteMeasuredTitle}>{t.cost.noteMeasuredBody}</Note>
        <Note title={t.cost.noteEdgeTitle}>{t.cost.noteEdgeBody}</Note>
      </div>
    </section>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold text-[var(--accent)]">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{children}</p>
    </div>
  );
}
