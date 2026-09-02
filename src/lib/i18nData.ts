// Translation lookups for text that comes from public/data/performance.json
// rather than from JSX.
//
// Priority (2026-09-02 owner directive — never show mixed-language text):
//   1. The `*_en` field the generator emits directly alongside the Korean
//      field (disclaimer_en, phases[].note_en, phases[].label_en,
//      phases[].seed_basis_en, equity_*.seed_basis_en, prior_paper.note_en,
//      excluded.seeding_liquidation.note_en, costs.note_en). This is the
//      primary path — the generator (a separate repo) now owns the English
//      wording, so it can't drift out of sync with the Korean the way an
//      exact-string lookup table can.
//   2. A same-key/same-text lookup table here, used for text the generator
//      doesn't pair with an `_en` field at all (strategy names, verdicts,
//      keyed by their stable id/enum string) and as a fallback for an older
//      performance.json snapshot published before the generator added the
//      `_en` fields.
//   3. Omit — return "" rather than let raw Korean leak into the English
//      page. Mixed-language text is worse than a missing sentence.

import type { Locale } from "./i18n";

const STRATEGY_NAME_EN: Record<string, string> = {
  confluence: "Signal Confluence",
  donchian: "Donchian Channel Trend",
  gap_fade: "Gap Fade",
  intraday_momentum: "Intraday Momentum",
  intraday_scan: "Intraday High Breakout Scanner",
  llm_trader: "AI Trader",
  news_momentum: "News Momentum",
  news_scalp: "News Scalp",
  orb_scan: "Opening Range Breakout Scanner",
  overnight_drift: "Overnight Drift",
  pullback_impulse: "Pullback Impulse",
  scalp_1m: "1-Min Scalping",
  vol_breakout: "Volatility Breakout",
  frgn_accumulate: "Foreign Flow Accumulation",
  cross_momentum: "Cross-Asset Momentum",
  mean_reversion: "Mean Reversion",
  close_bet: "Closing Price Bet",
  orb: "Opening Range Breakout",
  mr_vwap_quiet: "VWAP Mean Reversion (Low Vol)",
  rsi2_dip: "RSI2 Dip",
};

const VERDICT_EN: Record<string, string> = {
  "판단 불가": "Insufficient sample",
  "유의(음)": "Significant (negative)",
  "유의(양)": "Significant (positive)",
  "기각": "Rejected",
  "채택": "Adopted",
  "판단 보류": "Judgment withheld",
};

// Fallback-only (priority 2 above) — only reached when an older
// performance.json snapshot lacks the generator's own `_en` field.
const PHASE_LABEL_EN: Record<string, string> = {
  paper: "Paper trading",
  real_seeded: "Live-account snapshot transplant",
};

const SEED_BASIS_EN: Record<string, string> = {
  "현금+이월보유": "Cash + carried-over holdings",
  "현금만": "Cash only",
  "가상 자본": "Virtual capital",
};

const DATA_TEXT_EN: Record<string, string> = {
  "모의투자(paper) 기록입니다. 실제 자금이 투입되지 않았습니다.":
    "This is a paper-trading record. No real funds were used.",
};

export function translateStrategyName(id: string, nameKo: string, locale: Locale): string {
  if (locale === "ko") return nameKo;
  return STRATEGY_NAME_EN[id] ?? "";
}

export function translateVerdict(verdict: string, locale: Locale): string {
  if (locale === "ko") return verdict;
  return VERDICT_EN[verdict] ?? "";
}

export function translatePhaseLabel(
  id: string,
  labelKo: string,
  labelEn: string | undefined,
  locale: Locale
): string {
  if (locale === "ko") return labelKo;
  if (labelEn) return labelEn;
  return PHASE_LABEL_EN[id] ?? "";
}

export function translateSeedBasis(
  basisKo: string,
  basisEn: string | undefined,
  locale: Locale
): string {
  if (locale === "ko") return basisKo;
  if (basisEn) return basisEn;
  return SEED_BASIS_EN[basisKo] ?? "";
}

export function translateDataText(
  textKo: string,
  textEn: string | undefined,
  locale: Locale
): string {
  if (locale === "ko") return textKo;
  if (textEn) return textEn;
  return DATA_TEXT_EN[textKo] ?? "";
}
