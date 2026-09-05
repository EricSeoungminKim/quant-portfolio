// Adapters for the 2026-09-06 paper_epoch account model — every strategy's
// own independent paper account (10,000,000 KRW / $10,000, epoch 2026-09-07
// 00:00 KST). This layer exists so the page's existing chart components
// (EquityChart, StrategyCurveChart/StrategyCurves) never need to know two
// slightly different row shapes exist — they only ever see their own native
// point types (EquityCurvePoint / StrategyCurvePoint).
//
// `paper_epoch` can be `{}` (older snapshot, or the generator's ledger-side
// dependency not yet landed) — every function here treats that the same as
// "absent" and callers fall back to the pre-epoch fields.

import type {
  EquityCurvePoint,
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
  "2026-09-07 paper_epoch 재시작 이후 — 전략마다 독립된 자기 계좌 기준이며, 위의 누적 기록과는 다르다.";
export const EPOCH_CURVES_NOTE_EN =
  "Since the 2026-09-07 paper_epoch restart: each strategy's own independent account, not the lifetime record above.";

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

/**
 * Swaps in each strategy's paper_epoch curve (since-epoch, % + native P&L)
 * wherever one exists, leaving the lifetime curve untouched otherwise — the
 * "use paper_epoch when present, fall back to the existing fields when
 * absent" rule, applied per strategy rather than as an all-or-nothing switch
 * for the whole section.
 *
 * A strategy that has a paper_epoch account but literally zero round trips
 * in its entire history (so `strategies[]` — which only lists strategies
 * with at least one closed trip — has no entry for it at all) is left out
 * here too: there's no verdict, display name, or enabled flag to show
 * alongside a curve for it, and inventing one would violate the page's
 * measured-not-selected rule. This only affects a brand-new strategy on its
 * first day with zero fills ever, which is rare enough to accept.
 */
export function withEpochCurves(
  strategies: Strategy[],
  data: Pick<PerformanceData, "paper_epoch">
): Strategy[] {
  if (!hasPaperEpoch(data)) return strategies;
  const { paper_epoch } = data;
  return strategies.map((s) => {
    const account = findEpochStrategy(paper_epoch, s.id);
    if (!account) return s;
    return {
      ...s,
      curve: {
        asia: toStrategyCurvePoints(account.curve.asia),
        us: toStrategyCurvePoints(account.curve.us),
      },
    };
  });
}
