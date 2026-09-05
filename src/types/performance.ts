export type Market = "KR" | "US";

export interface Phase {
  id: string;
  label: string;
  label_en?: string;
  from: string;
  to: string | null;
  seed_krw: number | null;
  seed_basis?: string;
  seed_basis_en?: string;
  note: string;
  note_en?: string;
}

// Minimal point shape the equity chart can plot — a superset used by both
// the currency equity books below (which always carry `fills`/`phase`) and
// the paper_epoch "sum of accounts" curve (which tracks neither: it has no
// single phase, and fill counts aren't rolled up at that level). `fills`
// left undefined tells EquityChart to omit the fills row/aria mention
// rather than print a dishonest "0 fills" on a day that clearly traded.
export interface EquityCurvePoint {
  date: string;
  // null when the book's seed is 0/unknown for this stretch (e.g. a
  // transplant event that didn't fund this currency's pool) — nothing to
  // normalize a percentage against, so the generator emits null rather
  // than a divide-by-zero or a made-up number.
  cum_pct: number | null;
  day_pct: number | null;
  fills?: number;
}

export interface EquityPoint extends EquityCurvePoint {
  fills: number;
  phase: string;
}

// Render-ready y-axis metadata (min/max/ticks/zero) — computed server-side
// from the same padding formula the chart used to run client-side (2026-09-02
// "render-ready JSON" directive). The x-axis is deliberately NOT here: label
// thinning depends on the actual rendered container pixel width
// (ResizeObserver), which the generator cannot know ahead of time.
export interface ChartYAxis {
  min: number;
  max: number;
  ticks: number[];
  zero: number;
}

export interface PhaseBoundaryMark {
  index: number;
  phase: string;
  label: string;
  label_en?: string;
}

// One currency-denominated equity book — Asia (KRW) or US (USD). Kept
// completely separate (no FX mixing) per the 2026-09-02 owner directive:
// post-transplant wallets are physically separate currency pools, so each
// curve is normalized against its own currency's seed.
export interface EquityBook {
  currency: "KRW" | "USD";
  seed: number | null;
  seed_basis: string;
  seed_basis_en?: string;
  rows: EquityPoint[];
  // Percent, in the same units as rows[].cum_pct (1.387 = 1.387%) — NOT a
  // fraction. Null when the book has fewer than 2 points to compute a
  // drawdown from. Optional — absent on older snapshots.
  max_drawdown_pct?: number | null;
  chart: {
    y_axis: ChartYAxis;
    phase_boundaries: PhaseBoundaryMark[];
  };
}

export interface MarketStats {
  trips: number;
  wins: number;
  win_rate: number;
  ci_low: number;
  ci_high: number;
  expectancy_bp: number;
  verdict: string;
  sample_warning: boolean;
}

export interface StrategyTotal extends MarketStats {
  markets: Market[];
}

// ---------------------------------------------------------------------------
// Strategy help ("전략 도움말 / How this strategy works")
//
// Optional block the generator attaches to each strategy so the page can
// explain what a strategy actually does instead of showing a bare row of
// statistics. Every field is optional on purpose: the generator rolls this
// out strategy by strategy, and a half-filled block must still render. The
// UI shows "설명 준비 중 / Description coming" for anything absent rather
// than inventing copy.
// ---------------------------------------------------------------------------

/** A cited source for the strategy's premise — a paper, a book, a post. */
export interface StrategyHelpRef {
  label: string;
  url: string;
}

/**
 * Coarse bucket used for the category chip. Kept as a plain string in the
 * contract (not a union) so an unrecognized value from a newer generator
 * renders as-is instead of breaking the build; the UI maps the three known
 * values to localized labels and falls back to the raw string otherwise.
 */
export type StrategyCategory = "intraday" | "swing" | "experimental";

export interface StrategyHelp {
  category?: StrategyCategory | string;
  theory_ko?: string;
  theory_en?: string;
  entry_ko?: string;
  entry_en?: string;
  exit_ko?: string;
  exit_en?: string;
  sizing_ko?: string;
  sizing_en?: string;
  evidence_ko?: string;
  evidence_en?: string;
  refs?: StrategyHelpRef[];
}

