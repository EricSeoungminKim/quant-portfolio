"use client";

import { useMemo, useState } from "react";
import type { Market, MarketStats, Strategy } from "@/types/performance";
import { formatBp, formatHoldMinutes } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText, translateStrategyName, translateVerdict } from "@/lib/i18nData";
import SectionHeading from "./SectionHeading";

type SortKey = "expectancy_bp" | "win_rate" | "trips";

// Which stats to read for a given market filter — ALL reads the
// market-agnostic total, KR/US read that market's own numbers so a filtered
// view never shows the mixed-market figures under a single-market label. A
// strategy that doesn't trade the filtered market has no entry (null) and
// must be guarded at the call site.
function statsForMarket(s: Strategy, market: "ALL" | Market): MarketStats | null {
  if (market === "ALL") return s.total;
  return market === "KR" ? s.by_market.asia : s.by_market.us;
}

export default function StrategyTable({
  strategies,
  note,
  noteEn,
}: {
  strategies: Strategy[];
  note?: string;
  noteEn?: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [market, setMarket] = useState<"ALL" | Market>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("expectancy_bp");
  const [asc, setAsc] = useState(false);

  const SORT_LABEL: Record<SortKey, string> = {
    expectancy_bp: t.strategies.sortExpectancy,
    win_rate: t.strategies.sortWinRate,
    trips: t.strategies.sortTrips,
  };

  const rows = useMemo(() => {
    const filtered =
      market === "ALL" ? strategies : strategies.filter((s) => s.total.markets.includes(market));
    const sorted = [...filtered].sort((a, b) => {
      const av = statsForMarket(a, market)?.[sortKey] ?? -Infinity;
      const bv = statsForMarket(b, market)?.[sortKey] ?? -Infinity;
      const diff = av - bv;
      return asc ? diff : -diff;
    });
    return sorted;
  }, [strategies, market, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((v) => !v);
    } else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <section id="strategies" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading eyebrow={t.strategies.eyebrow} title={t.strategies.title} description={t.strategies.description} />

      {(note || noteEn) && (
        <p className="mt-2 text-xs text-[var(--muted-2)]">{translateDataText(note ?? "", noteEn, locale)}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5">
          {(["ALL", "KR", "US"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                market === m
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {m === "ALL" ? t.strategies.marketAll : m}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted-2)]">
          {t.strategies.sortLabel}
          {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`rounded border px-2.5 py-1 font-medium transition-colors ${
                sortKey === key
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] hover:text-[var(--foreground)]"
              }`}
            >
              {SORT_LABEL[key]} {sortKey === key ? (asc ? "↑" : "↓") : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-x mt-5 rounded border border-[var(--border)]">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs text-[var(--muted-2)]">
              <th className="px-4 py-3 font-medium">{t.strategies.headerStrategy}</th>
              <th className="px-4 py-3 font-medium">{t.strategies.headerMarket}</th>
              <th className="px-4 py-3 font-medium">{t.strategies.headerTrips}</th>
              <th className="px-4 py-3 font-medium">{t.strategies.headerWinRate}</th>
              <th className="px-4 py-3 font-medium">{t.strategies.headerExpectancy}</th>
              <th className="px-4 py-3 font-medium">{t.strategies.headerVerdict}</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">{t.strategies.headerTradesPerDay}</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">{t.strategies.headerAvgHold}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              // null when this strategy has no round trips in the filtered
              // market — treated as a sample-size warning ("—" cells) rather
              // than silently falling back to the mixed-market total.
              const stats = statsForMarket(s, market);
              const sampleWarning = stats ? stats.sample_warning : true;
              return (
                <tr key={s.id} className="border-b border-[var(--border)] last:border-0 bg-[var(--surface)]">
                  <td className="px-4 py-3.5 font-medium">
                    <div className="flex items-center gap-2">
                      {translateStrategyName(s.id, s.name_ko, s.name_en, locale)}
                      {s.enabled === false && (
                        <span className="rounded border border-[var(--muted-2)] px-1.5 py-0.5 text-[10px] font-normal text-[var(--muted-2)]">
                          {t.strategies.offBadge}
                        </span>
                      )}
                      {sampleWarning && (
                        <span className="rounded border border-[var(--accent)] px-1.5 py-0.5 text-[10px] font-normal text-[var(--accent)]">
                          {t.strategies.sampleWarning}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--muted)]">
                    <MarketBadges asia={s.by_market.asia} us={s.by_market.us} />
                  </td>
                  <td className="tnum px-4 py-3.5">{stats ? stats.trips : "—"}</td>
                  <td className="px-4 py-3.5">
                    {stats ? (
                      <WinRateBar winRate={stats.win_rate} ciLow={stats.ci_low} ciHigh={stats.ci_high} />
                    ) : (
                      <span className="tnum text-xs text-[var(--muted-2)]">—</span>
                    )}
                  </td>
                  <td
                    className={`tnum px-4 py-3.5 font-medium ${
                      stats
                        ? stats.expectancy_bp >= 0
                          ? "text-[var(--up)]"
                          : "text-[var(--down)]"
                        : "text-[var(--muted-2)]"
                    }`}
                  >
                    {stats ? formatBp(stats.expectancy_bp) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[var(--muted)]">
                    {stats ? translateVerdict(stats.verdict, locale) : "—"}
                  </td>
                  <td className="tnum hidden px-4 py-3.5 text-xs text-[var(--muted)] sm:table-cell">
                    {s.trades_per_day != null ? `${s.trades_per_day.toFixed(1)}/day` : "—"}
                  </td>
                  <td className="tnum hidden px-4 py-3.5 text-xs text-[var(--muted)] sm:table-cell">
                    {s.avg_hold_minutes != null ? formatHoldMinutes(s.avg_hold_minutes) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Shows which market(s) a strategy trades in, each with its own trip count
// (from `by_market` — computed server-side per market, not re-derived here).
function MarketBadges({ asia, us }: { asia: MarketStats | null; us: MarketStats | null }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {asia && (
        <span className="tnum rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium">
          KR {asia.trips}
        </span>
      )}
      {us && (
        <span className="tnum rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium">
          US {us.trips}
        </span>
      )}
    </div>
  );
}

function WinRateBar({
  winRate,
  ciLow,
  ciHigh,
}: {
  winRate: number;
  ciLow: number;
  ciHigh: number;
}) {
  const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
  return (
    <div className="flex items-center gap-2.5">
      <span className="tnum w-9 text-xs">{pct(winRate)}</span>
      <div className="relative h-1.5 w-24 rounded-full bg-[var(--surface-2)]">
        <div
          className="absolute h-1.5 rounded-full bg-[var(--muted-2)] opacity-40"
          style={{ left: pct(ciLow), width: `${(ciHigh - ciLow) * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-[var(--surface)] bg-[var(--accent)]"
          style={{ left: pct(winRate) }}
        />
        <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-[var(--muted-2)]" style={{ left: "50%" }} />
      </div>
    </div>
  );
}
