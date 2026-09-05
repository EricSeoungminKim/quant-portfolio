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
  nav: {
    brand: string;
    tagline: string;
    equity: string;
    curves: string;
    strategies: string;
    cost: string;
    how: string;
    methodology: string;
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
  nav: {
    brand: "QUANT TRADING",
    tagline: "Measurement desk",
    equity: "Equity Curve",
    curves: "Strategy Curves",
    strategies: "Strategies",
    cost: "Cost",
    how: "How It Works",
    methodology: "Methodology",
    safety: "Safeguards",
    themeToggle: "Toggle theme",
    localeToggle: "한국어",
    sectionsLabel: "Sections",
    progressLabel: "Reading progress",
  },
  hero: {
    badge: "Paper trading — not real returns",
    thesis: "Every number here is measured, not selected.",
    body: "A personal automated trading engine runs intraday strategies through Korean and US regular hours, writes every fill to a ledger, and publishes what that ledger says — including the stretches where it says the engine is losing.",
    tapeLabel: "Session tape",
    tapeHint: "Latest close of each currency book, against its own starting seed.",
    bookAsia: "ASIA · KRW",
    bookUs: "US · USD",
    cumLabel: "cumulative",
    noData: "no fills",
    statSessions: "Trading days",
    statFills: "Fills",
    statTrips: "Round trips",
    statStrategies: "Strategies",
    liveCount: (enabledCount, totalCount) =>
      `${enabledCount} live now · ${totalCount} with recorded round trips`,
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
    feeDragValue: (pct) => `${pct.toFixed(1)}% of gross`,
    tripsLabel: "Sample",
    sessionsUnit: (n) => `${n} sessions`,
  },
  verdicts: {
    title: "Verdicts",
    description:
      "Where the evidence currently stands. A verdict is a statement about the sample, not a forecast — most of these say the sample is still too thin to conclude anything.",
    countUnit: (n) => `${n}`,
    empty: "No strategy carries this verdict.",
    tripsUnit: (n) => `${n} trips`,
  },
  equity: {
    eyebrow: "Equity Curve",
    title: "Equity Curve",
    description:
      "Cumulative return against each book's own starting seed, kept separate by currency — no FX conversion between them. Hover or click a point, or move focus with the keyboard, to see that day's fill count and daily change.",
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
    maxDrawdownLabel: "Max drawdown",
    maxDrawdownNA: "n/a (<2 points)",
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
    overallBookTitle: "Sum of accounts",
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
      "Fewer round trips means wider confidence intervals on win rate and expectancy — hold off judgment on strategies flagged with a sample-size badge. Open any row to read what the strategy actually does.",
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
    headerVerdict: "Verdict",
    headerTradesPerDay: "Trades/day",
    headerAvgHold: "Avg hold",
    headerHelp: "Detail",
    headerSinceEpoch: "Since epoch (2026-09-07)",
    sinceEpochTitle: (marketLabel, pct, native) => `${marketLabel}: ${pct} (${native} net)`,
    sampleWarning: "Small sample",
    offBadge: "off",
    liveBadge: "live",
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
      "An A/B pair: both arms run identical parameters and differ only in which universe they are allowed to see.",
    statsTitle: "Measured record",
    statTrips: "Round trips",
    statWinRate: "Win rate (95% CI)",
    statExpectancy: "Expectancy",
    statVerdict: "Verdict",
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
      "News and analysis flow into the universe, never into an order. Control never touches the running engine directly — it writes settings, and the engine reads them on its next reload.",
    diagramNewsEdge: "universe only",
    diagramSettingsEdge: "settings file",
    diagramNoImport: "import forbidden",
    timelineTitle: "A day, as it actually runs",
    timelineNote:
      "All times KST. This is the live crontab, not an idealized diagram — the odd minutes are real, and they exist because something once collided at a round number.",
    timeline: [
      { time: "07:30", market: "KR", label: "Report build", detail: "The daily market report is assembled from overnight data." },
      { time: "08:00", market: "KR", label: "Report publish", detail: "The report goes out, carrying a machine-readable engine JSON alongside the prose." },
      { time: "08:05", market: "KR", label: "Watchlist reset", detail: "Yesterday's auto-added names are cleared so a stale candidate cannot survive into a new session." },
      { time: "08:12", market: "KR", label: "Confidence-scored inclusion", detail: "The report's engine JSON is scored; only names above threshold are auto-registered. A market-cap floor of ₩300B and a block on names that hit the previous day's limit-up both apply here. No language model sits on this path." },
      { time: "08:27", market: "KR", label: "Universe roll", detail: "The tradable universe reloads ahead of the pre-open auction." },
      { time: "09:00", market: "KR", label: "KR open", detail: "Korean strategies go active behind the risk rails: hard stop at −5%, target cap at +10%, a separate book per strategy, and a kill switch reachable from Telegram." },
      { time: "14:53", market: "KR", label: "Close-report roll", detail: "The closing report's inputs refresh before the session ends." },
      { time: "15:20", market: "KR", label: "Flatten window", detail: "15:20–15:30: every intraday position is closed. Nothing this engine trades is held overnight." },
      { time: "15:35", market: "KR", label: "Session P&L", detail: "Korean fills are reconciled and written to the ledger." },
      { time: "15:50", market: "KR", label: "Swing recommendations", detail: "Overnight and swing ideas for the manual account are sent to Telegram as recommendations. The engine does not act on them." },
      { time: "16:20", market: "KR", label: "Performance publish", detail: "The JSON behind this page is regenerated and pushed." },
      { time: "21:40", market: "US", label: "US watchlist reset", detail: "The US side of the universe is cleared for the coming session." },
      { time: "21:50", market: "US", label: "US inclusion", detail: "The same confidence scoring runs against US candidates." },
      { time: "22:10", market: "US", label: "US universe roll", detail: "The tradable universe reloads ahead of the US open." },
      { time: "22:30", market: "US", label: "US open", detail: "The same strategy set runs against the US universe, under the same rails." },
      { time: "23:00", market: "ALL", label: "Market pulse", detail: "Digests at 23:00, 01:00, 03:00 and 05:00 summarize what moved overnight." },
      { time: "06:10", market: "US", label: "US P&L", detail: "US fills are reconciled; the round-trip ledger that feeds this page is closed for the day." },
    ],
    legendKr: "Korean session",
    legendUs: "US session",
    legendAll: "Both",
    railsTitle: "Risk rails at the open",
    rails: [
      { label: "Hard stop", detail: "−5% per position, server-side" },
      { label: "Target cap", detail: "+10%, above which the position is taken off" },
      { label: "Per-strategy books", detail: "One strategy's drawdown cannot spend another's allocation" },
      { label: "Kill switch", detail: "One Telegram message halts entries or flattens everything" },
    ],
    sourcesTitle: "What it reads",
    sourcesNote: "Quotes come from Kiwoom first and fall back to Toss; orders go out through Toss alone.",
    sources: [
      { name: "Kiwoom WebSocket", detail: "Real-time quotes, primary feed" },
      { name: "Toss REST", detail: "Quote fallback and the single order path" },
      { name: "FRED", detail: "Macro series for the regime call" },
      { name: "Own daily report", detail: "Published 08:00 KR / 20:00 US from this same box" },
      { name: "13 Telegram channels", detail: "Flow and catalyst chatter, tagged not traded" },
      { name: "News RSS", detail: "About 4,600 articles a day, filtered down to event tags" },
    ],
    pipelineTitle: "How a strategy earns its way in",
    pipelineNote:
      "Nothing is deployed because it looked good in a notebook. A separate local backtest repository has to clear it first, and paper trading has to survive it afterwards.",
    pipeline: [
      { step: "01", label: "Data lake", detail: "Bars and fundamentals land locally, versioned, so a result can be re-run against the same inputs." },
      { step: "02", label: "Stage-1 screening", detail: "A cheap sweep kills obviously dead ideas before anyone spends compute on them." },
      { step: "03", label: "Walk-forward", detail: "Out-of-sample windows only, scored with a deflated Sharpe ratio so the number of trials the idea survived is priced in." },
      { step: "04", label: "Go / no-go gate", detail: "An explicit threshold, decided before the run. Failing here ends the idea." },
      { step: "05", label: "Promote to paper", detail: "A promote command moves the strategy into the live paper engine with real quotes and real costs." },
      { step: "06", label: "≥ 30 round trips", detail: "Below thirty, the confidence interval is too wide to separate edge from noise. The strategy stays flagged." },
      { step: "07", label: "Owner decides", detail: "Real capital is never switched on automatically. A person reads the record and makes the call." },
    ],
    pipelineCaption: "Ideas enter at the top; almost none reach the bottom.",
    abTitle: "The catalyst A/B split",
    abBody:
      "Several strategies run as a pair: a base arm and a catalyst arm whose id ends in “_cat”. Not one parameter differs between them — the only difference is that the catalyst arm may only look at names carrying a news or flow tag. That isolates a single question: does the catalyst filter help, or does it just cut the sample?",
    notAutomatedTitle: "What is deliberately not automated",
    notAutomatedBody:
      "Overnight and swing ideas are never traded by the engine. They go to Telegram as recommendations for a human-operated account, because the automated lane is intraday-only by decision, not by limitation. Everything the engine opens, it closes the same session.",
    aiTitle: "Where AI is — and isn't",
    aiPresent: "AI used",
    aiPresentDesc:
      "Collection summaries, candidate analysis, and parameter suggestions in the control plane. All of it off the trading clock.",
    aiAbsent: "No AI",
    aiAbsentDesc:
      "Entry, exit, sizing and order execution. Deterministic, price-based code only — an architecture test fails the build if a network or model call appears in the trade plane.",
  },
  cost: {
    eyebrow: "Cost Reality",
    title: "The Truth About Costs",
    description:
      "This is the single most important number on the page. If a strategy's edge is not larger than its round-trip cost, trading itself is the source of the loss — and on this record, it is.",
    bars: [
      { label: "KR single stocks (round trip)" },
      { label: "KR ETFs (round trip)" },
      { label: "US (round trip)" },
    ],
    taxLabel: (bp) => `tax ${bp}bp`,
    otherLabel: (bp) => `fees & slippage ${bp}bp`,
    feeDragHeadline: "of gross P&L, eaten by fees and tax",
    feeDragCaption:
      "Measured on this record, not modelled. Several strategies are positive before costs and negative after them.",
    breakdownTitle: "Round-trip cost by instrument",
    noteMeasuredTitle: "Reflected in measurement",
    noteMeasuredBody:
      "Every fill logs actual fees, taxes, and slippage to the ledger, and per-strategy expectancy (bp) is always shown net of cost.",
    noteEdgeTitle: "When edge < cost",
    noteEdgeBody:
      "We don't tighten entry rules to compensate. The verdict is marked “rejected” or “insufficient sample,” and capital allocation to that strategy is reduced.",
  },
  safety: {
    eyebrow: "Safeguards",
    title: "Safeguards",
    description:
      "Real money is on the line here. We're more worried about the system going out of control than about a strategy being wrong.",
    items: [
      { title: "Remote stop / liquidate via Telegram", detail: "One message from anywhere during market hours halts new entries or liquidates open positions immediately." },
      { title: "Circuit breaker", detail: "If losses exceed a daily limit, that strategy is automatically excluded from trading for the rest of the day." },
      { title: "Server-side stop loss", detail: "Stop-loss orders sit on the broker's servers, so they still fire even if the client connection drops." },
      { title: "Dead man's switch", detail: "If the engine's health check goes silent for too long, it automatically halts to a safe state." },
      { title: "No deploys during market hours", detail: "The deploy/restart pipeline itself is blocked while regular market hours are open." },
    ],
  },
  methodology: {
    eyebrow: "Methodology",
    title: "How the Numbers Are Computed",
    description: "The definitions behind every stat on this page, so a number never has to be taken on faith.",
    items: [
      {
        title: "Round trip",
        detail: "One entry paired with its matching exit — the unit every win rate, expectancy, and trip count on this page counts.",
      },
      {
        title: "95% confidence interval (Wilson score)",
        detail:
          "Win rate is shown with a Wilson-score interval, which stays well-behaved at small sample sizes instead of the normal approximation's overconfident bounds near 0% or 100%.",
      },
      {
        title: "Expectancy (bp)",
        detail: "Average return per round trip in basis points, net of fees, tax, and slippage — not a gross P&L figure.",
        bpAbbr: true,
      },
      {
        title: "KR round-trip cost",
        detail:
          "A KR single-stock round trip carries a fixed 20bp securities transaction tax on top of brokerage fees, deducted before expectancy is computed.",
      },
      {
        title: "Trading-day boundary",
        detail:
          "Each row in the equity curve is one trading day, closed out at the 06:00 KST settlement that follows both the KR and US sessions — not a naive midnight cutoff.",
      },
      {
        title: "Why 30 trips",
        detail:
          "Below 30 round trips the confidence interval is wide enough that a strategy's true edge can't be distinguished from noise — the sample-size badge marks every strategy under that line.",
      },
      {
        title: "Per-currency equity curves",
        detail:
          "The KRW and USD books are shown separately with no FX conversion between them — each curve is normalized only against its own currency's starting seed.",
      },
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
          "Closing every open position before the session ends — nothing this engine trades is held overnight.",
      },
      {
        term: "Catalyst arm",
        definition:
          "The “_cat” variant of a strategy, restricted to symbols carrying a news or flow catalyst tag — run as an A/B test against the unrestricted base arm.",
      },
    ],
    epochItemTitle: "Paper-epoch account model",
    epochFxTerm: "Sum-of-accounts FX rate",
  },
  glossary: {
    bp: "bp (basis point) = 0.01%. 100bp = 1%. E.g. net −25bp = −0.25% of turnover.",
  },
  editorsNote: {
    label: "Editor's note",
    title: "Why publish this now",
    bullets: [
      "The GitHub repository is private, so the code can't be shown directly — the principles and the measured numbers are published instead.",
      "This is a cumulative loss stretch. Favourable periods are not cut out to make the curve look better.",
      "Every strategy is shown with its confidence interval and a sample-size warning, to keep overconfidence in check.",
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
  nav: {
    brand: "QUANT TRADING",
    tagline: "측정 데스크",
    equity: "수익 곡선",
    curves: "전략별 곡선",
    strategies: "전략별 성적",
    cost: "비용",
    how: "작동 원리",
    methodology: "산출 방식",
    safety: "안전장치",
    themeToggle: "테마 전환",
    localeToggle: "EN",
    sectionsLabel: "목차",
    progressLabel: "읽은 분량",
  },
  hero: {
    badge: "모의투자 (paper) — 실제 수익이 아닙니다",
    thesis: "이 페이지의 모든 숫자는 고른 것이 아니라 잰 것입니다.",
    body: "개인용 자동매매 엔진이 한국·미국 정규장에서 단타 전략을 돌리고, 체결을 하나도 빠짐없이 원장에 적고, 그 원장이 말하는 것을 그대로 공개합니다 — 지고 있다고 말하는 구간까지 포함해서.",
    tapeLabel: "세션 테이프",
    tapeHint: "통화별 북의 최근 마감값 — 각자의 시작 시드 대비입니다.",
    bookAsia: "ASIA · KRW",
    bookUs: "US · USD",
    cumLabel: "누적",
    noData: "체결 없음",
    statSessions: "거래일",
    statFills: "체결",
    statTrips: "왕복",
    statStrategies: "전략",
    liveCount: (enabledCount, totalCount) =>
      `지금 가동 ${enabledCount}개 · 왕복 기록 ${totalCount}개`,
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
    feeDragValue: (pct) => `총손익의 ${pct.toFixed(1)}%`,
    tripsLabel: "표본",
    sessionsUnit: (n) => `${n}거래일`,
  },
  verdicts: {
    title: "판정 현황",
    description:
      "지금까지의 근거가 어디에 서 있는지를 보여줍니다. 판정은 예측이 아니라 표본에 대한 진술이며, 대부분은 아직 결론을 내리기엔 표본이 얇다고 말하고 있습니다.",
    countUnit: (n) => `${n}`,
    empty: "이 판정에 해당하는 전략이 없습니다.",
    tripsUnit: (n) => `${n}왕복`,
  },
  equity: {
    eyebrow: "Equity Curve",
    title: "수익 곡선",
    description:
      "각자 통화의 시작 시드 대비 누적 수익률 — 환전 없이 통화별로 완전히 분리해 보여줍니다. 점 위에 마우스를 올리거나 클릭하거나 키보드로 이동하면 그날의 체결 수와 당일 등락을 볼 수 있습니다.",
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
    maxDrawdownLabel: "최대 낙폭",
    maxDrawdownNA: "해당없음 (2개 미만)",
    emptyBook: "이 북에는 아직 집계된 체결이 없습니다.",
    chartAriaLabel: (bookTitle) => `${bookTitle} 시작 시드 대비 누적 수익률 곡선`,
    pointAriaLabel: (date, cum, day, fills) =>
      `${date}, 누적 ${cum}, 당일 ${day}, 체결 ${fills}건`,
    pointAriaLabelNoFills: (date, cum, day) => `${date}, 누적 ${cum}, 당일 ${day}`,
    tooltipCum: "누적",
    tooltipDay: "당일",
    tooltipFills: "체결",
    fillsSuffix: "건",
    overallBookTitle: "계좌 합계",
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
      "왕복 수가 적을수록 승률·기대값의 신뢰구간이 넓어집니다 — 표본 부족 뱃지가 붙은 전략은 판단을 보류하세요. 행을 펼치면 그 전략이 실제로 무엇을 하는지 읽을 수 있습니다.",
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
    headerVerdict: "판정",
    headerTradesPerDay: "일평균 거래",
    headerAvgHold: "평균 보유",
    headerHelp: "설명",
    headerSinceEpoch: "에폭 이후 (2026-09-07~)",
    sinceEpochTitle: (marketLabel, pct, native) => `${marketLabel}: ${pct} (순손익 ${native})`,
    sampleWarning: "표본 부족",
    offBadge: "비활성",
    liveBadge: "가동",
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
    statVerdict: "판정",
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
      "뉴스와 분석은 유니버스로 흘러갈 뿐 주문으로 이어지지 않습니다. 제어는 돌아가는 엔진을 직접 건드리지 않고 설정을 쓰며, 엔진이 다음 리로드에 그것을 읽습니다.",
    diagramNewsEdge: "유니버스만",
    diagramSettingsEdge: "설정 파일",
    diagramNoImport: "임포트 금지",
    timelineTitle: "하루가 실제로 도는 순서",
    timelineNote:
      "모두 KST입니다. 이상적인 그림이 아니라 실제 크론탭이라, 어중간한 분 단위가 그대로 남아 있습니다 — 예전에 정각에서 뭔가 충돌했기 때문입니다.",
    timeline: [
      { time: "07:30", market: "KR", label: "리포트 빌드", detail: "야간 데이터로 데일리 마켓 리포트를 조립합니다." },
      { time: "08:00", market: "KR", label: "리포트 발행", detail: "산문과 함께 기계가 읽을 수 있는 엔진 JSON이 같이 나갑니다." },
      { time: "08:05", market: "KR", label: "관심종목 리셋", detail: "어제 자동 등록된 종목을 비웁니다. 낡은 후보가 새 세션까지 살아남지 못하게." },
      { time: "08:12", market: "KR", label: "확신도 채점 자동 등록", detail: "리포트의 엔진 JSON을 채점해 임계 통과분만 자동 등록합니다. 시가총액 3,000억원 하한과 전일 상한가 종목 차단이 여기서 걸립니다. 이 경로에 언어모델은 없습니다." },
      { time: "08:27", market: "KR", label: "유니버스 롤", detail: "동시호가 전에 매매 가능 유니버스를 리로드합니다." },
      { time: "09:00", market: "KR", label: "한국장 개장", detail: "리스크 레일 뒤에서 KR 전략이 가동됩니다 — 하드 스탑 −5%, 목표 상한 +10%, 전략별 분리 계정, 텔레그램에서 닿는 킬 스위치." },
      { time: "14:53", market: "KR", label: "마감 리포트 롤", detail: "장 마감 전에 마감 리포트의 입력을 갱신합니다." },
      { time: "15:20", market: "KR", label: "청산 구간", detail: "15:20–15:30에 모든 일중 포지션을 닫습니다. 이 엔진이 오버나이트로 넘기는 것은 없습니다." },
      { time: "15:35", market: "KR", label: "세션 손익", detail: "한국장 체결을 정산해 원장에 적습니다." },
      { time: "15:50", market: "KR", label: "스윙 추천", detail: "오버나이트·스윙 아이디어를 수동 계좌용 추천으로 텔레그램에 보냅니다. 엔진은 이것으로 매매하지 않습니다." },
      { time: "16:20", market: "KR", label: "성과 발행", detail: "이 페이지가 읽는 JSON을 다시 만들어 배포합니다." },
      { time: "21:40", market: "US", label: "미국 관심종목 리셋", detail: "다가올 세션을 위해 유니버스의 미국 쪽을 비웁니다." },
      { time: "21:50", market: "US", label: "미국 자동 등록", detail: "같은 확신도 채점을 미국 후보에 돌립니다." },
      { time: "22:10", market: "US", label: "미국 유니버스 롤", detail: "미국장 개장 전에 유니버스를 리로드합니다." },
      { time: "22:30", market: "US", label: "미국장 개장", detail: "같은 전략군이 같은 레일 아래에서 미국 유니버스로 돕니다." },
      { time: "23:00", market: "ALL", label: "마켓 펄스", detail: "23:00·01:00·03:00·05:00에 밤사이 움직임을 요약해 보냅니다." },
      { time: "06:10", market: "US", label: "미국 손익", detail: "미국장 체결을 정산하고, 이 페이지가 읽는 왕복 원장을 그날치로 마감합니다." },
    ],
    legendKr: "한국장",
    legendUs: "미국장",
    legendAll: "공통",
    railsTitle: "개장 시 리스크 레일",
    rails: [
      { label: "하드 스탑", detail: "포지션당 −5%, 서버측 집행" },
      { label: "목표 상한", detail: "+10% 도달 시 이익 실현" },
      { label: "전략별 분리 계정", detail: "한 전략의 손실이 다른 전략의 배분을 쓰지 못함" },
      { label: "킬 스위치", detail: "텔레그램 메시지 한 번으로 진입 중단 또는 전량 청산" },
    ],
    sourcesTitle: "무엇을 읽는가",
    sourcesNote: "시세는 키움이 우선이고 실패하면 Toss로 내려갑니다. 주문은 Toss 하나로만 나갑니다.",
    sources: [
      { name: "키움 웹소켓", detail: "실시간 시세, 주 경로" },
      { name: "Toss REST", detail: "시세 폴백 + 유일한 주문 경로" },
      { name: "FRED", detail: "국면 판정용 매크로 시계열" },
      { name: "자체 데일리 리포트", detail: "같은 서버에서 KR 08:00 / US 20:00 발행" },
      { name: "텔레그램 13개 채널", detail: "수급·촉매 정보 — 태깅용이지 매매 신호가 아님" },
      { name: "뉴스 RSS", detail: "하루 약 4,600건을 이벤트 태그로 걸러냄" },
    ],
    pipelineTitle: "전략이 들어오는 관문",
    pipelineNote:
      "노트북에서 좋아 보였다는 이유로 배포되는 것은 없습니다. 별도의 로컬 백테스트 저장소를 먼저 통과해야 하고, 그 다음에는 모의 운용을 버텨야 합니다.",
    pipeline: [
      { step: "01", label: "데이터 레이크", detail: "봉·재무 데이터를 버전을 붙여 로컬에 쌓습니다. 같은 입력으로 결과를 다시 돌릴 수 있도록." },
      { step: "02", label: "1차 스크리닝", detail: "값싼 스윕으로 명백히 죽은 아이디어를 먼저 걸러냅니다." },
      { step: "03", label: "워크포워드", detail: "표본 외 구간만 사용하고, deflated Sharpe로 채점해 그 아이디어가 통과한 시도 횟수를 값에 반영합니다." },
      { step: "04", label: "Go / No-go 게이트", detail: "실행 전에 미리 정해 둔 명시적 임계값. 여기서 떨어지면 아이디어는 끝납니다." },
      { step: "05", label: "모의로 승격", detail: "promote 명령이 전략을 실시세·실비용의 모의 엔진으로 옮깁니다." },
      { step: "06", label: "30왕복 이상", detail: "30회 미만에서는 신뢰구간이 넓어 엣지와 잡음을 구분할 수 없습니다. 그때까지 표본 부족 표시가 유지됩니다." },
      { step: "07", label: "사람이 결정", detail: "실자금은 자동으로 켜지지 않습니다. 사람이 기록을 읽고 판단합니다." },
    ],
    pipelineCaption: "아이디어는 위로 들어오고, 아래까지 내려오는 것은 거의 없습니다.",
    abTitle: "촉매 A/B 분할",
    abBody:
      "여러 전략이 짝으로 돕니다 — 기본 갈래와, id가 “_cat”으로 끝나는 촉매 갈래. 둘 사이에 다른 파라미터는 하나도 없습니다. 촉매 갈래는 뉴스·수급 태그가 붙은 종목만 볼 수 있다는 것뿐입니다. 이 설계는 질문 하나만 남깁니다: 촉매 필터가 도움이 되는가, 아니면 표본만 깎는가?",
    notAutomatedTitle: "일부러 자동화하지 않은 것",
    notAutomatedBody:
      "오버나이트·스윙 아이디어는 엔진이 절대 매매하지 않습니다. 사람이 운용하는 계좌를 위한 추천으로 텔레그램에 나갈 뿐입니다. 자동매매 레인이 단타 전용인 것은 한계가 아니라 결정입니다. 엔진이 연 것은 같은 세션 안에 닫습니다.",
    aiTitle: "AI가 있는 자리 / 없는 자리",
    aiPresent: "AI 있음",
    aiPresentDesc:
      "수집 요약, 종목 후보 분석, 제어 평면의 파라미터 제안. 전부 매매 시계 바깥에서 돕니다.",
    aiAbsent: "AI 없음",
    aiAbsentDesc:
      "진입·청산·사이징·주문 집행. 가격 기반 결정론적 코드만 — 거래 평면에 네트워크나 모델 호출이 등장하면 아키텍처 테스트가 빌드를 떨어뜨립니다.",
  },
  cost: {
    eyebrow: "Cost Reality",
    title: "비용의 진실",
    description:
      "이 페이지에서 가장 중요한 숫자입니다. 전략의 엣지가 왕복 비용보다 크지 않으면 매매 자체가 손실의 원인이 되고, 이 기록에서는 실제로 그렇습니다.",
    bars: [
      { label: "KR 개별주 (왕복)" },
      { label: "KR ETF (왕복)" },
      { label: "US (왕복)" },
    ],
    taxLabel: (bp) => `세금 ${bp}bp`,
    otherLabel: (bp) => `수수료·슬리피지 ${bp}bp`,
    feeDragHeadline: "총손익 중 수수료·세금이 가져간 비율",
    feeDragCaption:
      "모델링이 아니라 이 기록에서 실측한 값입니다. 여러 전략이 비용 전에는 양수였다가 비용 후에 음수로 뒤집힙니다.",
    breakdownTitle: "상품별 왕복 비용",
    noteMeasuredTitle: "측정에 반영",
    noteMeasuredBody:
      "체결마다 실제 수수료·세금·슬리피지를 원장에 기록하고, 전략별 기대값(bp)은 항상 비용 차감 후 수치로 표기합니다.",
    noteEdgeTitle: "엣지 < 비용일 때",
    noteEdgeBody:
      "진입 규칙을 억지로 조이지 않습니다. 판정을 “기각” 또는 “판단 보류”로 명시하고, 해당 전략의 자본 배분을 낮춥니다.",
  },
  safety: {
    eyebrow: "Safeguards",
    title: "안전장치",
    description:
      "실제 돈이 걸려 있는 시스템입니다. 전략이 틀리는 것보다 시스템이 통제 불능이 되는 것을 더 경계합니다.",
    items: [
      { title: "텔레그램 원격 정지 · 청산", detail: "장중 어디서든 메시지 한 번으로 신규 진입을 멈추거나 보유 포지션을 즉시 청산." },
      { title: "회로차단기", detail: "손실이 일일 한도를 넘으면 해당 전략을 자동으로 그날 거래에서 제외." },
      { title: "서버측 손절", detail: "클라이언트 연결이 끊겨도 브로커 서버에 걸린 주문으로 손절이 집행." },
      { title: "데드맨 스위치", detail: "엔진의 헬스체크가 일정 시간 끊기면 안전한 상태로 자동 정지." },
      { title: "장중 배포 차단", detail: "정규장이 열려 있는 동안에는 배포·재시작 파이프라인 자체가 막힘." },
    ],
  },
  methodology: {
    eyebrow: "Methodology",
    title: "숫자를 계산하는 방식",
    description: "이 페이지의 모든 수치가 어떻게 계산되는지 — 숫자를 그냥 믿을 필요가 없도록.",
    items: [
      {
        title: "왕복(Round trip)",
        detail: "진입과 그에 대응하는 청산을 짝지은 한 단위 — 이 페이지의 모든 승률·기대값·왕복 수가 세는 기준입니다.",
      },
      {
        title: "95% 신뢰구간 (Wilson score)",
        detail: "승률은 Wilson score 구간으로 표기합니다. 표본이 작을 때 정규근사가 0%·100% 근처에서 과신하는 문제를 피합니다.",
      },
      {
        title: "기대값(bp)",
        detail: "왕복 1회당 평균 수익률(bp) — 수수료·세금·슬리피지를 뺀 순수치이며 총손익이 아닙니다.",
        bpAbbr: true,
      },
      {
        title: "KR 왕복 비용",
        detail: "KR 개별주 왕복에는 수수료 외에 고정 20bp의 증권거래세가 더해지며, 기대값 계산 전에 이미 차감된 값입니다.",
      },
      {
        title: "거래일 경계",
        detail: "수익 곡선의 한 행은 하루치 거래일이며, 한국·미국 두 세션이 모두 끝난 뒤의 정산 시각(06:00 KST) 기준으로 마감됩니다 — 단순 자정 기준이 아닙니다.",
      },
      {
        title: "왜 30왕복인가",
        detail: "왕복 30회 미만에서는 신뢰구간이 넓어 전략의 실제 엣지와 잡음을 구분하기 어렵습니다 — 그 기준 아래 모든 전략에 표본 부족 뱃지가 붙습니다.",
      },
      {
        title: "통화별로 분리된 수익 곡선",
        detail: "KRW·USD 북은 환전 없이 완전히 분리해서 보여줍니다 — 각 곡선은 자기 통화의 시작 시드에만 대비해 정규화됩니다.",
      },
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
        definition: "장 마감 전 모든 포지션을 정리하는 것 — 이 엔진은 어떤 포지션도 오버나이트로 넘기지 않습니다.",
      },
      {
        term: "촉매 갈래(Catalyst arm)",
        definition:
          "id가 “_cat”으로 끝나는 전략 갈래 — 뉴스·수급 촉매 태그가 붙은 종목만 보도록 제한해, 제한 없는 기본 갈래와 A/B로 비교합니다.",
      },
    ],
    epochItemTitle: "모의계좌 에폭 계좌 모델",
    epochFxTerm: "계좌 합계 환산환율",
  },
  glossary: {
    bp: "bp(베이시스 포인트) = 0.01%. 100bp = 1%. 예: 순 −25bp = 거래대금의 −0.25%",
  },
  editorsNote: {
    label: "편집자 노트",
    title: "지금 공개하는 이유",
    bullets: [
      "GitHub 저장소가 비공개라 코드를 직접 보여줄 수 없습니다 — 대신 원리와 실측치를 공개합니다.",
      "지금은 누적 손실 구간입니다. 곡선을 좋아 보이게 하려고 유리한 구간만 잘라내지 않습니다.",
      "전략마다 신뢰구간과 표본 경고를 함께 표기해 과신을 막습니다.",
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