// ---------------------------------------------------------------------------
// Per-strategy equity curves ("전략별 곡선 / Strategy curves")
//
// One point per trading day on which the strategy closed at least one round
// trip — NOT one point per calendar day, so two strategies rarely share a
// date set and the chart has to carry the last cumulative value forward
// across the union of dates before the lines are comparable.
//
// `cum_net` is post-fee cumulative net P&L in the book's own currency (KRW
// for `asia`, USD for `us`) over the strategy's lifetime — a different scope
// and unit from the percentage-normalized `equity_asia`/`equity_us` books,
// which is why the two never share an axis. Every field here is optional at
// the container level: the generator rolls curves out per strategy, and an
// older snapshot has none at all.
// ---------------------------------------------------------------------------

export interface StrategyCurvePoint {
  date: string;
  /** Post-fee cumulative net P&L since the strategy's first closed trip. */
  cum_net: number;
  /** Cumulative closed round trips up to and including this date. */
  cum_trips: number;
  /** That day's own post-fee net P&L. */
  day_net: number;
  /**
   * Cumulative return as a percentage of the strategy's own starting
   * capital — only meaningful once a fixed per-strategy seed exists
   * (2026-09-06 paper_epoch account model). Absent (not just null) on the
   * lifetime curve, which has no single seed to divide by; present when
   * this point was built from `paper_epoch.strategies[].curve`.
   */
  cum_pct?: number | null;
}

/** Per-currency curves. An empty array means "no closed round trips here" —
 *  distinct from the whole `curve` block being absent (an older snapshot). */
export interface StrategyCurves {
  asia?: StrategyCurvePoint[];
  us?: StrategyCurvePoint[];
}

export interface Strategy {
  id: string;
  name_ko: string;
  // English display name from the generator (2026-09-03) — preferred over the
  // static STRATEGY_NAME_EN lookup table in lib/i18nData.ts when present.
  // Optional — absent on older snapshots.
  name_en?: string;
  // Currency/market-agnostic aggregate (KR+US round trips together).
  total: StrategyTotal;
  // Same stats computed independently per market, each with its own
  // MIN_TRIPS_FOR_JUDGEMENT sample threshold — null when that market has
  // no round trips for this strategy (not invented as zero).
  by_market: {
    asia: MarketStats | null;
    us: MarketStats | null;
  };
  // Optional — absent on older snapshots.
  trades_per_day?: number;
  avg_hold_minutes?: number;
  enabled?: boolean;
  /**
   * Long-form explainer rendered by the strategy help drawer. Absent on every
   * snapshot published before the generator started emitting it — null-guard
   * at every read site.
   */
  help?: StrategyHelp | null;
  /**
   * Per-currency cumulative net P&L curves. Absent on every snapshot
   * published before the generator started emitting them — null-guard at
   * every read site (the whole curves section renders nothing when no
   * strategy carries one).
   */
  curve?: StrategyCurves | null;
}

// ---------------------------------------------------------------------------
// paper_epoch (2026-09-06 owner decision) — every strategy restarts as its
// own independent paper account (10,000,000 KRW for a KR-side account,
// $10,000 for a US-side account) from a fixed epoch (2026-09-07 00:00 KST).
// This is a second, independent scope layered on top of the fields above:
// `phases`/`equity_asia`/`equity_us`/`strategies[].curve` keep describing the
// older 2026-09-01 real-account-transplant boundary (still used by the
// generator's own non-public reports) and are untouched by this section.
//
// The whole block is optional and can be `{}` (an older snapshot, or the
// generator's ledger-side dependency not yet landed) — every read site
// must guard for that and fall back to the fields above, the same way
// `prior_paper: PriorPaper | Record<string, never>` already works.
// ---------------------------------------------------------------------------

export interface PaperEpochAccountModel {
  kr_start_krw: number;
  us_start_usd: number;
  note_ko: string;
  note_en: string;
}

export interface PaperEpochOverallRow {
  date: string;
  /** That day's net P&L across every account, converted to KRW. */
  day_krw: number;
  cum_krw: number;
  /** Percent of `overall.seed_krw` — null only if the seed itself is 0/unknown. */
  cum_pct: number | null;
}

