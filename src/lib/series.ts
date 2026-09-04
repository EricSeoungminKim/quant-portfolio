// Categorical series identity for the per-strategy curves chart.
//
// Colour rules (from the dataviz method):
//   - Eight categorical hues, assigned in a FIXED order and never generated.
//   - Colour follows the entity, not its rank: the slot is derived from a
//     global, alphabetically-sorted list of *base* strategy ids, so filtering
//     the chart, toggling a line off, or a strategy climbing the ranking can
//     never repaint the survivors, and a strategy keeps the same hue in the
//     Asia panel and the US panel.
//   - The record has 15 base strategies, which is more than eight hues. The
//     documented escape from "never cycle a hue" is composite encoding, so
//     identity here is the PAIR (hue, stroke pattern): hue = slot, pattern =
//     which lap of the eight the strategy sits on. An A/B catalyst arm
//     (`<id>_cat`) shares its base strategy's hue and takes the next pattern,
//     which is what makes the pair read as a pair.
//
// The eight hexes live in globals.css as --series-1..8 (light and dark steps
// both validated with the dataviz palette validator against this page's own
// surfaces — see the comment there).

import type { StrategyCurvePoint } from "@/types/performance";

export const SERIES_SLOTS = 8;

/** Solid → dashed → dotted → dash-dot. Index = the entity's "lap". */
export const SERIES_DASH = ["", "6 3", "2 3", "10 3 2 3"] as const;

/** Mirrors quant.core.strategy_ids.base_strategy_id on the generator side. */
export function baseStrategyId(id: string): string {
  return id.endsWith("_cat") ? id.slice(0, -4) : id;
}

export interface SeriesStyle {
  /** 1-based, matches the --series-N custom property. */
  slot: number;
  color: string;
  /** SVG stroke-dasharray; "" means solid. */
  dash: string;
}

/**
 * Assign a stable (hue, pattern) pair to every id.
 *
 * Pass the FULL id list (every strategy in the snapshot, both markets), not
 * the filtered/visible subset — that is what keeps the assignment stable.
 */
export function buildSeriesStyles(allIds: string[]): Map<string, SeriesStyle> {
  const bases = Array.from(new Set(allIds.map(baseStrategyId))).sort();
  const styles = new Map<string, SeriesStyle>();
  for (const id of allIds) {
    const base = baseStrategyId(id);
    const idx = Math.max(0, bases.indexOf(base));
    const slot = (idx % SERIES_SLOTS) + 1;
    const lap = Math.floor(idx / SERIES_SLOTS) * 2 + (id === base ? 0 : 1);
    styles.set(id, {
      slot,
      color: `var(--series-${slot})`,
      dash: SERIES_DASH[Math.min(lap, SERIES_DASH.length - 1)],
    });
  }
  return styles;
}

/** One plotted line: a strategy's curve in one currency book. */
export interface CurveSeries {
  id: string;
  name: string;
  color: string;
  dash: string;
  /** `false` when the strategy is switched off in settings.yaml. */
  enabled: boolean;
  /** Lifetime verdict from `total.verdict`, already localized. */
  verdict: string;
  points: StrategyCurvePoint[];
}
