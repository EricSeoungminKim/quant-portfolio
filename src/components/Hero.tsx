"use client";

import { useCallback } from "react";
import type { EquityBook, PerformanceData } from "@/types/performance";
import { useLocale, useT } from "@/lib/i18n";
import { formatPct } from "@/lib/format";
import AnimatedNumber from "./AnimatedNumber";
import Sparkline from "./Sparkline";

/** Last plottable cumulative return in a book, or null when it has none. */
function latestCum(book: EquityBook): number | null {
  for (let i = book.rows.length - 1; i >= 0; i -= 1) {
    const v = book.rows[i].cum_pct;
    if (v !== null) return v;
  }
  return null;
}

export default function Hero({ data }: { data: PerformanceData }) {
  const t = useT();
  const { locale } = useLocale();
  const localeTag = locale === "ko" ? "ko-KR" : "en-US";

  const strategyCount = data.strategies.length;
  const { sessions, total_fills } = data.period;
  const totalTrips = data.strategies.reduce((sum, s) => sum + s.total.trips, 0);
  const enabledCount =
    data.enabled_count ?? data.strategies.filter((s) => s.enabled).length;
  const hasEnabledFlag =
    typeof data.enabled_count === "number" ||
    data.strategies.some((s) => typeof s.enabled === "boolean");

  const intFormat = useCallback(
    (v: number) => Math.round(v).toLocaleString(localeTag),
    [localeTag]
  );

  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pt-12 pb-14 md:pt-16 md:pb-16">
      <span className="mono-label inline-flex items-center gap-2 border border-[var(--up)] bg-[var(--up-bg)] px-2.5 py-1 text-[10px] font-medium text-[var(--up)]">
        {t.hero.badge}
      </span>

      <h1 className="display mt-7 max-w-4xl text-[2.25rem] font-semibold leading-[1.08] md:text-[4rem] lg:text-[4.5rem]">
        {t.hero.thesis}
      </h1>

      <p className="mt-7 max-w-2xl text-[1.0625rem] leading-[1.7] text-[var(--muted)]">
        {t.hero.body}
      </p>

      {/* Session tape — the page's signature readout. The engine writes a
          ledger line per fill; this is the same voice, at display size. */}
      <div className="plate mt-12" data-reveal>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2 sm:px-5">
          <span className="mono-label flex items-center gap-2 text-[10px] text-[var(--muted-2)]">
            <span
              className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
              aria-hidden
            />
            {t.hero.tapeLabel}
          </span>
          <span className="text-[11px] text-[var(--muted-2)]">{t.hero.tapeHint}</span>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <BookReadout label={t.hero.bookAsia} book={data.equity_asia} />
          <BookReadout label={t.hero.bookUs} book={data.equity_us} />
        </div>

        <dl className="grid grid-cols-2 border-t border-[var(--border)] sm:grid-cols-4">
          <Stat label={t.hero.statSessions} value={sessions} format={intFormat} />
          <Stat label={t.hero.statFills} value={total_fills} format={intFormat} />
          <Stat label={t.hero.statTrips} value={totalTrips} format={intFormat} />
          <Stat label={t.hero.statStrategies} value={strategyCount} format={intFormat} />
        </dl>
      </div>

      {hasEnabledFlag && (
        <p className="tnum mt-4 text-xs text-[var(--muted-2)]" data-reveal>
          {t.hero.liveCount(enabledCount, strategyCount)}
        </p>
      )}
    </section>
  );
}

function BookReadout({ label, book }: { label: string; book: EquityBook }) {
  const t = useT();
  const value = latestCum(book);
  const positive = value !== null && value >= 0;
  const tone = value === null
    ? "text-[var(--muted-2)]"
    : positive
      ? "text-[var(--up)]"
      : "text-[var(--down)]";

  const format = useCallback((v: number) => formatPct(v, 2), []);

  return (
    <div className="px-4 py-6 sm:px-5 sm:py-7">
      <div className="mono-label text-[10px] text-[var(--muted-2)]">{label}</div>
      <div className={`tnum mt-2.5 text-[2.5rem] font-medium leading-none md:text-[3.25rem] ${tone}`}>
        {value === null ? (
          <span className="text-[1.5rem]">{t.hero.noData}</span>
        ) : (
          <AnimatedNumber value={value} format={format} />
        )}
      </div>
      <div className="mt-2.5 text-[11px] text-[var(--muted-2)]">{t.hero.cumLabel}</div>
      {/* Height is fixed in Sparkline, so the draw-in cannot shift the tile. */}
      <div className="mt-5">
        <Sparkline rows={book.rows} label={t.equity.chartAriaLabel(label)} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
}) {
  return (
    <div className="border-r border-[var(--border)] px-4 py-3.5 last:border-r-0 sm:px-5">
      <dt className="text-[11px] text-[var(--muted-2)]">{label}</dt>
      <dd className="tnum mt-1 text-lg font-medium">
        <AnimatedNumber value={value} format={format} />
      </dd>
    </div>
  );
}