/** Sum-of-all-accounts equity curve ("계좌 합계" / "Sum of accounts"). */
export interface PaperEpochOverall {
  currency: "KRW";
  seed_krw: number | null;
  /**
   * Explains which FX rate converted USD accounts into this KRW sum — the
   * generator has no daily historical FX source, so this is a fixed
   * reference rate, not the actual day-specific one. Surfaced verbatim in
   * the methodology glossary rather than paraphrased.
   */
  fx_source_note: string;
  fx_source_note_en?: string;
  rows: PaperEpochOverallRow[];
  max_drawdown_pct?: number | null;
  chart: {
    y_axis: ChartYAxis;
  };
}

export interface PaperEpochCurvePoint {
  date: string;
  /** Post-fee net P&L that day, in the book's own native currency. */
  day_native: number;
  /** Post-fee cumulative net P&L since the epoch, in native currency. */
  cum_native: number;
  /** Cumulative return as % of this strategy's own start_capital for this
   *  currency — null only if that start capital is 0/unknown. */
  cum_pct: number | null;
  /** Closed round trips on this day specifically (not a running total —
   *  unlike `StrategyCurvePoint.cum_trips`). */
  trips: number;
}

export interface PaperEpochStrategy {
  id: string;
  /** Whichever currencies this strategy has an account in — a KR-only
   *  strategy carries just `KRW`, a US-only one just `USD`. */
  start_capital: { KRW?: number; USD?: number };
  /**
   * Empty array means "this account exists but hasn't traded since the
   * epoch yet" — rendered as a flat 0% line, not dropped from the list.
   * A currency missing from `start_capital` has no account at all, so its
   * array here is always empty too.
   */
  curve: {
    asia: PaperEpochCurvePoint[];
    us: PaperEpochCurvePoint[];
  };
}

export interface PaperEpoch {
  /** ISO timestamp of the epoch boundary (2026-09-07T00:00:00+09:00). */
  epoch: string;
  account_model: PaperEpochAccountModel;
  overall: PaperEpochOverall;
  /** Only strategies with a non-empty `start_capital` appear here — a
   *  strategy with no assigned account (e.g. disabled) is left out entirely,
   *  which is different from an account that exists but hasn't traded yet
   *  (see `PaperEpochStrategy.curve`). */
  strategies: PaperEpochStrategy[];
}

export interface ExcludedEntry {
  fills: number;
  note: string;
  note_en?: string;
  krw_impact: number;
  usd_impact: number;
}

export interface Costs {
  kr_stock_roundtrip_bp: number;
  kr_etf_roundtrip_bp: number;
  us_roundtrip_bp: number;
  kr_tax_bp: number;
  note: string;
  note_en?: string;
  // Percentage points (71.49 = 71.49%), optional — absent on older snapshots.
  fee_drag_pct_of_gross?: number | null;
}

export interface PriorPaper {
  sessions: number;
  fills: number;
  net_krw: number;
  note: string;
  note_en?: string;
}

export interface PerformanceData {
  generated_at: string;
  disclaimer: string;
  disclaimer_en?: string;
  period: {
    start: string | null;
    end: string | null;
    sessions: number;
    total_fills: number;
    // Optional — absent on older snapshots.
    scope?: string;
    note?: string;
    note_en?: string;
  };
  phases: Phase[];
  equity_asia: EquityBook;
  equity_us: EquityBook;
  strategies: Strategy[];
  // Optional — absent on older snapshots.
  strategies_scope?: string;
  /** Enabled strategies per settings — includes ones with no round trips yet. */
  enabled_count?: number;
  strategies_note?: string;
  strategies_note_en?: string;
  /** Scope/units caveat printed under the per-strategy curves section. */
  strategy_curves_note?: string;
  strategy_curves_note_en?: string;
  // Empty ({}) until a real-account transplant event has happened —
  // `quant.control.performance._excluded_summary` returns {} until then.
  excluded: {
    seeding_liquidation?: ExcludedEntry;
  };
  costs: Costs;
  // Empty object ({}) when there's no pre-transplant paper record to summarize.
  prior_paper?: PriorPaper | Record<string, never>;
  // 2026-09-06 paper_epoch account model — see the block above. `{}` (not
  // just absent) until the generator's ledger-side dependency lands; every
  // read site must guard for both "absent" and "present but empty".
  paper_epoch?: PaperEpoch | Record<string, never>;
}
