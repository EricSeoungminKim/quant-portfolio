// Categorical series identity for the per-strategy curves chart.
//
// Colour rules (from the dataviz method, tuned by 2026-09-04 owner direction):
//   - Colour is the ONLY identity channel — no stroke pattern. With 15 base
//     strategies + 3 catalyst `_cat` arms (18 ids total), every id gets its
//     own hue rather than sharing one with a dashed/dotted variant.
//   - Colour follows the entity, not its rank: the slot is derived from a
//     global, alphabetically-sorted list of EVERY strategy id (base and
//     `_cat` arms alike), so filtering the chart, toggling a line off, or a
//     strategy climbing the ranking can never repaint the survivors, and a
//     strategy keeps the same hue in the Asia panel and the US panel.
//   - A `_cat` catalyst arm gets a genuinely different hue from its base
//     strategy (not a shared hue + pattern) — the two are still recognizable
//     as a pair via the "A/B" chip next to both names in the legend.
//
// The 18 hexes live in globals.css as --series-1..18 (light and dark steps
// both generated in OKLCH and validated with the dataviz palette validator's
// own math — see the comment there for the numbers and the honest CVD
// caveat at this series count).

import type { StrategyCurvePoint } from "@/types/performance";

export const SERIES_SLOTS = 18;

export interface SeriesStyle {
  /** 1-based, matches the --series-N custom property. */
  slot: number;
  color: string;
}

/**
 * Assign a stable hue to every id.
 *
 * Pass the FULL id list (every strategy in the snapshot, both markets), not
 * the filtered/visible subset — that is what keeps the assignment stable.
 */
export function buildSeriesStyles(allIds: string[]): Map<string, SeriesStyle> {
  const sorted = Array.from(new Set(allIds)).sort();
  const styles = new Map<string, SeriesStyle>();
  for (const id of allIds) {
    const idx = Math.max(0, sorted.indexOf(id));
    const slot = (idx % SERIES_SLOTS) + 1;
    styles.set(id, { slot, color: `var(--series-${slot})` });
  }
  return styles;
}

/** One plotted line: a strategy's curve in one currency book. */
export interface CurveSeries {
  id: string;
  name: string;
  color: string;
  /** `false` when the strategy is switched off in settings.yaml. */
  enabled: boolean;
  /** Lifetime verdict from `total.verdict`, already localized. */
  verdict: string;
  points: StrategyCurvePoint[];
}
