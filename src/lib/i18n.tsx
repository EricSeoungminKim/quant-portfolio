"use client";

// Client-only i18n: default locale is English (matches the static-export
// HTML, so first paint is always English — no server-side i18n routing).
// A toggle switches to Korean and remembers the choice in localStorage.
// See Nav.tsx / LocaleToggle for the switch UI.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Locale = "en" | "ko";

export interface TimelineEntry {
  time: string;
  /** Which session this step belongs to — drives the rail colour and legend. */
  market: "KR" | "US" | "ALL";
  label: string;
  detail: string;
}

export interface PlaneCopy {
  id: "collect" | "analyze" | "trade" | "control";
  name: string;
  risk: string;
  may: string;
  mayNot: string;
}

interface Messages {
  /** Visually-hidden until focused — the first tab stop on the page, so a
   *  keyboard/screen-reader user can jump past the nav and locale/theme
   *  toggles straight to the record (2026-09-06 Phase 5 a11y pass). */
  skipToContent: string;
  nav: {
    brand: string;
    tagline: string;
    equity: string;
    curves: string;
    strategies: string;
    cost: string;
    how: string;
    methodology: string;
    researchVerdicts: string;
    safety: string;
    themeToggle: string;
    localeToggle: string;
    sectionsLabel: string;
    progressLabel: string;
  };
  hero: {
    badge: string;
    thesis: string;
    body: string;
    tapeLabel: string;
    tapeHint: string;
    bookAsia: string;
    bookUs: string;
    cumLabel: string;
    noData: string;
    statSessions: string;
    statFills: string;
    statTrips: string;
    statStrategies: string;
    liveCount: (enabledCount: number, totalCount: number) => string;
    scrollCue: string;
    /** Eyebrow on the account-model banner below the hero (2026-09-06
     *  paper_epoch decision) — shown regardless of whether the snapshot
     *  yet carries `paper_epoch.account_model`, since it states a fact
     *  about the site itself rather than a measured number. */
    epochBadge: string;
  };
  researchLog: {
    label: string;
    periodLabel: string;
    scopeLabel: string;
    enabledLabel: string;
    enabledUnit: (n: number) => string;
    feeDragLabel: string;
    feeDragValue: (pct: number) => string;
    tripsLabel: string;
    sessionsUnit: (n: number) => string;
  };
  verdicts: {
    title: string;
    description: string;
    countUnit: (n: number) => string;
    empty: string;
    tripsUnit: (n: number) => string;
  };
  equity: {
    eyebrow: string;
    title: string;
    description: string;
    periodLabel: string;
    sessionsCount: (n: number) => string;
    legendUp: string;
    legendDown: string;
    legendPhaseBoundary: string;
    ongoing: string;
    excludedNote: (fills: number) => string;
    priorPaperNote: (sessions: number) => string;
    yAxisTitle: string;
    xAxisTitle: string;
    zeroBaseline: string;
    seedBasisLabel: string;
    seedLabel: string;
    bookAsiaTitle: string;
    bookUsTitle: string;
    maxDrawdownLabel: string;
    maxDrawdownNA: string;
    emptyBook: string;
    chartAriaLabel: (bookTitle: string) => string;
    pointAriaLabel: (date: string, cum: string, day: string, fills: number) => string;
    /** Same reading, for a curve that doesn't track a fill count (the
     *  paper_epoch "sum of accounts" panel) — no fills clause, rather than
     *  printing a false "0 fills" on a day that clearly moved money. */
    pointAriaLabelNoFills: (date: string, cum: string, day: string) => string;
    tooltipCum: string;
    tooltipDay: string;
    tooltipFills: string;
    fillsSuffix: string;
    /** Title for the paper_epoch sum-of-accounts panel ("계좌 합계"). */
    overallBookTitle: string;
  };
  curves: {
    eyebrow: string;
    title: string;
    description: string;
    bookAsiaTitle: string;
    bookUsTitle: string;
    seriesCount: (n: number) => string;
    legendLabel: string;
    showAll: string;
    showNone: string;
    chipTitle: (name: string, trips: number, verdict: string) => string;
    rankingTitle: string;
    lastDay: string;
    tripsShort: (n: number) => string;
    xAxisTitle: string;
    breakEven: string;
    emptyMarket: string;
    tooltipDayHint: string;
    chartKeyboardHint: string;
    chartAriaLabel: (book: string, count: number, from: string, to: string) => string;
    readoutAria: (date: string, rows: string[]) => string;
    tableCaption: (book: string) => string;
    tableStrategy: string;
    tableCum: string;
    tableDay: string;
    tableTrips: string;
  };
  strategies: {
    eyebrow: string;
    title: string;
    description: string;
    marketAll: string;
    sortExpectancy: string;
    sortWinRate: string;
    sortTrips: string;
    sortLabel: string;
    headerStrategy: string;
    headerMarket: string;
    headerTrips: string;
    headerWinRate: string;
    headerExpectancy: string;
    headerVerdict: string;
    headerTradesPerDay: string;
    headerAvgHold: string;
    headerHelp: string;
    /** Column for `paper_epoch.strategies[].curve` cumulative %, per market —
     *  only rendered once the snapshot carries `paper_epoch`. */
    headerSinceEpoch: string;
    /** Title attribute on a since-epoch badge: name + native P&L, since the
     *  badge itself only has room for the percentage. */
    sinceEpochTitle: (marketLabel: string, pct: string, native: string) => string;
    sampleWarning: string;
    offBadge: string;
    liveBadge: string;
    helpOpen: string;
    helpOpenFor: (name: string) => string;
    helpTitle: string;
    close: string;
    sectionTheory: string;
    sectionEntry: string;
    sectionExit: string;
    sectionSizing: string;
    sectionEvidence: string;
    sectionRefs: string;
    missing: string;
    noHelp: string;
    categoryLabel: string;
    categoryIntraday: string;
    categorySwing: string;
    categoryExperimental: string;
    armBase: string;
    armCatalyst: string;
    armNote: string;
    statsTitle: string;
    statTrips: string;
    statWinRate: string;
    statExpectancy: string;
    statVerdict: string;
    statTradesPerDay: string;
    statAvgHold: string;
    perMarketTitle: string;
    marketAsia: string;
    marketUs: string;
    externalLink: string;
  };
  how: {
    eyebrow: string;
    title: string;
    description: string;
    planesTitle: string;
    planesNote: string;
    planes: PlaneCopy[];
    mayLabel: string;
    mayNotLabel: string;
    whenWrong: string;
    diagramTitle: string;
    diagramCaption: string;
    diagramNewsEdge: string;
    diagramSettingsEdge: string;
    diagramNoImport: string;
    timelineTitle: string;
    timelineNote: string;
    timeline: TimelineEntry[];
    legendKr: string;
    legendUs: string;
    legendAll: string;
    railsTitle: string;
    rails: { label: string; detail: string }[];
    sourcesTitle: string;
    sourcesNote: string;
    sources: { name: string; detail: string }[];
    pipelineTitle: string;
    pipelineNote: string;
    pipeline: { step: string; label: string; detail: string }[];
    pipelineCaption: string;
    abTitle: string;
    abBody: string;
    notAutomatedTitle: string;
    notAutomatedBody: string;
    aiTitle: string;
    aiPresent: string;
    aiPresentDesc: string;
    aiAbsent: string;
    aiAbsentDesc: string;
  };
  cost: {
    eyebrow: string;
    title: string;
    description: string;
    bars: { label: string }[];
    taxLabel: (bp: number) => string;
    otherLabel: (bp: number) => string;
    feeDragHeadline: string;
    feeDragCaption: string;
    breakdownTitle: string;
    noteMeasuredTitle: string;
    noteMeasuredBody: string;
    noteEdgeTitle: string;
    noteEdgeBody: string;
  };
  safety: {
    eyebrow: string;
    title: string;
    description: string;
    items: { title: string; detail: string }[];
  };
  methodology: {
    eyebrow: string;
    title: string;
    description: string;
    items: { title: string; detail: string; bpAbbr?: boolean }[];
    glossaryTitle: string;
    glossary: { term: string; definition: string }[];
    /** Title for the dynamically-appended paper_epoch account-model item —
     *  only rendered when the snapshot carries `paper_epoch.account_model`. */
    epochItemTitle: string;
    /** Glossary term label for the FX rate note on the sum-of-accounts
     *  curve — only rendered when `paper_epoch.overall.fx_source_note` exists. */
    epochFxTerm: string;
  };
  /** "What this project is" explainer near the hero (2026-09-06) — plain-language
   *  orientation for a reader who has never seen the repo, kept short on purpose. */
  aboutProject: {
    eyebrow: string;
    body: string;
  };
  /** Short "how to read this page" primer (2026-09-06 Phase 5 live-readiness) —
   *  placed near the top so a first-time reader has the vocabulary before the
   *  numbers start. Full definitions still live in Methodology's glossary;
   *  this is deliberately shorter and states data provenance + what the site
   *  explicitly is not (not live money, not advice). */
  howToRead: {
    eyebrow: string;
    title: string;
    items: { term: string; detail: string }[];
    sourceLabel: string;
    sourceDetail: string;
    notLabel: string;
    notDetail: string;
  };
  /** Research verdicts log (2026-09-06) — curated backtest/research findings from
   *  the trading repo's own research cycle, most of them rejections. Static,
   *  hand-curated data (`src/data/research-log.json`), not part of the
   *  generator's `performance.json` contract. */
  researchVerdicts: {
    eyebrow: string;
    title: string;
    description: string;
    /** States plainly that every rejected idea is listed on purpose — not a
     *  cherry-picked highlight reel. */
    intentSentence: string;
    countLabel: (n: number) => string;
    colDate: string;
    colIdea: string;
    colHeadline: string;
    colVerdict: string;
    verdictGo: string;
    verdictNoGo: string;
    verdictInsufficient: string;
    dataLabel: string;
    methodLabel: string;
    reasonLabel: string;
    sourceLabel: string;
    expandFor: (idea: string) => string;
    collapseFor: (idea: string) => string;
  };
  glossary: {
    /** Popover text for the interactive "bp" abbreviation. */
    bp: string;
  };
  editorsNote: {
    label: string;
    title: string;
    bullets: string[];
    signoff: string;
  };
  footer: {
    lastUpdated: string;
    kstSuffix: string;
    notAdvice: string;
    updatedAgo: (hours: number) => string;
    justNow: string;
    stale: string;
    freshLabel: string;
  };
}

