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

export interface EquityPoint {
  date: string;
  // null when the book's seed is 0/unknown for this stretch (e.g. a
  // transplant event that didn't fund this currency's pool) — nothing to
  // normalize a percentage against, so the generator emits null rather
  // than a divide-by-zero or a made-up number.
  cum_pct: number | null;
  day_pct: number | null;
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

export interface Strategy {
  id: string;
  name_ko: string;
  // Currency/market-agnostic aggregate (KR+US round trips together).
  total: StrategyTotal;
  // Same stats computed independently per market, each with its own
  // MIN_TRIPS_FOR_JUDGEMENT sample threshold — null when that market has
  // no round trips for this strategy (not invented as zero).
  by_market: {
    asia: MarketStats | null;
    us: MarketStats | null;
  };
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
  };
  phases: Phase[];
  equity_asia: EquityBook;
  equity_us: EquityBook;
  strategies: Strategy[];
  // Empty ({}) until a real-account transplant event has happened —
  // `quant.control.performance._excluded_summary` returns {} until then.
  excluded: {
    seeding_liquidation?: ExcludedEntry;
  };
  costs: Costs;
  // Empty object ({}) when there's no pre-transplant paper record to summarize.
  prior_paper?: PriorPaper | Record<string, never>;
}
