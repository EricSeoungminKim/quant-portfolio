export type Market = "KR" | "US";

export interface Phase {
  id: string;
  label: string;
  from: string;
  to: string | null;
  seed_krw: number;
  note: string;
}

export interface EquityPoint {
  date: string;
  cum_pct: number;
  day_pct: number;
  fills: number;
  phase: string;
}

export interface Strategy {
  id: string;
  name_ko: string;
  trips: number;
  wins: number;
  win_rate: number;
  ci_low: number;
  ci_high: number;
  expectancy_bp: number;
  verdict: string;
  sample_warning: boolean;
  markets: Market[];
}

export interface ExcludedEntry {
  fills: number;
  note: string;
  krw_impact: number;
  usd_impact: number;
}

export interface Costs {
  kr_stock_roundtrip_bp: number;
  kr_etf_roundtrip_bp: number;
  us_roundtrip_bp: number;
  note: string;
}

export interface PerformanceData {
  generated_at: string;
  disclaimer: string;
  period: {
    start: string;
    end: string;
    sessions: number;
    total_fills: number;
  };
  phases: Phase[];
  equity: EquityPoint[];
  strategies: Strategy[];
  excluded: {
    seeding_liquidation: ExcludedEntry;
  };
  costs: Costs;
}