const en: Messages = {
  skipToContent: "Skip to main content",
  nav: {
    brand: "QUANT TRADING",
    tagline: "Measurement desk",
    equity: "Equity Curve",
    curves: "Strategy Curves",
    strategies: "Strategies",
    cost: "Cost",
    how: "How It Works",
    methodology: "Methodology",
    researchVerdicts: "Research Log",
    safety: "Safeguards",
    themeToggle: "Toggle theme",
    localeToggle: "한국어",
    sectionsLabel: "Sections",
    progressLabel: "Reading progress",
  },
  hero: {
    badge: "Paper trading — not real returns",
    thesis: "A trading system with a checkable record.",
    body: "An independently built research and engineering project: collect market data, run isolated paper accounts, reconcile every fill, and publish the results. The record below includes losses and experiments that did not pass validation.",
    tapeLabel: "Session tape",
    tapeHint: "Since the account reset: closed-trade net P&L divided by allocated paper capital.",
    bookAsia: "ASIA · KRW",
    bookUs: "US · USD",
    cumLabel: "realized return",
    noData: "no fills",
    statSessions: "Days with fills",
    statFills: "Fills",
    statTrips: "Round trips",
    statStrategies: "Funded strategies",
    liveCount: (enabledCount, totalCount) =>
      `${enabledCount} enabled for paper · ${totalCount} strategies in this scope`,
    scrollCue: "Read the record",
    epochBadge: "Account model",
  },
  researchLog: {
    label: "Research log",
    periodLabel: "Window",
    scopeLabel: "Scope",
    enabledLabel: "Enabled",
    enabledUnit: (n) => `${n} strategies`,
    feeDragLabel: "Fee drag",
    feeDragValue: (pct) => `${pct.toFixed(1)}% of |gross P&L|`,
    tripsLabel: "Sample",
    sessionsUnit: (n) => `${n} sessions`,
  },
  verdicts: {
    title: "Win-rate evidence",
    description:
      "This compares the Wilson 95% win-rate interval with 50%. It does not test profitability: average gains and losses matter too. A sample warning is separate from this comparison.",
    countUnit: (n) => `${n}`,
    empty: "No strategy carries this verdict.",
    tripsUnit: (n) => `${n} trips`,
  },
  equity: {
    eyebrow: "Equity Curve",
    title: "Realized P&L curves",
    description:
      "Closed-trade net P&L divided by the allocated starting capital, including idle accounts. Open-position valuation is excluded, so these are not total account NAV or total-risk curves. KRW and USD stay separate; the account sum uses the disclosed fixed FX rate.",
    periodLabel: "Period",
    sessionsCount: (n) => `${n} session${n === 1 ? "" : "s"}`,
    legendUp: "Positive (+) — shown in red, per local market convention",
    legendDown: "Negative (−) — shown in blue, per local market convention",
    legendPhaseBoundary: "Phase boundary (live-account transplant)",
    ongoing: "ongoing",
    excludedNote: (fills) => `(${fills} excluded fills — see note above)`,
    priorPaperNote: (sessions) =>
      `The prior ${sessions}-trading-day paper record is excluded from this curve because it used a different seed.`,
    yAxisTitle: "Cumulative return (%)",
    xAxisTitle: "Trading day (KST)",
    zeroBaseline: "0% (starting seed)",
    seedBasisLabel: "Seed basis",
    seedLabel: "Seed",
    bookAsiaTitle: "Asia (KRX)",
    bookUsTitle: "US (NYSE·NASDAQ)",
    maxDrawdownLabel: "Realized P&L drawdown",
    maxDrawdownNA: "n/a (no observations)",
    emptyBook: "No fills recorded yet in this book.",
    chartAriaLabel: (bookTitle) =>
      `${bookTitle} cumulative return curve against its starting seed`,
    pointAriaLabel: (date, cum, day, fills) =>
      `${date}, cumulative ${cum}, daily ${day}, ${fills} fills`,
    pointAriaLabelNoFills: (date, cum, day) => `${date}, cumulative ${cum}, daily ${day}`,
    tooltipCum: "Cumulative",
    tooltipDay: "Daily",
    tooltipFills: "Fills",
    fillsSuffix: "fills",
    overallBookTitle: "Allocated accounts · fixed FX",
  },
  curves: {
    eyebrow: "Strategy Curves",
    title: "Strategy curves",
    description:
      "One line per strategy: cumulative net P&L after fees, in each book's own currency. This is a different unit from the equity curve above — money, not percent of seed — because the question here is which strategies are carrying the book and which are draining it. Hover, tap, or arrow-key the chart to read every line at a date; click a legend chip to hide a line.",
    bookAsiaTitle: "Asia (KRX)",
    bookUsTitle: "US (NYSE\u00b7NASDAQ)",
    seriesCount: (n) => `${n} strateg${n === 1 ? "y" : "ies"}`,
    legendLabel: "Lines",
    showAll: "All",
    showNone: "None",
    chipTitle: (name, trips, verdict) =>
      `${name} — ${trips} closed round trip${trips === 1 ? "" : "s"} · ${verdict}`,
    rankingTitle: "Ranking (latest cumulative)",
    lastDay: "last day",
    tripsShort: (n) => `${n} trip${n === 1 ? "" : "s"}`,
    xAxisTitle: "Trading days with a closed round trip (KST)",
    breakEven: "0",
    emptyMarket: "No closed round trips in this book yet.",
    tooltipDayHint: "Right column: that day's own net, when the strategy traded.",
    chartKeyboardHint:
      "Strategy curves chart. Use the left and right arrow keys to move the crosshair, Home and End for the first and last date, Escape to clear.",
    chartAriaLabel: (book, count, from, to) =>
      `${book}: cumulative net profit and loss after fees for ${count} strateg${count === 1 ? "y" : "ies"}, ${from} to ${to}. Every value is listed in the table below the chart.`,
    readoutAria: (date, rows) => `${date}. ${rows.join(", ")}.`,
    tableCaption: (book) => `${book} — latest cumulative net P&L per strategy`,
    tableStrategy: "Strategy",
    tableCum: "Cumulative net",
    tableDay: "Last day net",
    tableTrips: "Round trips",
  },
  strategies: {
    eyebrow: "Strategy Scoreboard",
    title: "Strategy Scoreboard",
    description:
      "Closed-trade statistics for the stated period. Win-rate confidence intervals describe the frequency of wins; expectancy describes the average net result per trip. Neither alone proves a durable edge.",
    marketAll: "All",
    sortExpectancy: "Expectancy",
    sortWinRate: "Win rate",
    sortTrips: "Trips",
    sortLabel: "Sort:",
    headerStrategy: "Strategy",
    headerMarket: "Market",
    headerTrips: "Trips",
    headerWinRate: "Win rate (95% CI)",
    headerExpectancy: "Expectancy",
    headerVerdict: "Win rate vs 50%",
    headerTradesPerDay: "Trades/day",
    headerAvgHold: "Avg hold",
    headerHelp: "Detail",
    headerSinceEpoch: "Since epoch (2026-09-07)",
    sinceEpochTitle: (marketLabel, pct, native) => `${marketLabel}: ${pct} (${native} net)`,
    sampleWarning: "Small sample",
    offBadge: "off",
    liveBadge: "paper",
    helpOpen: "Open",
    helpOpenFor: (name) => `How ${name} works`,
    helpTitle: "How this strategy works",
    close: "Close",
    sectionTheory: "Theory",
    sectionEntry: "Entry",
    sectionExit: "Exit",
    sectionSizing: "Sizing",
    sectionEvidence: "Evidence",
    sectionRefs: "References",
    missing: "Description coming",
    noHelp:
      "No write-up has been published for this strategy yet. Its measured record is shown below regardless.",
    categoryLabel: "Category",
    categoryIntraday: "Intraday",
    categorySwing: "Swing",
    categoryExperimental: "Experimental",
    armBase: "Base arm",
    armCatalyst: "Catalyst arm",
    armNote:
      "The arms share strategy logic; the catalyst arm restricts the universe. Compare matching periods and configurations.",
    statsTitle: "Measured record",
    statTrips: "Round trips",
    statWinRate: "Win rate (95% CI)",
    statExpectancy: "Expectancy",
    statVerdict: "Win rate vs 50%",
    statTradesPerDay: "Trades/day",
    statAvgHold: "Avg hold",
    perMarketTitle: "By market",
    marketAsia: "Asia (KRX)",
    marketUs: "US",
    externalLink: "opens in a new tab",
  },
  how: {
    eyebrow: "Architecture",
    title: "How It Works",
    description:
      "The code is split into four planes by what you lose when a plane is wrong — not by feature. The allowed dependency direction between planes is enforced by a test that walks the import graph, so the rules below are not documentation, they are build failures.",
    planesTitle: "The four planes",
    planesNote:
      "Each plane names the cost of being wrong, then earns permissions from that cost. The trade plane is the strict one because it is the only one that can lose money.",
    planes: [
      {
        id: "collect",
        name: "Collect",
        risk: "Data goes missing",
        may: "Scrape sites, call language models, fail, retry, run slowly. Nothing here is on a clock that matters.",
        mayNot: "Import the trade plane. Scraped news can edit the universe; it can never reach an order.",
      },
      {
        id: "analyze",
        name: "Analyze",
        risk: "Selection gets worse",
        may: "Score candidates, run language models, batch overnight, publish a watchlist.",
        mayNot: "Import the trade plane, or place an order. It hands over a list of names, nothing more.",
      },
      {
        id: "trade",
        name: "Trade",
        risk: "You lose money",
        may: "Read prices, apply deterministic rules, size positions, send orders, honour the risk rails.",
        mayNot:
          "Call a language model, open an HTTP or database connection, or import collect, analyze or the app layer. A hiccup in MySQL at 09:15 must not stop trading.",
      },
      {
        id: "control",
        name: "Control",
        risk: "The next session gets worse",
        may: "Aggregate the ledger, score strategies, tune parameters, run experiments, roll back, cut allocation.",
        mayNot:
          "Import the trade plane. The governor writes settings to a file; the engine picks them up at its next reload.",
      },
    ],
    mayLabel: "May",
    mayNotLabel: "May not",
    whenWrong: "If wrong →",
    diagramTitle: "Allowed dependency direction",
    diagramCaption:
      "Import tests separate analysis from the trade plane. Watchlists and validated inbox files carry inputs; control writes settings for the next reload. The external-AI inbox remains an implementation capability; its trading lane is currently disabled.",
    diagramNewsEdge: "universe only",
    diagramSettingsEdge: "settings file",
    diagramNoImport: "import forbidden",
    timelineTitle: "A day, as it actually runs",
    timelineNote:
      "KST schedule reflecting the September 30 focus change: KR catalyst breakout is the sole paper trading lane. US reporting and collection continue with automated trading disabled. Completion depends on data availability; US times follow daylight saving.",
    timeline: [
      { time: "07:30", market: "KR", label: "Report build", detail: "The daily market report is assembled from overnight data." },
      { time: "08:00", market: "KR", label: "Report publish", detail: "The report goes out, carrying a machine-readable engine JSON alongside the prose." },
      { time: "08:05", market: "KR", label: "Watchlist reset", detail: "Yesterday's auto-added names are cleared so a stale candidate cannot survive into a new session." },
      { time: "08:12", market: "KR", label: "Confidence-scored inclusion", detail: "The report's engine JSON is scored; only names above threshold are auto-registered. A market-cap floor of ₩300B and a block on names that hit the previous day's limit-up both apply here. No language model sits on this path." },
      { time: "08:27", market: "KR", label: "Universe roll", detail: "The tradable universe reloads ahead of the pre-open auction." },
      { time: "09:00", market: "KR", label: "KR open", detail: "Only KR vol_breakout_cat runs in paper mode, with configured stop, sizing and account limits plus Telegram controls." },
      { time: "14:10", market: "KR", label: "Close-report roll", detail: "The closing report's inputs refresh before the session ends." },
      { time: "15:20", market: "KR", label: "Flatten window", detail: "The KR catalyst strategy follows its session-end flatten rule. Previous overnight observation lanes are disabled." },
      { time: "15:35", market: "KR", label: "Session P&L", detail: "Korean fills are reconciled and written to the ledger." },
      { time: "15:50", market: "KR", label: "Swing recommendations", detail: "Overnight and swing ideas for the manual account are sent to Telegram as recommendations. The engine does not act on them." },
      { time: "16:25", market: "KR", label: "Performance publish", detail: "The JSON behind this page is regenerated and pushed." },
      { time: "21:40", market: "US", label: "US watchlist reset", detail: "The US side of the universe is cleared for the coming session." },
      { time: "21:50", market: "US", label: "US inclusion", detail: "The same confidence scoring runs against US candidates." },
      { time: "22:10", market: "US", label: "US universe roll", detail: "US candidate data refreshes before the open; automated US trading is disabled." },
      { time: "22:30", market: "US", label: "US open", detail: "US market collection and reports continue. No automated US strategy is enabled." },
      { time: "23:00", market: "ALL", label: "Market pulse", detail: "Digests at 23:00, 01:00, 03:00 and 05:00 summarize what moved overnight." },
      { time: "06:10", market: "US", label: "US P&L", detail: "The reporting and ledger checks continue; historical US fills remain available for comparison." },
    ],
    legendKr: "Korean session",
    legendUs: "US session",
    legendAll: "Both",
    railsTitle: "Risk rails at the open",
    rails: [
  {
    "label": "Position risk",
    "detail": "Configured stop, target and sizing limits; behavior depends on the broker path"
  },
  {
    "label": "Independent books",
    "detail": "The current KR lane has its own paper account; previous strategy books remain in history"
  },
  {
    "label": "Kill switch",
    "detail": "Telegram commands request entry suspension or liquidation"
  }
],
    sourcesTitle: "What it reads",
    sourcesNote: "The quote adapters prioritize Kiwoom and fall back to Toss. This record uses a paper broker; a separate Toss adapter supports real execution.",
    sources: [
      { name: "Kiwoom WebSocket", detail: "Real-time quotes, primary feed" },
      { name: "Toss REST", detail: "Quote fallback and the live-order adapter" },
      { name: "FRED", detail: "Macro series for the regime call" },
      { name: "Own daily report", detail: "Published 08:00 KR / 20:00 US from this same box" },
      { name: "Telegram channels", detail: "Flow and catalyst chatter, tagged not traded" },
      { name: "News RSS", detail: "News inputs filtered into evidence and event tags" },
    ],
    pipelineTitle: "How a strategy earns its way in",
    pipelineNote:
      "Research uses out-of-sample tests, cost stress and explicit acceptance criteria. Earlier parallel paper experiments included NO_GO and unvalidated ideas. The current KR candidate remains in burn-in; its selection does not establish a passed research gate.",
    pipeline: [
      { step: "01", label: "Data lake", detail: "Bars and fundamentals land locally, versioned, so a result can be re-run against the same inputs." },
      { step: "02", label: "Stage-1 screening", detail: "A cheap sweep kills obviously dead ideas before anyone spends compute on them." },
      { step: "03", label: "Walk-forward", detail: "Out-of-sample windows only, scored with a deflated Sharpe ratio so the number of trials the idea survived is priced in." },
      { step: "04", label: "Go / no-go gate", detail: "Research acceptance criteria are defined before evaluation. Earlier paper observation did not overturn failed ideas’ NO_GO verdicts." },
      { step: "05", label: "Promote to paper", detail: "Configured strategies run with market quotes and modeled paper fills and costs. Observation is distinct from research acceptance." },
      { step: "06", label: "≥ 30 round trips", detail: "Under thirty trips is flagged. Larger samples still require dependence, cost and multiple-testing checks." },
      { step: "07", label: "Owner decides", detail: "Real capital is never switched on automatically. A person reads the record and makes the call." },
    ],
    pipelineCaption: "Ideas enter at the top; almost none reach the bottom.",
    abTitle: "The catalyst A/B split",
    abBody:
      "Base and catalyst arms share strategy logic; _cat restricts the universe by news or flow tags. Earlier parallel records are preserved. The base arm is currently disabled, so a new matched baseline is required before claiming an A/B improvement.",
    notAutomatedTitle: "Previous experiments · now disabled",
    notAutomatedBody:
      "The current KR catalyst strategy is intraday. close_bet, frgn_accumulate and news_accumulate were overnight observation experiments and are now disabled. Their code and historical records are retained.",
    aiTitle: "Where AI is — and isn't",
    aiPresent: "AI used",
    aiPresentDesc:
      "Models assist reports and analysis outside the execution loop. The previous llm_trader experiment accepted external AI proposals through a validated inbox; that trading lane is now disabled.",
    aiAbsent: "Deterministic execution",
    aiAbsentDesc:
      "The trade plane makes no model or network calls directly. It validates incoming signals and applies position, sizing and risk limits before adapters execute orders. This boundary does not mean that every input is free of AI influence.",
  },
  cost: {
    eyebrow: "Cost Reality",
    title: "The Truth About Costs",
    description:
      "Costs are included in the paper ledger. Compare gross P&L, charged costs and net P&L over the same period; cost assumptions can change a strategy’s sign.",
    bars: [
      { label: "KR single stocks (round trip)" },
      { label: "KR ETFs (round trip)" },
      { label: "US (round trip)" },
    ],
    taxLabel: (bp) => `tax ${bp}bp`,
    otherLabel: (bp) => `fees ${bp}bp`,
    feeDragHeadline: "costs / absolute gross P&L",
    feeDragCaption:
      "Ledger costs divided by the absolute value of gross P&L for the displayed scope. This ratio can exceed 100% and becomes unstable near zero gross P&L. Paper charges are modeled, not proof of achieved live execution.",
    breakdownTitle: "Configured round-trip fees and taxes",
    noteMeasuredTitle: "Reflected in measurement",
    noteMeasuredBody:
      "The paper broker applies configured costs and fill assumptions. Closed-trade net expectancy includes recorded costs; this page does not establish achieved live slippage.",
    noteEdgeTitle: "When edge < cost",
    noteEdgeBody:
      "Research decisions also consider cost stress, sample size and out-of-sample evidence. A win-rate comparison with 50% is not a capital-allocation or profitability verdict.",
  },
  safety: {
    eyebrow: "Safeguards",
    title: "Safeguards",
    description:
      "Controls are implemented for paper operation and a separately configured live path. Availability of a control does not guarantee a fill or establish readiness for real capital.",
    items: [
  {
    "title": "Remote stop and liquidation",
    "detail": "Authorized Telegram commands can suspend new entries or request liquidation. Execution still depends on quotes and broker availability."
  },
  {
    "title": "Risk limits",
    "detail": "The engine checks configured position sizes, daily loss limits and cooldown rules."
  },
  {
    "title": "Protective orders",
    "detail": "The live Toss adapter supports broker-side protective-order registration when enabled and accepted. Paper stops are simulated."
  },
  {
    "title": "Operational monitoring",
    "detail": "Heartbeats, watchdogs and failure ledgers expose stale jobs and unsuccessful actions for investigation."
  },
  {
    "title": "Deployment guard",
    "detail": "The engine deployment script checks market hours before restarting the trading process."
  }
],
  },
  methodology: {
    eyebrow: "Methodology",
    title: "How the Numbers Are Computed",
    description: "The definitions behind every stat on this page, so a number never has to be taken on faith.",
    items: [
  {
    "title": "Population and period",
    "detail": "The headline uses only the KR catalyst account since the paper-epoch reset, including records before its September 30 selection. The collapsed comparison retains all strategy accounts. New observations after selection must be tracked separately."
  },
  {
    "title": "Realized net P&L",
    "detail": "Only matched, closed trips with known P&L contribute. Open-position valuation is excluded. Allocated idle capital remains in the return denominator."
  },
  {
    "title": "Win-rate evidence",
    "detail": "Wilson 95% intervals are compared with 50%. This is a win-frequency test, not a profitability test. No trips means no estimate."
  },
  {
    "title": "Expectancy (bp)",
    "detail": "The sample average net return per closed trip after ledger costs. Profitability also depends on the distribution of gains and losses; this page does not publish an expectancy confidence interval.",
    "bpAbbr": true
  },
  {
    "title": "Paper execution and costs",
    "detail": "Fees, tax and fills follow configured paper assumptions. They do not demonstrate achieved live slippage or executable liquidity."
  },
  {
    "title": "Drawdown baseline",
    "detail": "Maximum decline starts from the allocated initial capital, including a loss on the first observed day. It measures the closed-trade P&L curve only."
  },
  {
    "title": "Small-sample warning",
    "detail": "Fewer than 30 trips receives a warning. Reaching 30 is not proof of an edge; clustered trades and repeated experiments also affect confidence."
  },
  {
    "title": "Currency and benchmark",
    "detail": "KRW and USD books use their own capital. The combined book uses a fixed disclosed FX rate. No benchmark-relative return or live track record is claimed."
  }
],
    glossaryTitle: "Glossary",
    glossary: [
      { term: "bp", definition: "Basis point, 0.01%. 100bp = 1%." },
      {
        term: "Expectancy",
        definition: "Average net return per round trip, in bp — after fees, tax, and slippage.",
      },
      {
        term: "Wilson CI",
        definition:
          "A 95% confidence interval for a win rate that stays accurate at small sample sizes, unlike the normal approximation.",
      },
      {
        term: "Deflated Sharpe",
        definition:
          "A Sharpe ratio discounted for how many strategy variants were tried, so multiple-testing luck isn't mistaken for edge.",
      },
      {
        term: "Round trip",
        definition:
          "One entry paired with its matching exit — the unit every win rate and expectancy figure on this page counts.",
      },
      {
        term: "EoD flatten",
        definition:
          "Closing intraday positions near session end. Previous overnight exceptions are currently disabled.",
      },
      {
        term: "Catalyst arm",
        definition:
          "The “_cat” variant restricts symbols by news or flow catalyst tags. It was introduced for base/catalyst comparisons; currently only the KR catalyst breakout is active.",
      },
    ],
    epochItemTitle: "Paper-epoch account model",
    epochFxTerm: "Sum-of-accounts FX rate",
  },
  aboutProject: {
    eyebrow: "What this project is",
    body: "Built as an individual engineering project across Python, market-data adapters, deterministic execution, state reconciliation and AWS operations. The central design problem is making a long-running system observable and its results reproducible. Current performance, historical research and operating limitations are shown separately.",
  },
  howToRead: {
    eyebrow: "Before the numbers",
    title: "How to read this page",
    items: [
  {
    "term": "Current period",
    "detail": "The headline tracks the KR catalyst account from the September 7 paper reset, including records before its September 30 selection. The collapsed history keeps the wider strategy comparison."
  },
  {
    "term": "Allocated capital",
    "detail": "The headline return uses one KR account’s allocated starting capital, including unused cash. Aggregate strategy-account returns appear only in the historical comparison."
  },
  {
    "term": "Realized only",
    "detail": "Open-position valuation is excluded. A zero with no closed trips does not mean zero exposure or zero risk."
  },
  {
    "term": "Win rate vs 50%",
    "detail": "A Wilson interval comparison measures win frequency, not profitability. Expectancy and payoff sizes matter."
  }
],
    sourceLabel: "Where this comes from",
    sourceDetail:
      "Current statistics come from the paper ledger and are checked before scheduled publication after KR and US sessions. The research log is a separately maintained history. Inspect the source JSON and measurement notes below to reproduce current totals.",
    notLabel: "What this is not",
    notDetail:
      "Paper results exclude open-position valuation and do not establish live execution quality or excess return against a benchmark. No real capital was deployed for this record.",
  },
  researchVerdicts: {
    eyebrow: "Research Log",
    title: "Research verdicts",
    description:
      "Backtest and research findings from the trading repo's own research cycle — the evidence behind which strategies are (and mostly aren't) allowed near real capital.",
    intentSentence:
      "Every rejected idea below is listed on purpose — this is not a highlight reel of what worked.",
    countLabel: (n) => `${n} ideas logged`,
    colDate: "Date",
    colIdea: "Idea",
    colHeadline: "Headline numbers",
    colVerdict: "Verdict",
    verdictGo: "Adopted",
    verdictNoGo: "Rejected",
    verdictInsufficient: "Insufficient sample",
    dataLabel: "Data",
    methodLabel: "Method",
    reasonLabel: "Why",
    sourceLabel: "Source",
    expandFor: (idea) => `Show method and reasoning for ${idea}`,
    collapseFor: (idea) => `Hide method and reasoning for ${idea}`,
  },
  glossary: {
    bp: "bp (basis point) = 0.01%. 100bp = 1%. E.g. net −25bp = −0.25% of turnover.",
  },
  editorsNote: {
    label: "Editor's note",
    title: "Why publish this now",
    bullets: [
  "The trading repository is private. The public JSON and measurement notes make the displayed totals inspectable without credentials.",
  "Historical research includes rejected hypotheses and corrections. Current paper observations do not overturn those research decisions.",
  "This is a system-building and measurement project. The published record does not establish a profitable strategy or readiness for live capital."
],
    signoff: "Published from the same box that runs the engine.",
  },
  footer: {
    lastUpdated: "Last updated:",
    kstSuffix: "(KST)",
    notAdvice: "Nothing on this page is investment advice.",
    updatedAgo: (hours) => `updated ${hours}h ago`,
    justNow: "updated just now",
    stale: "stale",
    freshLabel: "Data freshness",
  },
};

