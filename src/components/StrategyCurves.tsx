"use client";

import { useMemo, useState } from "react";
import type { Strategy, StrategyCurvePoint } from "@/types/performance";
import { buildSeriesStyles, type CurveSeries } from "@/lib/series";
import { formatMoneyCompact, formatMoneySigned } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText, translateStrategyName, translateVerdict } from "@/lib/i18nData";
import SectionHeading from "./SectionHeading";
import StrategyCurveChart from "./StrategyCurveChart";

type Book = "asia" | "us";

/**
 * Section 02 — one line per strategy, per currency book.
 *
 * Section 01 answers "how is the book doing"; this answers "which strategies
 * are holding it up and which are dragging it down", which is a different
 * question and needs a different unit: cumulative post-fee net P&L in the
 * book's own currency, not a percentage of a seed. The two never share an axis.
 *
 * Everything here is optional in the data contract — when no strategy carries
 * a curve, the whole section renders nothing rather than an empty frame.
 */
export default function StrategyCurves({
  strategies,
  note,
  noteEn,
  index,
}: {
  strategies: Strategy[];
  note?: string;
  noteEn?: string;
  index: string;
}) {
  const t = useT();
  const { locale } = useLocale();

  // Colour/pattern assignment is computed from EVERY strategy in the snapshot,
  // not from the visible subset — that is what keeps a strategy the same
  // colour in both panels and across every legend toggle.
  const styles = useMemo(() => buildSeriesStyles(strategies.map((s) => s.id)), [strategies]);

  const books = useMemo(() => {
    const build = (book: Book): CurveSeries[] =>
      strategies
        .map((s) => {
          const points: StrategyCurvePoint[] = s.curve?.[book] ?? [];
          if (points.length === 0) return null;
          const style = styles.get(s.id);
          if (!style) return null;
          return {
            id: s.id,
            name: translateStrategyName(s.id, s.name_ko, s.name_en, locale),
            color: style.color,
            dash: style.dash,
            enabled: s.enabled !== false,
            verdict: translateVerdict(s.total.verdict, locale) || s.total.verdict,
            points: [...points].sort((a, b) => a.date.localeCompare(b.date)),
          } satisfies CurveSeries;
        })
        .filter((s): s is CurveSeries => s !== null);
    return { asia: build("asia"), us: build("us") };
  }, [strategies, styles, locale]);

  if (books.asia.length === 0 && books.us.length === 0) return null;

  return (
    <section
      id="strategy-curves"
      className="border-t border-[var(--border)]"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHeading
          index={index}
          eyebrow={t.curves.eyebrow}
          title={t.curves.title}
          description={t.curves.description}
        />

        {(note || noteEn) && (
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[var(--muted-2)]">
            {translateDataText(note ?? "", noteEn, locale)}
          </p>
        )}

        <div className="mt-8 space-y-8">
          <BookPanel title={t.curves.bookAsiaTitle} currency="KRW" series={books.asia} />
          <BookPanel title={t.curves.bookUsTitle} currency="USD" series={books.us} />
        </div>
      </div>
    </section>
  );
}

