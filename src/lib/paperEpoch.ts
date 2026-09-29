import type {
  EquityCurvePoint,
  Market,
  MarketStats,
  StrategyActivity,
  PaperEpoch,
  PaperEpochCurvePoint,
  PaperEpochOverallRow,
  PaperEpochStrategy,
  PerformanceData,
  Strategy,
  StrategyCurvePoint,
} from "@/types/performance";

// Raw ko/en pair (not routed through useT()'s single-locale Messages
// object) describing the strategy-curves section's scope once it switches
// to paper_epoch data — matches the shape of every other data-sourced note
// on the page (e.g. `strategy_curves_note`/`strategy_curves_note_en`), so
// it flows through the same `translateDataText` call StrategyCurves already
// makes rather than needing a second code path.
export const EPOCH_CURVES_NOTE_KO =
  "2026-09-07 이후 독립 모의계좌 기준. 첫 화면·계좌 합계·전략 통계와 같은 기간의 비용 후 실현손익이며, 미청산 평가손익은 제외합니다.";
export const EPOCH_CURVES_NOTE_EN =
  "Independent paper accounts since 2026-09-07. Headline, account and strategy statistics share this period and measure realized P&L after costs; open-position P&L is excluded.";

/** True once `paper_epoch` is a real (non-empty) subtree. */
export function hasPaperEpoch(
  data: Pick<PerformanceData, "paper_epoch">
): data is { paper_epoch: PaperEpoch } {
  return !!data.paper_epoch && "epoch" in data.paper_epoch;
}

/** Look up one strategy's epoch account by id, or `null` if it has none
 *  (disabled / never assigned a currency — distinct from an account that
 *  exists but hasn't traded, which is an empty `curve` array instead). */
export function findEpochStrategy(
  paperEpoch: PaperEpoch,
  id: string
): PaperEpochStrategy | null {
  return paperEpoch.strategies.find((s) => s.id === id) ?? null;
}

/**
 * `PaperEpochCurvePoint[]` -> `StrategyCurvePoint[]`, so the existing
 * per-strategy curve chart can plot epoch data without any change to its
 * own code. The only real conversion is `trips` (that day's own count) into
 * `cum_trips` (a running total) — `StrategyCurveChart`'s step-after
 * rendering and the `Ranking` panel both read the cumulative count, and
 * `points` here already arrive sorted ascending by date (the generator
 * builds them that way).
 */
export function toStrategyCurvePoints(points: PaperEpochCurvePoint[]): StrategyCurvePoint[] {
  let cumTrips = 0;
  return points.map((p) => {
    cumTrips += p.trips;
    return {
      date: p.date,
      day_net: p.day_native,
      cum_net: p.cum_native,
      cum_trips: cumTrips,
      cum_pct: p.cum_pct,
    } satisfies StrategyCurvePoint;
  });
}

/**
 * `PaperEpochOverallRow[]` -> `EquityCurvePoint[]`, so the "계좌 합계" panel
 * can reuse `EquityChart` as-is. `day_pct` isn't in the source row (only
 * `day_krw` is) — it's derived here against the same `seed_krw` the
 * generator normalized `cum_pct` against, so the two stay consistent.
 * `fills` is left undefined on purpose: the generator doesn't roll up a
 * fill count at the all-accounts level, and printing `fills: 0` next to a
 * day that clearly moved money would be a lie.
 */
export function toEquityCurvePoints(
  rows: PaperEpochOverallRow[],
  seedKrw: number | null
): EquityCurvePoint[] {
  return rows.map((r) => ({
    date: r.date,
    cum_pct: r.cum_pct,
    day_pct: seedKrw ? Math.round((r.day_krw / seedKrw) * 1e6) / 1e4 : null,
  }));
}

/** Build the current scope from epoch accounts only. No lifetime fallbacks. */
export function withEpochCurves(
  strategies: Strategy[],
  data: Pick<PerformanceData, "paper_epoch">
): Strategy[] {
  if (!hasPaperEpoch(data)) return strategies;
  const epoch = data.paper_epoch;
  return epoch.strategies.map((account) => {
    const metadata = strategies.find((s) => s.id === account.id);
    if (!account.total || !account.by_market) {
      throw new Error(`Missing epoch statistics for ${account.id}; refusing lifetime fallback`);
    }
    const curve = (book: "asia" | "us", currency: "KRW" | "USD") => {
      if (account.start_capital[currency] === undefined) return [];
      const points = toStrategyCurvePoints(account.curve[book]);
      // A funded account with no closes still belongs in the comparison.
      if (!points.length) {
        const dates = [...new Set([epoch.epoch.slice(0, 10), epoch.period.end ?? epoch.epoch.slice(0, 10)])];
        return dates.map((date) => ({ date, day_net: 0, cum_net: 0, cum_trips: 0, cum_pct: 0 }));
      }
      return points;
    };
    return {
      id: account.id,
      name_ko: account.name_ko ?? metadata?.name_ko ?? account.id,
      name_en: account.name_en ?? metadata?.name_en,
      help: account.help ?? metadata?.help,
      enabled: account.enabled ?? metadata?.enabled,
      total: account.total,
      by_market: account.by_market,
      activity: account.activity,
      trades_per_day: account.trades_per_day,
      avg_hold_minutes: account.avg_hold_minutes,
      curve: { asia: curve("asia", "KRW"), us: curve("us", "USD") },
    };
  });
}

/** One source of scope for every current numerical readout. */
export function currentPerformance(data: PerformanceData): PerformanceData {
  if (!hasPaperEpoch(data)) return data;
  const epoch = data.paper_epoch;
  if (!epoch.period || !epoch.equity_asia || !epoch.equity_us || !epoch.costs) {
    throw new Error("Incomplete paper_epoch snapshot; refusing mixed-period publication");
  }
  const strategies = withEpochCurves(data.strategies, data);
  const trips = strategies.reduce((sum, strategy) => sum + strategy.total.trips, 0);
  return {
    ...data,
    period: epoch.period,
    equity_asia: epoch.equity_asia,
    equity_us: epoch.equity_us,
    strategies,
    enabled_count: strategies.filter((s) => s.enabled).length,
    strategies_note: `${epoch.period.start ?? epoch.epoch.slice(0, 10)} 이후 · ${trips}왕복 거래 · 배정된 ${strategies.length}개 전략 계좌 (미거래 포함)`,
    strategies_note_en: `Since ${epoch.period.start ?? epoch.epoch.slice(0, 10)} · ${trips} round trips · ${strategies.length} assigned strategies (including accounts with no trades)`,
    strategy_curves_note: EPOCH_CURVES_NOTE_KO,
    strategy_curves_note_en: EPOCH_CURVES_NOTE_EN,
    costs: epoch.costs,
    phases: [],
    excluded: {},
    prior_paper: {},
  };
}

/** A market filter applies to evidence and activity as well as P&L. */
export function statsForMarket(strategy: Strategy, market: "ALL" | Market): MarketStats | null {
  return market === "ALL" ? strategy.total : strategy.by_market[market === "KR" ? "asia" : "us"];
}

export function activityForMarket(strategy: Strategy, market: "ALL" | Market): Partial<StrategyActivity> | null {
  if (market === "ALL") return strategy.activity?.total ?? strategy;
  return strategy.activity?.by_market[market === "KR" ? "asia" : "us"] ?? null;
}