const ko: Messages = {
  skipToContent: "본문으로 바로가기",
  nav: {
    brand: "QUANT TRADING",
    tagline: "측정 데스크",
    equity: "수익 곡선",
    curves: "전략별 곡선",
    strategies: "전략별 성적",
    cost: "비용",
    how: "작동 원리",
    methodology: "산출 방식",
    researchVerdicts: "검증 로그",
    safety: "안전장치",
    themeToggle: "테마 전환",
    localeToggle: "EN",
    sectionsLabel: "목차",
    progressLabel: "읽은 분량",
  },
  hero: {
    badge: "모의투자 (paper) — 실제 수익이 아닙니다",
    thesis: "기록으로 검증하는 자동매매 시스템.",
    body: "시장 데이터 수집부터 독립 모의계좌 운용, 체결 대사, 성과 공개까지 직접 구축한 연구·엔지니어링 프로젝트입니다. 손실과 검증을 통과하지 못한 실험도 함께 기록합니다.",
    tapeLabel: "세션 테이프",
    tapeHint: "계좌 재시작 이후 종결 거래 순손익 ÷ 배정된 모의 자본",
    bookAsia: "ASIA · KRW",
    bookUs: "US · USD",
    cumLabel: "실현손익 수익률",
    noData: "체결 없음",
    statSessions: "체결 발생일",
    statFills: "체결",
    statTrips: "왕복",
    statStrategies: "계좌 배정 전략",
    liveCount: (enabledCount, totalCount) =>
      `모의 운용 활성 ${enabledCount}개 · 이 범위의 전략 ${totalCount}개`,
    scrollCue: "기록 보기",
    epochBadge: "계좌 모델",
  },
  researchLog: {
    label: "연구 로그",
    periodLabel: "구간",
    scopeLabel: "범위",
    enabledLabel: "가동",
    enabledUnit: (n) => `${n}개 전략`,
    feeDragLabel: "수수료 잠식",
    feeDragValue: (pct) => `|비용 전 손익|의 ${pct.toFixed(1)}%`,
    tripsLabel: "표본",
    sessionsUnit: (n) => `${n}거래일`,
  },
  verdicts: {
    title: "승률 검정",
    description:
      "Wilson 95% 승률 신뢰구간을 50%와 비교합니다. 수익성 검정이 아니며 평균 이익과 손실도 함께 봐야 합니다. 소표본 경고는 이 비교와 별개입니다.",
    countUnit: (n) => `${n}`,
    empty: "이 판정에 해당하는 전략이 없습니다.",
    tripsUnit: (n) => `${n}왕복`,
  },
  equity: {
    eyebrow: "Equity Curve",
    title: "실현손익 곡선",
    description:
      "종결 거래 순손익을 유휴 계좌를 포함한 배정 시작 자본으로 나눕니다. 미청산 포지션 평가손익은 제외하므로 전체 계좌 가치나 전체 위험을 나타내지 않습니다. KRW·USD는 별도로 표시하고, 계좌 합계에만 명시된 고정 환율을 적용합니다.",
    periodLabel: "기간",
    sessionsCount: (n) => `${n}거래일`,
    legendUp: "양수(+) — 국내 관행상 빨강",
    legendDown: "음수(−) — 국내 관행상 파랑",
    legendPhaseBoundary: "단계 경계 (실계좌 이식)",
    ongoing: "진행 중",
    excludedNote: (fills) => `(제외된 체결 ${fills}건)`,
    priorPaperNote: (sessions) =>
      `이전 모의 운용 ${sessions}거래일 기록은 시드가 달라 곡선에 포함하지 않음`,
    yAxisTitle: "누적 수익률 (%)",
    xAxisTitle: "거래일 (KST)",
    zeroBaseline: "0% (시작 시드)",
    seedBasisLabel: "시드 기준",
    seedLabel: "시드",
    bookAsiaTitle: "아시아 (KRX)",
    bookUsTitle: "미국 (NYSE·NASDAQ)",
    maxDrawdownLabel: "실현손익 최대낙폭",
    maxDrawdownNA: "산출 불가 (관측 없음)",
    emptyBook: "이 북에는 아직 집계된 체결이 없습니다.",
    chartAriaLabel: (bookTitle) => `${bookTitle} 시작 시드 대비 누적 수익률 곡선`,
    pointAriaLabel: (date, cum, day, fills) =>
      `${date}, 누적 ${cum}, 당일 ${day}, 체결 ${fills}건`,
    pointAriaLabelNoFills: (date, cum, day) => `${date}, 누적 ${cum}, 당일 ${day}`,
    tooltipCum: "누적",
    tooltipDay: "당일",
    tooltipFills: "체결",
    fillsSuffix: "건",
    overallBookTitle: "배정 계좌 합계 · 고정 환율",
  },
  curves: {
    eyebrow: "전략별 곡선",
    title: "전략별 곡선",
    description:
      "전략 하나가 선 하나다. 수수료를 뺀 누적 순손익을, 각 장부의 통화 그대로 그렸다. 위의 수익 곡선과 단위가 다르다 — 시드 대비 퍼센트가 아니라 금액이다. 여기서 묻는 것이 \u201c어느 전략이 버티고 어느 전략이 갉아먹는가\u201d이기 때문이다. 차트에 커서를 올리거나 터치하거나 방향키를 누르면 그 날짜의 모든 선을 한 번에 읽을 수 있고, 범례 칩을 누르면 선을 숨긴다.",
    bookAsiaTitle: "아시아 (KRX)",
    bookUsTitle: "미국 (NYSE\u00b7NASDAQ)",
    seriesCount: (n) => `전략 ${n}개`,
    legendLabel: "선",
    showAll: "전부",
    showNone: "없음",
    chipTitle: (name, trips, verdict) => `${name} — 종결 왕복 ${trips}회 · ${verdict}`,
    rankingTitle: "순위 (최신 누적)",
    lastDay: "당일",
    tripsShort: (n) => `왕복 ${n}회`,
    xAxisTitle: "종결 왕복이 있었던 거래일 (KST)",
    breakEven: "0",
    emptyMarket: "이 장부에는 아직 종결된 왕복이 없다.",
    tooltipDayHint: "오른쪽 값은 그날 거래가 있었던 전략의 당일 순손익이다.",
    chartKeyboardHint:
      "전략별 곡선 차트. 좌우 방향키로 십자선을 옮기고, Home·End로 처음·마지막 날짜로, Esc로 해제한다.",
    chartAriaLabel: (book, count, from, to) =>
      `${book}: 전략 ${count}개의 수수료 차감 누적 순손익, ${from}부터 ${to}까지. 모든 값은 차트 아래 표에 있다.`,
    readoutAria: (date, rows) => `${date}. ${rows.join(", ")}.`,
    tableCaption: (book) => `${book} — 전략별 최신 누적 순손익`,
    tableStrategy: "전략",
    tableCum: "누적 순손익",
    tableDay: "당일 순손익",
    tableTrips: "종결 왕복",
  },
  strategies: {
    eyebrow: "Strategy Scoreboard",
    title: "전략별 성적표",
    description:
      "표시된 기간의 종결 거래 통계입니다. 승률 신뢰구간은 이기는 빈도, 기대값은 왕복당 평균 순수익을 뜻합니다. 어느 하나만으로 지속적인 수익성을 입증할 수 없습니다.",
    marketAll: "전체",
    sortExpectancy: "기대값",
    sortWinRate: "승률",
    sortTrips: "왕복",
    sortLabel: "정렬:",
    headerStrategy: "전략",
    headerMarket: "시장",
    headerTrips: "왕복",
    headerWinRate: "승률 (95% CI)",
    headerExpectancy: "기대값",
    headerVerdict: "승률과 50% 비교",
    headerTradesPerDay: "일평균 거래",
    headerAvgHold: "평균 보유",
    headerHelp: "설명",
    headerSinceEpoch: "에폭 이후 (2026-09-07~)",
    sinceEpochTitle: (marketLabel, pct, native) => `${marketLabel}: ${pct} (순손익 ${native})`,
    sampleWarning: "표본 부족",
    offBadge: "비활성",
    liveBadge: "모의 가동",
    helpOpen: "열기",
    helpOpenFor: (name) => `${name} 전략 도움말 열기`,
    helpTitle: "전략 도움말",
    close: "닫기",
    sectionTheory: "이론",
    sectionEntry: "진입",
    sectionExit: "청산",
    sectionSizing: "사이징",
    sectionEvidence: "근거",
    sectionRefs: "참고문헌",
    missing: "설명 준비 중",
    noHelp:
      "이 전략의 설명은 아직 발행되지 않았습니다. 그래도 측정된 기록은 아래에 그대로 보여줍니다.",
    categoryLabel: "분류",
    categoryIntraday: "단타",
    categorySwing: "스윙",
    categoryExperimental: "실험",
    armBase: "기본 갈래",
    armCatalyst: "촉매 갈래",
    armNote:
      "A/B 짝입니다. 두 갈래의 파라미터는 완전히 같고, 볼 수 있는 유니버스만 다릅니다.",
    statsTitle: "측정된 기록",
    statTrips: "왕복",
    statWinRate: "승률 (95% CI)",
    statExpectancy: "기대값",
    statVerdict: "승률과 50% 비교",
    statTradesPerDay: "일평균 거래",
    statAvgHold: "평균 보유",
    perMarketTitle: "시장별",
    marketAsia: "아시아 (KRX)",
    marketUs: "미국",
    externalLink: "새 탭에서 열림",
  },
  how: {
    eyebrow: "Architecture",
    title: "어떻게 작동하는가",
    description:
      "코드는 기능이 아니라 ‘그 평면이 틀렸을 때 무엇을 잃는가’로 4개 평면으로 나뉩니다. 평면 사이의 허용된 의존 방향은 임포트 그래프를 걷는 테스트가 강제합니다 — 아래 규칙은 문서가 아니라 빌드 실패 조건입니다.",
    planesTitle: "네 개의 평면",
    planesNote:
      "각 평면은 먼저 ‘틀렸을 때의 비용’을 밝히고, 그 비용에서 권한을 받아옵니다. 거래 평면이 가장 엄격한 이유는 그것만이 돈을 잃을 수 있기 때문입니다.",
    planes: [
      {
        id: "collect",
        name: "수집",
        risk: "데이터가 빈다",
        may: "스크래핑, 언어모델 호출, 실패, 재시도, 느린 실행 — 여기에는 지켜야 할 시계가 없습니다.",
        mayNot: "거래 평면 임포트. 스크래핑한 뉴스는 유니버스를 편집할 뿐, 주문까지 갈 수 없습니다.",
      },
      {
        id: "analyze",
        name: "분석",
        risk: "종목 선정이 나빠진다",
        may: "후보 채점, 언어모델 판단, 야간 배치, 관심종목 발행.",
        mayNot: "거래 평면 임포트, 주문 집행. 넘기는 것은 종목 목록 하나뿐입니다.",
      },
      {
        id: "trade",
        name: "거래",
        risk: "돈을 잃는다",
        may: "시세 읽기, 결정론적 규칙 적용, 사이징, 주문 전송, 리스크 레일 준수.",
        mayNot:
          "언어모델 호출, HTTP·DB 연결, collect·analyze·apps 임포트. 09:15에 MySQL이 딸꾹질했다고 매매가 멈추면 안 됩니다.",
      },
      {
        id: "control",
        name: "제어",
        risk: "다음 세션이 나빠진다",
        may: "원장 집계, 전략 채점, 파라미터 조정, 실험, 롤백, 자본 배분 축소.",
        mayNot:
          "거래 평면 임포트. 거버너는 설정 파일에 쓰고, 엔진이 다음 리로드에 읽어갑니다.",
      },
    ],
    mayLabel: "허용",
    mayNotLabel: "금지",
    whenWrong: "틀리면 →",
    diagramTitle: "허용된 의존 방향",
    diagramCaption:
      "임포트 테스트로 분석과 거래 평면을 분리합니다. 관심종목·검증된 인박스 파일로 입력을 전달하고, 제어는 다음 리로드용 설정을 씁니다. 외부 AI 인박스 구현은 남아 있지만 해당 매매 레인은 현재 비활성입니다.",
    diagramNewsEdge: "유니버스만",
    diagramSettingsEdge: "설정 파일",
    diagramNoImport: "임포트 금지",
    timelineTitle: "하루가 실제로 도는 순서",
    timelineNote:
      "9월 30일 전환을 반영한 KST 일정입니다. KR 촉매형만 모의 매매하며 US는 자동매매를 중단하고 리포트·수집을 유지합니다. 완료 시각은 데이터 가용성에 따라 달라지며 미국장 시각은 서머타임을 따릅니다.",
    timeline: [
      { time: "07:30", market: "KR", label: "리포트 빌드", detail: "야간 데이터로 데일리 마켓 리포트를 조립합니다." },
      { time: "08:00", market: "KR", label: "리포트 발행", detail: "산문과 함께 기계가 읽을 수 있는 엔진 JSON이 같이 나갑니다." },
      { time: "08:05", market: "KR", label: "관심종목 리셋", detail: "어제 자동 등록된 종목을 비웁니다. 낡은 후보가 새 세션까지 살아남지 못하게." },
      { time: "08:12", market: "KR", label: "확신도 채점 자동 등록", detail: "리포트의 엔진 JSON을 채점해 임계 통과분만 자동 등록합니다. 시가총액 3,000억원 하한과 전일 상한가 종목 차단이 여기서 걸립니다. 이 경로에 언어모델은 없습니다." },
      { time: "08:27", market: "KR", label: "유니버스 롤", detail: "동시호가 전에 매매 가능 유니버스를 리로드합니다." },
      { time: "09:00", market: "KR", label: "한국장 개장", detail: "KR vol_breakout_cat 하나만 모의 운용합니다. 설정된 손절·사이징·계좌 한도와 텔레그램 제어를 적용합니다." },
      { time: "14:10", market: "KR", label: "마감 리포트 롤", detail: "장 마감 전에 마감 리포트의 입력을 갱신합니다." },
      { time: "15:20", market: "KR", label: "청산 구간", detail: "KR 촉매형에 장 마감 청산 규칙을 적용합니다. 이전 오버나이트 관찰 레인은 현재 비활성입니다." },
      { time: "15:35", market: "KR", label: "세션 손익", detail: "한국장 체결을 정산해 원장에 적습니다." },
      { time: "15:50", market: "KR", label: "스윙 추천", detail: "오버나이트·스윙 아이디어를 수동 계좌용 추천으로 텔레그램에 보냅니다. 엔진은 이것으로 매매하지 않습니다." },
      { time: "16:25", market: "KR", label: "성과 발행", detail: "이 페이지가 읽는 JSON을 다시 만들어 배포합니다." },
      { time: "21:40", market: "US", label: "미국 관심종목 리셋", detail: "다가올 세션을 위해 유니버스의 미국 쪽을 비웁니다." },
      { time: "21:50", market: "US", label: "미국 자동 등록", detail: "같은 확신도 채점을 미국 후보에 돌립니다." },
      { time: "22:10", market: "US", label: "미국 유니버스 롤", detail: "미국장 개장 전에 후보 데이터를 갱신합니다. US 자동매매는 중단된 상태입니다." },
      { time: "22:30", market: "US", label: "미국장 개장", detail: "미국 시장 수집·리포트를 계속합니다. 활성화된 US 자동매매 전략은 없습니다." },
      { time: "23:00", market: "ALL", label: "마켓 펄스", detail: "23:00·01:00·03:00·05:00에 밤사이 움직임을 요약해 보냅니다." },
      { time: "06:10", market: "US", label: "미국 손익", detail: "리포트·원장 점검을 유지합니다. 과거 US 체결 기록은 비교 자료로 남깁니다." },
    ],
    legendKr: "한국장",
    legendUs: "미국장",
    legendAll: "공통",
    railsTitle: "개장 시 리스크 레일",
    rails: [
  {
    "label": "포지션 위험",
    "detail": "설정된 손절·목표·사이징 한도 적용, 브로커 경로에 따라 집행 방식이 다름"
  },
  {
    "label": "독립 장부",
    "detail": "현재 KR 레인의 독립 모의계좌를 관리하고 이전 전략 장부는 이력으로 보존"
  },
  {
    "label": "킬 스위치",
    "detail": "텔레그램으로 신규 진입 중단 또는 청산 요청"
  }
],
    sourcesTitle: "무엇을 읽는가",
    sourcesNote: "시세 어댑터는 키움을 우선하고 Toss로 폴백합니다. 이 기록은 모의 브로커를 사용하며 실주문용 Toss 어댑터는 별도로 존재합니다.",
    sources: [
      { name: "키움 웹소켓", detail: "실시간 시세, 주 경로" },
      { name: "Toss REST", detail: "시세 폴백 + 실거래 주문 어댑터" },
      { name: "FRED", detail: "국면 판정용 매크로 시계열" },
      { name: "자체 데일리 리포트", detail: "같은 서버에서 KR 08:00 / US 20:00 발행" },
      { name: "텔레그램 채널", detail: "수급·촉매 정보 — 태깅용이지 매매 신호가 아님" },
      { name: "뉴스 RSS", detail: "뉴스 입력을 근거와 이벤트 태그로 정리" },
    ],
    pipelineTitle: "전략이 들어오는 관문",
    pipelineNote:
      "연구에서는 표본 외 검증·비용 스트레스·채택 기준을 적용합니다. 이전 병렬 모의 실험에는 NO_GO·미검증 아이디어도 포함됐습니다. 현재 KR 후보도 burn-in 단계이며 주력 선정이 연구 검증 통과를 뜻하지 않습니다.",
    pipeline: [
      { step: "01", label: "데이터 레이크", detail: "봉·재무 데이터를 버전을 붙여 로컬에 쌓습니다. 같은 입력으로 결과를 다시 돌릴 수 있도록." },
      { step: "02", label: "1차 스크리닝", detail: "값싼 스윕으로 명백히 죽은 아이디어를 먼저 걸러냅니다." },
      { step: "03", label: "워크포워드", detail: "표본 외 구간만 사용하고, deflated Sharpe로 채점해 그 아이디어가 통과한 시도 횟수를 값에 반영합니다." },
      { step: "04", label: "Go / No-go 게이트", detail: "연구 전에 정한 채택 기준입니다. 이전에 모의 관찰을 진행한 기각 아이디어도 NO_GO 판정은 유지됩니다." },
      { step: "05", label: "모의로 승격", detail: "설정된 전략이 시장 시세와 모의 체결·비용 가정으로 운용됩니다. 관찰은 연구 채택과 구분됩니다." },
      { step: "06", label: "30왕복 이상", detail: "30회 미만에 경고를 붙입니다. 표본이 늘어도 거래 간 상관·비용·반복 검정을 확인해야 합니다." },
      { step: "07", label: "사람이 결정", detail: "실자금은 자동으로 켜지지 않습니다. 사람이 기록을 읽고 판단합니다." },
    ],
    pipelineCaption: "아이디어는 위로 들어오고, 아래까지 내려오는 것은 거의 없습니다.",
    abTitle: "촉매 A/B 분할",
    abBody:
      "기본·촉매 갈래는 전략 로직을 공유하며 _cat은 뉴스·수급 태그가 있는 유니버스로 제한합니다. 이전 병렬 기록은 보존합니다. 현재 기본 갈래는 비활성이므로 A/B 개선을 주장하려면 같은 기간·설정의 새 기준선이 필요합니다.",
    notAutomatedTitle: "이전 실험 · 현재 비활성",
    notAutomatedBody:
      "현재 KR 촉매형은 일중 전략입니다. close_bet·frgn_accumulate·news_accumulate는 이전 오버나이트 관찰 실험이며 현재 비활성입니다. 코드와 과거 기록은 보존합니다.",
    aiTitle: "AI가 있는 자리 / 없는 자리",
    aiPresent: "AI 있음",
    aiPresentDesc:
      "모델은 실행 루프 밖에서 보고서·분석을 돕습니다. 이전 llm_trader 실험은 검증된 인박스로 외부 AI 제안을 받았으며 해당 매매 레인은 현재 비활성입니다.",
    aiAbsent: "결정론적 집행",
    aiAbsentDesc:
      "거래 평면은 모델이나 네트워크를 직접 호출하지 않습니다. 신호를 검증하고 포지션·사이징·위험 한도를 적용한 뒤 어댑터가 주문을 집행합니다. 모든 입력에서 AI 영향을 배제한다는 뜻은 아닙니다.",
  },
  cost: {
    eyebrow: "Cost Reality",
    title: "비용의 진실",
    description:
      "모의 원장에는 비용이 반영됩니다. 같은 기간의 비용 전 손익·부과 비용·순손익을 함께 비교해야 하며, 비용 가정에 따라 전략의 수익 부호가 바뀔 수 있습니다.",
    bars: [
      { label: "KR 개별주 (왕복)" },
      { label: "KR ETF (왕복)" },
      { label: "US (왕복)" },
    ],
    taxLabel: (bp) => `세금 ${bp}bp`,
    otherLabel: (bp) => `수수료 ${bp}bp`,
    feeDragHeadline: "비용 / |비용 전 실현손익|",
    feeDragCaption:
      "표시 범위의 원장 비용을 비용 전 손익의 절댓값으로 나눈 비율입니다. 100%를 넘을 수 있고 분모가 0에 가까우면 불안정합니다. 모의 비용이며 실거래 체결 품질의 증거가 아닙니다.",
    breakdownTitle: "설정된 상품별 왕복 수수료·세금",
    noteMeasuredTitle: "측정에 반영",
    noteMeasuredBody:
      "모의 브로커가 설정된 비용과 체결 가정을 적용합니다. 종결 거래 순기대값에는 기록된 비용이 포함되며, 이 페이지로 실거래 슬리피지를 입증하지 않습니다.",
    noteEdgeTitle: "엣지 < 비용일 때",
    noteEdgeBody:
      "연구 판단에는 비용 스트레스·표본 크기·표본 외 근거도 사용합니다. 승률을 50%와 비교한 결과가 자본 배분이나 수익성 판정을 뜻하지는 않습니다.",
  },
  safety: {
    eyebrow: "Safeguards",
    title: "안전장치",
    description:
      "모의 운용과 별도로 설정하는 실주문 경로에 제어 장치가 구현돼 있습니다. 장치의 존재가 체결이나 실자금 투입 준비를 보장하지는 않습니다.",
    items: [
  {
    "title": "원격 정지·청산",
    "detail": "인증된 텔레그램 명령으로 신규 진입 중단이나 청산을 요청합니다. 실제 집행은 시세와 브로커 가용성에 영향을 받습니다."
  },
  {
    "title": "위험 한도",
    "detail": "엔진이 설정된 포지션 크기·일일 손실 한도·쿨다운 규칙을 검사합니다."
  },
  {
    "title": "보호 주문",
    "detail": "실주문 Toss 어댑터는 활성화·접수 조건을 충족할 때 브로커 측 보호 주문을 등록합니다. 모의 손절은 시뮬레이션됩니다."
  },
  {
    "title": "운영 감시",
    "detail": "하트비트·워치독·실패 원장으로 갱신이 멈춘 작업과 실패한 동작을 드러냅니다."
  },
  {
    "title": "배포 가드",
    "detail": "엔진 배포 스크립트가 거래 프로세스 재시작 전에 장중 여부를 검사합니다."
  }
],
  },
  methodology: {
    eyebrow: "Methodology",
    title: "숫자를 계산하는 방식",
    description: "이 페이지의 모든 수치가 어떻게 계산되는지 — 숫자를 그냥 믿을 필요가 없도록.",
    items: [
  {
    "title": "대상과 기간",
    "detail": "상단은 모의계좌 재시작 이후 KR 촉매형 한 계좌이며 9월 30일 선정 전 기록도 포함합니다. 접힌 과거 비교는 전체 전략 계좌를 보존합니다. 선정 이후 새 표본은 별도로 추적해야 합니다."
  },
  {
    "title": "실현 순손익",
    "detail": "짝이 맞고 손익을 아는 종결 왕복만 집계합니다. 미청산 평가손익은 제외하며 배정된 유휴 자본은 수익률 분모에 포함합니다."
  },
  {
    "title": "승률 검정",
    "detail": "Wilson 95% 구간을 50%와 비교합니다. 수익성이 아닌 승리 빈도 검정입니다. 종결 거래가 없으면 추정값도 없습니다."
  },
  {
    "title": "기대값(bp)",
    "detail": "원장 비용을 차감한 종결 왕복당 평균 수익률입니다. 이익·손실 분포도 함께 고려해야 하며 이 페이지는 기대값 신뢰구간을 제공하지 않습니다.",
    "bpAbbr": true
  },
  {
    "title": "모의 체결과 비용",
    "detail": "수수료·세금·체결에 설정된 모의 가정을 적용합니다. 실거래 슬리피지나 실행 가능한 유동성을 입증하는 값은 아닙니다."
  },
  {
    "title": "낙폭의 시작점",
    "detail": "배정 시작 자본을 최초 고점에 포함해 첫 관측일 손실도 반영합니다. 종결 거래 손익 곡선의 낙폭만 측정합니다."
  },
  {
    "title": "소표본 경고",
    "detail": "30왕복 미만에 경고를 붙입니다. 30건 도달이 엣지의 증거는 아니며 거래 간 상관과 반복 실험도 확신도에 영향을 줍니다."
  },
  {
    "title": "통화와 벤치마크",
    "detail": "KRW·USD 계좌는 각 통화의 자본을 기준으로 계산합니다. 합계에만 명시된 고정 환율을 적용합니다. 벤치마크 초과수익이나 실거래 실적을 주장하지 않습니다."
  }
],
    glossaryTitle: "용어 사전",
    glossary: [
      { term: "bp", definition: "베이시스 포인트, 0.01%. 100bp = 1%." },
      {
        term: "기대값(Expectancy)",
        definition: "왕복 1회당 평균 순수익률(bp) — 수수료·세금·슬리피지를 뺀 값.",
      },
      {
        term: "Wilson CI",
        definition: "표본이 작아도 과신하지 않는 승률 95% 신뢰구간.",
      },
      {
        term: "Deflated Sharpe",
        definition: "몇 번의 변형을 시도했는지를 반영해 할인한 샤프 비율 — 다중검정에 의한 우연을 엣지로 착각하지 않도록.",
      },
      {
        term: "왕복(Round trip)",
        definition: "진입과 그에 대응하는 청산을 짝지은 한 단위 — 이 페이지의 모든 승률·기대값이 세는 기준.",
      },
      {
        term: "EoD 청산(Flatten)",
        definition: "일중 전략의 장 마감 청산 규칙입니다. 이전 오버나이트 예외 레인은 현재 비활성입니다.",
      },
      {
        term: "촉매 갈래(Catalyst arm)",
        definition:
          "id가 “_cat”으로 끝나는 전략 갈래는 뉴스·수급 촉매 태그로 종목을 제한합니다. 기본·촉매 비교를 위해 도입했으며 현재는 KR 촉매형 돌파만 활성화돼 있습니다.",
      },
    ],
    epochItemTitle: "모의계좌 에폭 계좌 모델",
    epochFxTerm: "계좌 합계 환산환율",
  },
  aboutProject: {
    eyebrow: "이 프로젝트는 무엇인가",
    body: "Python, 시세 어댑터, 결정론적 주문 처리, 상태 대사, AWS 운영을 직접 연결한 개인 엔지니어링 프로젝트입니다. 장시간 가동하는 시스템의 상태를 관측하고 결과를 재현할 수 있게 만드는 데 초점을 뒀습니다. 현재 성과·과거 연구·운영 한계를 구분해 공개합니다.",
  },
  howToRead: {
    eyebrow: "숫자를 보기 전에",
    title: "이 페이지 읽는 법",
    items: [
  {
    "term": "현재 기간",
    "detail": "상단은 9월 7일 모의계좌 재시작 이후 KR 촉매형 한 계좌이며 9월 30일 선정 전 기록도 포함합니다. 전체 전략 비교는 접힌 과거 기록에 남깁니다."
  },
  {
    "term": "배정 자본",
    "detail": "상단 수익률의 분모는 유휴 자금을 포함한 KR 한 계좌의 초기 배정 자본입니다. 전체 전략 계좌 합산 수익률은 과거 비교에서만 표시합니다."
  },
  {
    "term": "실현손익만",
    "detail": "미청산 평가손익은 제외합니다. 종결 거래 없이 0으로 표시됐다고 노출이나 위험도 0이라는 뜻은 아닙니다."
  },
  {
    "term": "승률과 50% 비교",
    "detail": "Wilson 구간으로 승리 빈도를 비교하며 수익성 판정이 아닙니다. 기대값과 손익 크기도 함께 봐야 합니다."
  }
],
    sourceLabel: "데이터 출처",
    sourceDetail:
      "현재 통계는 모의 거래 원장에서 생성해 검증하고 KR·US 세션 이후 정기 발행합니다. 연구 로그는 별도로 관리하는 이력입니다. 아래 원본 JSON과 측정 기준 문서로 현재 집계를 재현할 수 있습니다.",
    notLabel: "이 페이지가 아닌 것",
    notDetail:
      "모의 기록으로, 미청산 평가손익을 제외합니다. 실거래 체결 품질이나 벤치마크 초과수익을 입증하지 않으며 이 기록에 실자금은 투입되지 않았습니다.",
  },
  researchVerdicts: {
    eyebrow: "Research Log",
    title: "검증 로그",
    description:
      "트레이딩 저장소 자체의 연구 사이클에서 나온 백테스트·연구 결과입니다 — 어느 전략이 실자본 근처에 갈 수 있는지(대부분은 못 간다는) 판단의 근거입니다.",
    intentSentence: "아래 기각된 아이디어는 전부 일부러 실었습니다 — 잘된 것만 고른 하이라이트가 아닙니다.",
    countLabel: (n) => `${n}건 기록`,
    colDate: "날짜",
    colIdea: "아이디어",
    colHeadline: "핵심 수치",
    colVerdict: "판정",
    verdictGo: "채택",
    verdictNoGo: "기각",
    verdictInsufficient: "판단 보류",
    dataLabel: "데이터",
    methodLabel: "방법",
    reasonLabel: "이유",
    sourceLabel: "출처",
    expandFor: (idea) => `${idea}의 방법·근거 펼치기`,
    collapseFor: (idea) => `${idea}의 방법·근거 접기`,
  },
  glossary: {
    bp: "bp(베이시스 포인트) = 0.01%. 100bp = 1%. 예: 순 −25bp = 거래대금의 −0.25%",
  },
  editorsNote: {
    label: "편집자 노트",
    title: "지금 공개하는 이유",
    bullets: [
  "거래 저장소는 비공개입니다. 공개 JSON과 측정 기준 문서로 자격증명 없이 표시된 집계를 검산할 수 있습니다.",
  "과거 연구에는 기각한 가설과 정정 이력을 포함합니다. 현재 모의 관찰이 기존 연구의 기각 판정을 뒤집지는 않습니다.",
  "시스템 구축과 측정 역량을 보여주는 프로젝트입니다. 수익성 있는 전략이나 실거래 전환 준비가 입증됐다고 주장하지 않습니다."
],
    signoff: "엔진이 도는 바로 그 서버에서 발행합니다.",
  },
  footer: {
    lastUpdated: "마지막 갱신:",
    kstSuffix: "(KST)",
    notAdvice: "이 페이지의 어떤 내용도 투자 조언이 아닙니다.",
    updatedAgo: (hours) => `${hours}시간 전 갱신`,
    justNow: "방금 갱신",
    stale: "갱신 지연",
    freshLabel: "데이터 신선도",
  },
};

const messages: Record<Locale, Messages> = { en, ko };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
});

const STORAGE_KEY = "locale";

function subscribeNoop() {
  return () => {};
}

// getServerSnapshot always returns "en" so the client's first hydration
// pass matches the statically-exported HTML exactly (no mismatch). Right
// after hydration, React re-checks getSnapshot and — for a returning
// visitor with a stored "ko" preference — schedules the switch itself.
// This is useSyncExternalStore's built-in "hydrate to server value, then
// sync to the real one" behavior, so there's no manual setState-in-effect.
function getSnapshot(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ko") return stored;
  } catch {
    // localStorage unavailable (private mode) — default (en) stands.
  }
  return "en";
}
function getServerSnapshot(): Locale {
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const storedLocale = useSyncExternalStore(subscribeNoop, getSnapshot, getServerSnapshot);
  // Explicit in-session choice (via the toggle) overrides the stored value
  // immediately, without waiting for a storage read.
  const [override, setOverride] = useState<Locale | null>(null);
  const locale = override ?? storedLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setOverride(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage may be unavailable — selection just won't persist
    }
  }

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useT(): Messages {
  const { locale } = useLocale();
  return messages[locale];
}