function BookPanel({
  title,
  currency,
  series,
}: {
  title: string;
  currency: "KRW" | "USD";
  series: CurveSeries[];
}) {
  const t = useT();
  const { locale } = useLocale();
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visible = useMemo(() => series.filter((s) => !hidden.has(s.id)), [series, hidden]);

  // Ranking is by latest cumulative value — the reader's actual question
  // ("which ones are holding up"). It always lists every series in the book,
  // including ones toggled off the chart, so hiding a line to read the others
  // never hides its number too.
  const ranked = useMemo(
    () =>
      [...series]
        .map((s) => ({ s, last: s.points[s.points.length - 1] }))
        .sort((a, b) => b.last.cum_net - a.last.cum_net),
    [series]
  );

  function toggle(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (series.length === 0) {
    return (
      <div className="plate p-4 md:p-6" data-reveal>
        <PanelHeader title={title} currency={currency} count={0} />
        <p className="py-8 text-center text-xs text-[var(--muted-2)]">{t.curves.emptyMarket}</p>
      </div>
    );
  }

  const allDates = series.flatMap((s) => s.points.map((p) => p.date)).sort();
  const range = { from: allDates[0] ?? "", to: allDates[allDates.length - 1] ?? "" };

  return (
    <div className="plate p-4 md:p-6" data-reveal>
      <PanelHeader title={title} currency={currency} count={series.length} />

      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="min-w-0 flex-1">
          <StrategyCurveChart
            series={visible}
            currency={currency}
            ariaLabel={t.curves.chartAriaLabel(
              title,
              visible.length,
              range.from,
              range.to
            )}
          />
          <p className="mt-1.5 text-[10px] text-[var(--muted-2)]">{t.curves.xAxisTitle}</p>

          {/* Legend as toggle chips. Identity is never colour alone: each chip
              mirrors the line's hue AND its stroke pattern, and carries the
              strategy's name and verdict as text. */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="mono-label mr-1 text-[9px] text-[var(--muted-2)]">
              {t.curves.legendLabel}
            </span>
            {series.map((s) => {
              const on = !hidden.has(s.id);
              const last = s.points[s.points.length - 1];
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  aria-pressed={on}
                  title={t.curves.chipTitle(s.name, last.cum_trips, s.verdict)}
                  className={`flex min-h-[28px] cursor-pointer items-center gap-1.5 border px-1.5 py-1 text-[11px] transition-colors ${
                    on
                      ? "border-[var(--control)] hover:border-[var(--foreground)]"
                      : "border-dashed border-[var(--border)] opacity-55 hover:opacity-85"
                  }`}
                >
                  <svg width="14" height="8" aria-hidden className="shrink-0">
                    <line
                      x1="0"
                      x2="14"
                      y1="4"
                      y2="4"
                      stroke={on ? s.color : "var(--muted-2)"}
                      strokeWidth="2.5"
                      strokeDasharray={s.dash || undefined}
                    />
                  </svg>
                  <span className={s.enabled ? "" : "text-[var(--muted-2)]"}>{s.name}</span>
                  {!s.enabled && (
                    <span className="mono-label border border-[var(--control)] px-1 py-px text-[8px] font-normal text-[var(--muted-2)]">
                      {t.strategies.offBadge}
                    </span>
                  )}
                  <span className="mono-label text-[8px] text-[var(--muted-2)]">{s.verdict}</span>
                </button>
              );
            })}
            <span className="mx-0.5 h-4 w-px bg-[var(--border)]" aria-hidden />
            <button
              type="button"
              onClick={() => setHidden(new Set())}
              className="mono-label min-h-[28px] cursor-pointer border border-[var(--control)] px-2 text-[9px] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {t.curves.showAll}
            </button>
            <button
              type="button"
              onClick={() => setHidden(new Set(series.map((s) => s.id)))}
              className="mono-label min-h-[28px] cursor-pointer border border-[var(--control)] px-2 text-[9px] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {t.curves.showNone}
            </button>
          </div>
        </div>

        <Ranking ranked={ranked} currency={currency} />
      </div>

      {/* Non-visual equivalent of the chart — the relief the palette's
          sub-3:1 light-mode hues require, and the reading path for anyone not
          using a pointer. */}
      {/* The wrapper carries .sr-only, not the table: a table box treats the
          utility's width:1px as a minimum and lays itself out to its content
          anyway, which pushed the page 167px wide at 320px until this div
          took over the clipping. */}
      <div className="sr-only">
      <table>
        <caption>{t.curves.tableCaption(title)}</caption>
        <thead>
          <tr>
            <th scope="col">{t.curves.tableStrategy}</th>
            <th scope="col">{t.curves.tableCum}</th>
            <th scope="col">{t.curves.tableDay}</th>
            <th scope="col">{t.curves.tableTrips}</th>
            <th scope="col">{t.strategies.headerVerdict}</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ s, last }) => (
            <tr key={s.id}>
              <th scope="row">{s.name}</th>
              <td>{formatMoneySigned(last.cum_net, currency, locale)}</td>
              <td>{formatMoneySigned(last.day_net, currency, locale)}</td>
              <td>{last.cum_trips}</td>
              <td>{s.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function PanelHeader({
  title,
  currency,
  count,
}: {
  title: string;
  currency: "KRW" | "USD";
  count: number;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex items-baseline gap-2.5">
        <span className="tnum text-[10px] text-[var(--muted-2)]">
          {t.curves.seriesCount(count)}
        </span>
        <span className="text-[10px] text-[var(--muted-2)]">{currency}</span>
      </div>
    </div>
  );
}

function Ranking({
  ranked,
  currency,
}: {
  ranked: { s: CurveSeries; last: StrategyCurvePoint }[];
  currency: "KRW" | "USD";
}) {
  const t = useT();
  const n = ranked.length;
  // Only de-emphasize a middle at all when there is one worth separating —
  // with six or fewer lines, every row is already a top-3 or a bottom-3.
  const emphasize = (i: number) => n <= 6 || i < 3 || i >= n - 3;

  return (
    <div className="lg:w-[19rem] lg:shrink-0">
      <h4 className="mono-label text-[9px] text-[var(--muted-2)]">{t.curves.rankingTitle}</h4>
      <ol className="mt-2 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {ranked.map(({ s, last }, i) => {
          const strong = emphasize(i);
          return (
            <li
              key={s.id}
              className={`flex min-h-[34px] items-center gap-2 py-1.5 ${strong ? "" : "opacity-60"}`}
            >
              <span className="tnum w-4 shrink-0 text-right text-[10px] text-[var(--muted-2)]">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[11px] ${
                    strong ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
                  title={s.name}
                >
                  {s.name}
                </span>
                <span className="tnum block truncate text-[9px] whitespace-nowrap text-[var(--muted-2)]">
                  {t.curves.lastDay} {formatMoneyCompact(last.day_net, currency, true)}
                  {/* Below sm the row is too narrow to hold both without
                      ellipsing the day's net — the trip count is the half that
                      is also on the legend chip and in the table, so it goes. */}
                  <span className="hidden sm:inline"> · {t.curves.tripsShort(last.cum_trips)}</span>
                </span>
              </span>
              <MiniSpark points={s.points} color={s.color} dash={s.dash} />
              <span
                className={`tnum w-[4.25rem] shrink-0 text-right text-[11px] font-medium ${
                  last.cum_net >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
                }`}
              >
                {formatMoneyCompact(last.cum_net, currency)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const SPARK_W = 44;
const SPARK_H = 16;

function MiniSpark({
  points,
  color,
  dash,
}: {
  points: StrategyCurvePoint[];
  color: string;
  dash: string;
}) {
  const values = points.map((p) => p.cum_net);
  // Zero is always in range: the whole reading is the distance from break-even.
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const n = points.length;
  const xAt = (i: number) => (n <= 1 ? SPARK_W / 2 : (i / (n - 1)) * SPARK_W);
  const yAt = (v: number) => ((max - v) / span) * SPARK_H;

  return (
    <svg
      width={SPARK_W}
      height={SPARK_H}
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      <line x1={0} x2={SPARK_W} y1={yAt(0)} y2={yAt(0)} stroke="var(--border)" strokeWidth={1} />
      {n === 1 ? (
        <circle cx={xAt(0)} cy={yAt(values[0])} r={2} fill={color} />
      ) : (
        <path
          d={points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.cum_net).toFixed(1)}`)
            .join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dash || undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
