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

interface Messages {
  nav: {
    brand: string;
    equity: string;
    strategies: string;
    how: string;
    cost: string;
    safety: string;
    themeToggle: string;
    localeToggle: string;
  };
  hero: {
    badge: string;
    title: (strategyCount: number) => string;
    body: string;
    statStrategies: string;
    statSessions: string;
    statFills: string;
    whyNowLabel: string;
    bullets: string[];
  };
  equity: {
    eyebrow: string;
    title: string;
    description: string;
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
    emptyBook: string;
    chartAriaLabel: (bookTitle: string) => string;
    pointAriaLabel: (date: string, cum: string, day: string, fills: number) => string;
    tooltipCum: string;
    tooltipDay: string;
    tooltipFills: string;
    fillsSuffix: string;
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
    sampleWarning: string;
  };
  how: {
    eyebrow: string;
    title: string;
    description: string;
    liveBadge: string;
    whenWrong: string;
    planes: { name: string; risk: string; allowed: string }[];
    timelineTitle: string;
    timeline: { time: string; label: string; detail: string }[];
    dataSourcesTitle: string;
    dataSources: string[];
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
  footer: {
    lastUpdated: string;
    kstSuffix: string;
    notAdvice: string;
  };
}

const en: Messages = {
  nav: {
    brand: "QUANT TRADING",
    equity: "Equity Curve",
    strategies: "Strategies",
    how: "How It Works",
    cost: "Cost",
    safety: "Safeguards",
    themeToggle: "Toggle theme",
    localeToggle: "한국어",
  },
  hero: {
    badge: "Paper trading — not real returns",
    title: (n) =>
      `A personal automated trading engine running ${n} strategies at once across Korea and US market hours`,
    body: "This page isn't here to brag about returns. It's here to show how rigorously we measure. When the sample is small we hold off judgment, taxes and fees are reflected at actual cost, and losses are disclosed as-is.",
    statStrategies: "Strategies",
    statSessions: "Trading days",
    statFills: "Fills",
    whyNowLabel: "Why publish this now",
    bullets: [
      "The GitHub repo is private, so we can't show the code directly — instead we publish the principles and the measured numbers.",
      "Week 3 of paper trading is a cumulative loss stretch. We're not cutting out only the favorable periods.",
      "Every strategy is shown with its confidence interval and a sample-size warning, to keep overconfidence in check.",
    ],
  },
  equity: {
    eyebrow: "Equity Curve",
    title: "Equity Curve",
    description:
      "Cumulative return against each book's own starting seed, kept separate by currency — no FX conversion between them. Hover or click a point, or move focus with the keyboard, to see that day's fill count and daily change.",
    legendUp: "Positive (+) — shown in red, per local market convention",
    legendDown: "Negative (−) — shown in blue, per local market convention",
    legendPhaseBoundary: "Phase boundary (live-account transplant)",
    ongoing: "ongoing",
    excludedNote: (fills) =>
      `(${fills} excluded fills — see note above)`,
    priorPaperNote: (sessions) =>
      `The prior ${sessions}-trading-day paper record is excluded from this curve because it used a different seed.`,
    yAxisTitle: "Cumulative return (%)",
    xAxisTitle: "Trading day (KST)",
    zeroBaseline: "0% (starting seed)",
    seedBasisLabel: "Seed basis",
    seedLabel: "Seed",
    bookAsiaTitle: "Asia (KRX)",
    bookUsTitle: "US (NYSE·NASDAQ)",
    emptyBook: "No fills recorded yet in this book.",
    chartAriaLabel: (bookTitle) => `${bookTitle} cumulative return curve against its starting seed`,
    pointAriaLabel: (date, cum, day, fills) =>
      `${date}, cumulative ${cum}, daily ${day}, ${fills} fills`,
    tooltipCum: "Cumulative",
    tooltipDay: "Daily",
    tooltipFills: "Fills",
    fillsSuffix: "fills",
  },
  strategies: {
    eyebrow: "Strategy Scoreboard",
    title: "Strategy Scoreboard",
    description:
      "Fewer round trips means wider confidence intervals on win rate and expectancy — hold off judgment on strategies flagged with a sample-size badge.",
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
    sampleWarning: "Small sample",
  },
  how: {
    eyebrow: "Architecture",
    title: "How It Works",
    description:
      "The code is split into four planes by what you lose when it's wrong — not by feature. A test enforces the allowed dependency direction between planes via the import graph.",
    liveBadge: "Live trading",
    whenWrong: "If wrong →",
    planes: [
      { name: "Collect", risk: "Data goes missing", allowed: "Scraping, LLM summarization, failures and retries allowed" },
      { name: "Analyze", risk: "Selection gets worse", allowed: "LLM judgment, slow batch jobs allowed" },
      { name: "Trade", risk: "You lose money", allowed: "Deterministic code only — no LLM or network calls" },
      { name: "Control", risk: "The next session gets worse", allowed: "Automatic parameter tuning, experiments, rollback" },
    ],
    timelineTitle: "Daily timeline (KST)",
    timeline: [
      { time: "00:00", label: "Regime call", detail: "Refresh the per-market offense/neutral/defense multiplier" },
      { time: "07:50", label: "Daily report", detail: "Feed watchlist candidates into the confidence-scoring engine" },
      { time: "09:00", label: "KR market open", detail: "Channel breakout, opening-range breakout, and session-high strategies go live" },
      { time: "22:30", label: "US market open", detail: "The same strategy set expands to the US universe" },
      { time: "06:00", label: "Settlement", detail: "Persist fills to the trade ledger; aggregate per-strategy win rate and expectancy" },
    ],
    dataSourcesTitle: "Data sources",
    dataSources: [
      "Kiwoom WebSocket (real-time quotes)",
      "Toss (order execution)",
      "Naver Finance",
      "DART",
      "FRED",
    ],
    aiTitle: "Where AI is — and isn't",
    aiPresent: "AI used",
    aiPresentDesc: "Collection summaries, candidate analysis, parameter suggestions in the control plane",
    aiAbsent: "No AI",
    aiAbsentDesc: "Entry/exit decisions and order execution — deterministic, price-based code only",
  },
  cost: {
    eyebrow: "Cost Reality",
    title: "The Truth About Costs",
    description:
      "If a strategy's edge isn't larger than its round-trip cost, trading itself is the source of net loss. More than half of a KR single-stock trade is tax.",
    bars: [
      { label: "KR single stocks (round trip)" },
      { label: "KR ETFs (round trip)" },
      { label: "US (round trip)" },
    ],
    taxLabel: (bp) => `tax ${bp}bp`,
    otherLabel: (bp) => `fees & slippage ${bp}bp`,
    noteMeasuredTitle: "Reflected in measurement",
    noteMeasuredBody:
      "Every fill logs actual fees, taxes, and slippage to the ledger, and per-strategy expectancy (bp) is always shown net of cost.",
    noteEdgeTitle: "When edge < cost",
    noteEdgeBody:
      'We don’t force entry rules tighter to compensate. The verdict is marked "rejected" or "insufficient sample," and capital allocation to that strategy is reduced.',
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
  footer: {
    lastUpdated: "Last updated:",
    kstSuffix: "(KST)",
    notAdvice: "Nothing on this page is investment advice.",
  },
};

const ko: Messages = {
  nav: {
    brand: "QUANT TRADING",
    equity: "수익 곡선",
    strategies: "전략별 성적",
    how: "작동 원리",
    cost: "비용",
    safety: "안전장치",
    themeToggle: "테마 전환",
    localeToggle: "EN",
  },
  hero: {
    badge: "모의투자 (paper) — 실제 수익이 아닙니다",
    title: (n) => `한국·미국 정규장에서 ${n}개 전략이 동시에 도는 개인용 자동매매 엔진`,
    body: "수익률을 자랑하려는 페이지가 아닙니다. 이 프로젝트는 “측정을 얼마나 엄격하게 하는가”를 보여주는 페이지입니다. 표본이 작으면 판단을 보류하고, 세금·수수료를 실비로 반영하고, 손실도 그대로 공개합니다.",
    statStrategies: "전략",
    statSessions: "거래일",
    statFills: "체결",
    whyNowLabel: "지금 공개하는 이유",
    bullets: [
      "GitHub은 비공개라 코드를 직접 보여줄 수 없습니다 — 대신 원리와 실측치를 공개합니다.",
      "3주차 모의투자는 누적 손실 구간입니다. 유리한 구간만 잘라 보여주지 않습니다.",
      "전략마다 신뢰구간과 표본 경고를 함께 표기해 과신을 막습니다.",
    ],
  },
  equity: {
    eyebrow: "Equity Curve",
    title: "수익 곡선",
    description:
      "각자 통화의 시작 시드 대비 누적 수익률 — 환전 없이 통화별로 완전히 분리해 보여줍니다. 점 위에 마우스를 올리거나 클릭하거나 키보드로 이동하면 그날의 체결 수와 당일 등락을 볼 수 있습니다.",
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
    emptyBook: "이 북에는 아직 집계된 체결이 없습니다.",
    chartAriaLabel: (bookTitle) => `${bookTitle} 시작 시드 대비 누적 수익률 곡선`,
    pointAriaLabel: (date, cum, day, fills) =>
      `${date}, 누적 ${cum}, 당일 ${day}, 체결 ${fills}건`,
    tooltipCum: "누적",
    tooltipDay: "당일",
    tooltipFills: "체결",
    fillsSuffix: "건",
  },
  strategies: {
    eyebrow: "Strategy Scoreboard",
    title: "전략별 성적표",
    description:
      "왕복 수가 적을수록 승률·기대값의 신뢰구간이 넓어집니다 — 표본 부족 뱃지가 붙은 전략은 판단을 보류하세요.",
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
    sampleWarning: "표본 부족",
  },
  how: {
    eyebrow: "Architecture",
    title: "어떻게 작동하는가",
    description:
      "코드는 기능이 아니라 '틀렸을 때 무엇을 잃는가'로 4개 평면으로 나뉩니다. 평면 간 의존 방향은 테스트가 임포트 그래프로 강제합니다.",
    liveBadge: "실거래",
    whenWrong: "틀리면 →",
    planes: [
      { name: "수집", risk: "데이터가 빈다", allowed: "스크래핑, LLM 요약, 실패·재시도 허용" },
      { name: "분석", risk: "종목 선정이 나빠진다", allowed: "LLM 판단, 느린 배치 허용" },
      { name: "거래", risk: "돈을 잃는다", allowed: "결정론적 코드만 — LLM·네트워크 호출 금지" },
      { name: "제어", risk: "다음 세션이 나빠진다", allowed: "자동 파라미터 조정, 실험, 롤백" },
    ],
    timelineTitle: "하루 시각표 (KST)",
    timeline: [
      { time: "00:00", label: "국면(regime) 판정", detail: "시장별 공격/중립/방어 배율 갱신" },
      { time: "07:50", label: "일일 리포트", detail: "관심종목 후보를 확신도 엔진에 태움" },
      { time: "09:00", label: "한국장 개장", detail: "채널 돌파 · 개장 돌파 · 세션 신고가 전략 가동" },
      { time: "22:30", label: "미국장 개장", detail: "동일 전략군이 US 유니버스로 확장 운용" },
      { time: "06:00", label: "정산", detail: "체결을 거래 원장에 영속화, 전략별 승률·기대값 집계" },
    ],
    dataSourcesTitle: "데이터 출처",
    dataSources: ["키움 웹소켓 (실시간 시세)", "Toss (주문 집행)", "네이버 증권", "DART", "FRED"],
    aiTitle: "AI가 있는 자리 / 없는 자리",
    aiPresent: "AI 있음",
    aiPresentDesc: "수집 요약, 종목 후보 분석, 제어 평면의 파라미터 제안",
    aiAbsent: "AI 없음",
    aiAbsentDesc: "진입·청산 판단, 주문 집행 — 가격 기반 결정론적 코드만 실행",
  },
  cost: {
    eyebrow: "Cost Reality",
    title: "비용의 진실",
    description:
      "전략의 엣지가 왕복 비용보다 크지 않으면, 매매 자체가 순손실의 원인이 됩니다. 국내 개별주 거래의 절반 이상이 세금입니다.",
    bars: [
      { label: "KR 개별주 (왕복)" },
      { label: "KR ETF (왕복)" },
      { label: "US (왕복)" },
    ],
    taxLabel: (bp) => `세금 ${bp}bp`,
    otherLabel: (bp) => `수수료·슬리피지 ${bp}bp`,
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
  footer: {
    lastUpdated: "마지막 갱신:",
    kstSuffix: "(KST)",
    notAdvice: "이 페이지의 어떤 내용도 투자 조언이 아닙니다.",
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
