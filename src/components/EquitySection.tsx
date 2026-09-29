"use client";

import type { EquityBook, PaperEpochOverall, PerformanceData } from "@/types/performance";
import EquityChart from "./EquityChart";
import SectionHeading from "./SectionHeading";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText, translatePhaseLabel, translateSeedBasis } from "@/lib/i18nData";
import { hasPaperEpoch, toEquityCurvePoints } from "@/lib/paperEpoch";
import { formatDateOnly, formatMoney, formatPct } from "@/lib/format";

export default function EquitySection({ data, index }: { data: PerformanceData; index: string }) {
  const t = useT();
  const { locale } = useLocale();
  const epoch = hasPaperEpoch(data) ? data.paper_epoch : null;

  return (
    <section id="equity" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHeading
        index={index}
        eyebrow={t.equity.eyebrow}
        title={t.equity.title}
        description={t.equity.description}
      />

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

      {epoch?.measurement_note && (
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-[var(--muted)]">
          {translateDataText(epoch.measurement_note, epoch.measurement_note_en, locale)}
          {(epoch.excluded_unassigned?.total_fills ?? 0) > 0 && (locale === "ko"
            ? ` 현재 배정이 없는 계좌의 ${epoch.excluded_unassigned!.total_fills}건 체결은 현재 통계에서 제외했습니다. 과거 왕복 거래 통계는 아래 별도 기록에 보존합니다.`
            : ` ${epoch.excluded_unassigned!.total_fills} fills from currently unassigned accounts are excluded here; historical round-trip statistics are preserved separately below.`)}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
        <Legend swatch="var(--up)" label={t.equity.legendUp} />
        <Legend swatch="var(--down)" label={t.equity.legendDown} />
        {data.phases.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-0.5 bg-[var(--accent)]" aria-hidden />
            {t.equity.legendPhaseBoundary}
          </span>
        )}
      </div>

      {/* 2026-09-06 paper_epoch — every strategy's own account summed into
          one KRW curve ("계좌 합계"), placed ahead of the per-currency books
          below since it is now the headline read on this record. Absent
          until the generator's ledger-side dependency lands. */}
      {hasPaperEpoch(data) && (
        <div className="mt-6" data-reveal>
          <OverallPanel overall={data.paper_epoch.overall} />
        </div>
      )}

      {/* Two currency-separate books (no FX conversion between them, per the
          2026-09-02 owner directive) — stacked on narrow screens, side by
          side from md up. */}
      <div className="mt-6 grid gap-6 md:grid-cols-2" data-reveal>
        <BookPanel title={t.equity.bookAsiaTitle} book={data.equity_asia} />
        <BookPanel title={t.equity.bookUsTitle} book={data.equity_us} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.phases.map((phase) => (
          <div key={phase.id} className="plate p-4">
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
  // The generator includes initial capital as the first high-water mark;
  // max_drawdown_pct and cum_pct are both percentages, not fractions.
  const drawdownText =
    book.max_drawdown_pct != null
      ? formatPct(-Math.abs(book.max_drawdown_pct), 2)
      : t.equity.maxDrawdownNA;

  return (
    <div className="plate p-4 md:p-6">
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

// 2026-09-06 paper_epoch "계좌 합계" (sum of accounts) panel — every
// strategy's own KR/US paper account converted to KRW (fixed reference
// rate, see the methodology glossary note) and summed into one curve.
// Structurally close to `BookPanel` above but built from `PaperEpochOverall`
// rather than `EquityBook` (no `seed_basis`/`phase_boundaries` to show —
// there's only ever been one seed and one phase since a fresh epoch).
function OverallPanel({ overall }: { overall: PaperEpochOverall }) {
  const t = useT();
  const { locale } = useLocale();
  const hasDrawdown = overall.max_drawdown_pct !== undefined;
  const drawdownText =
    overall.max_drawdown_pct != null
      ? formatPct(-Math.abs(overall.max_drawdown_pct), 2)
      : t.equity.maxDrawdownNA;
  const rows = toEquityCurvePoints(overall.rows, overall.seed_krw);

  return (
    <div className="plate p-4 md:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <h3 className="text-sm font-semibold">{t.equity.overallBookTitle}</h3>
        <div className="flex items-baseline gap-2.5">
          {hasDrawdown && (
            <span className="tnum text-[10px] text-[var(--muted-2)]">
              {t.equity.maxDrawdownLabel} {drawdownText}
            </span>
          )}
          <span className="text-[10px] text-[var(--muted-2)]">{overall.currency}</span>
        </div>
      </div>
      <EquityChart rows={rows} yAxis={overall.chart.y_axis} phaseBoundaries={[]} title={t.equity.overallBookTitle} />
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
        {translateDataText(overall.fx_source_note, overall.fx_source_note_en, locale)}
      </p>
      {overall.seed_krw != null && (
        <div className="mt-2 text-[10px] text-[var(--muted-2)]">
          {t.equity.seedLabel} {formatMoney(overall.seed_krw, overall.currency, locale)}
        </div>
      )}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5" style={{ background: swatch }} aria-hidden />
      {label}
    </span>
  );
}
