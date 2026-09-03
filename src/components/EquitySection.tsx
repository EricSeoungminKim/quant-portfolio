"use client";

import type { EquityBook, PerformanceData } from "@/types/performance";
import EquityChart from "./EquityChart";
import SectionHeading from "./SectionHeading";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText, translatePhaseLabel, translateSeedBasis } from "@/lib/i18nData";
import { formatDateOnly, formatMoney, formatPct } from "@/lib/format";

export default function EquitySection({ data }: { data: PerformanceData }) {
  const t = useT();
  const { locale } = useLocale();

  return (
    <section id="equity" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading eyebrow={t.equity.eyebrow} title={t.equity.title} description={t.equity.description} />

      {data.period.start && (
        <p className="tnum mt-4 text-xs text-[var(--muted-2)]">
          {t.equity.periodLabel}: {formatDateOnly(data.period.start)}
          {data.period.end ? ` – ${formatDateOnly(data.period.end)}` : ""}
          {typeof data.period.sessions === "number" ? ` · ${t.equity.sessionsCount(data.period.sessions)}` : ""}
          {(data.period.note || data.period.note_en)
            ? ` · ${translateDataText(data.period.note ?? "", data.period.note_en, locale)}`
            : ""}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
        <Legend swatch="var(--up)" label={t.equity.legendUp} />
        <Legend swatch="var(--down)" label={t.equity.legendDown} />
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-0.5 bg-[var(--accent)]" />
          {t.equity.legendPhaseBoundary}
        </span>
      </div>

      {/* Two currency-separate books (no FX conversion between them, per the
          2026-09-02 owner directive) — stacked on narrow screens, side by
          side from md up. */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BookPanel title={t.equity.bookAsiaTitle} book={data.equity_asia} />
        <BookPanel title={t.equity.bookUsTitle} book={data.equity_us} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.phases.map((phase) => (
          <div key={phase.id} className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {translatePhaseLabel(phase.id, phase.label, phase.label_en, locale)}
              </span>
              <span className="tnum text-xs text-[var(--muted-2)]">
                {formatDateOnly(phase.from)} {phase.to ? `– ${formatDateOnly(phase.to)}` : `– ${t.equity.ongoing}`}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              {translateDataText(phase.note, phase.note_en, locale)}
            </p>
          </div>
        ))}
      </div>

      {/* `excluded.seeding_liquidation` is only present once a real-account
          transplant event has happened (quant.control.performance._excluded_summary
          returns {} until then) — guard rather than assume it's always there. */}
      {data.excluded.seeding_liquidation && (
        <p className="mt-4 text-xs leading-relaxed text-[var(--muted-2)]">
          {translateDataText(
            data.excluded.seeding_liquidation.note,
            data.excluded.seeding_liquidation.note_en,
            locale
          )}{" "}
          {t.equity.excludedNote(data.excluded.seeding_liquidation.fills)}
        </p>
      )}

      {data.prior_paper && "sessions" in data.prior_paper && (
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-2)]">
          {t.equity.priorPaperNote(data.prior_paper.sessions)}
          {data.prior_paper.note
            ? ` — ${translateDataText(data.prior_paper.note, data.prior_paper.note_en, locale)}`
            : ""}
        </p>
      )}
    </section>
  );
}

function BookPanel({ title, book }: { title: string; book: EquityBook }) {
  const t = useT();
  const { locale } = useLocale();
  const seedBasisText = translateSeedBasis(book.seed_basis, book.seed_basis_en, locale);
  const hasDrawdown = book.max_drawdown_pct !== undefined;
  const drawdownText =
    book.max_drawdown_pct != null
      ? formatPct(-Math.abs(book.max_drawdown_pct) * 100, 1)
      : t.equity.maxDrawdownNA;

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-baseline gap-2.5">
          {hasDrawdown && (
            <span className="tnum text-[10px] text-[var(--muted-2)]">
              {t.equity.maxDrawdownLabel} {drawdownText}
            </span>
          )}
          <span className="text-[10px] text-[var(--muted-2)]">{book.currency}</span>
        </div>
      </div>
      <EquityChart rows={book.rows} yAxis={book.chart.y_axis} phaseBoundaries={book.chart.phase_boundaries} title={title} />
      {book.seed != null && (
        <div className="mt-2 text-[10px] text-[var(--muted-2)]">
          {t.equity.seedBasisLabel}
          {seedBasisText ? `: ${seedBasisText}` : ""} · {t.equity.seedLabel} {formatMoney(book.seed, book.currency, locale)}
        </div>
      )}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: swatch }} />
      {label}
    </span>
  );
}
