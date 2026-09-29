import type { PerformanceData } from "@/types/performance";

export const FOCUS_STRATEGY_ID = "vol_breakout_cat";

/** Existing KR epoch evidence, including the period before focus selection. */
export function researchFocus(data: PerformanceData) {
  const epoch = data.paper_epoch;
  if (!epoch || !("epoch" in epoch)) return null;
  const account = epoch.strategies.find((item) => item.id === FOCUS_STRATEGY_ID);
  const seed = account?.start_capital.KRW;
  const stats = account?.by_market?.asia;
  if (!account || !seed || seed <= 0 || !stats) return null;
  const points = [...account.curve.asia].sort((a, b) => a.date.localeCompare(b.date));
  const measured = points.length > 0 || stats.trips === 0;
  let peak = seed;
  let drawdown = 0;
  for (const point of points) {
    const equity = seed + point.cum_native;
    peak = Math.max(peak, equity);
    drawdown = Math.max(drawdown, ((peak - equity) / peak) * 100);
  }
  const last = points.at(-1);
  return {
    account, stats, points, seed,
    start: epoch.epoch.slice(0, 10), end: epoch.period.end,
    netKrw: last?.cum_native ?? (measured ? 0 : null),
    returnPct: last?.cum_pct ?? (stats.trips === 0 ? 0 : null),
    maxDrawdownPct: measured ? drawdown : null,
  };
}
