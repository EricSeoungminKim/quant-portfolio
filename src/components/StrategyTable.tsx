"use client";

import { useMemo, useState } from "react";
import type {
  Market,
  MarketStats,
  PaperEpoch,
  PaperEpochCurvePoint,
  PaperEpochStrategy,
  Strategy,
} from "@/types/performance";
import { formatBp, formatHoldMinutes, formatMoneySigned, formatPct } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText, translateStrategyName, translateVerdict } from "@/lib/i18nData";
import { activityForMarket, findEpochStrategy, statsForMarket } from "@/lib/paperEpoch";
import Abbr from "./Abbr";
import SectionHeading from "./SectionHeading";
import StrategyHelpDrawer from "./StrategyHelpDrawer";

type SortKey = "expectancy_bp" | "win_rate" | "trips";

export default function StrategyTable({
  strategies: currentStrategies,
  historicalStrategies,
  note,
  noteEn,
  index,
  paperEpoch,
}: {
  strategies: Strategy[];
  historicalStrategies?: Strategy[];
  note?: string;
  noteEn?: string;
  index: string;
  /** 2026-09-06 paper_epoch account model — `null`/absent hides the "Since
   *  epoch" column entirely rather than rendering it all-"—". */
  paperEpoch?: PaperEpoch | null;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [historical, setHistorical] = useState(false);
  const strategies = historical ? historicalStrategies ?? currentStrategies : currentStrategies;
  const visibleEpoch = historical ? null : paperEpoch;
  const [market, setMarket] = useState<"ALL" | Market>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("expectancy_bp");
  const [asc, setAsc] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const SORT_LABEL: Record<SortKey, string> = {
    expectancy_bp: t.strategies.sortExpectancy,
    win_rate: t.strategies.sortWinRate,
    trips: t.strategies.sortTrips,
  };

  /** Ids that have a `<id>_cat` sibling — i.e. the base arm of an A/B pair. */
  const baseArmIds = useMemo(() => {
    const ids = new Set(strategies.map((s) => s.id));
    return new Set(
      strategies.filter((s) => !s.id.endsWith("_cat") && ids.has(`${s.id}_cat`)).map((s) => s.id)
    );
  }, [strategies]);

  const rows = useMemo(() => {
    const filtered =
      market === "ALL" ? strategies : strategies.filter((s) => s.total.markets.includes(market));
    return [...filtered].sort((a, b) => {
      const av = statsForMarket(a, market)?.[sortKey] ?? -Infinity;
      const bv = statsForMarket(b, market)?.[sortKey] ?? -Infinity;
      const diff = av - bv;
      return asc ? diff : -diff;
    });
  }, [strategies, market, sortKey, asc]);

  const openStrategy = openId ? strategies.find((s) => s.id === openId) ?? null : null;

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((v) => !v);
    } else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <section id="strategies" className="band">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHeading
        index={index}
        eyebrow={t.strategies.eyebrow}
        title={t.strategies.title}
        description={t.strategies.description}
      />

      {historicalStrategies && (
        <div className="mt-6 flex flex-wrap gap-2" aria-label={locale === "ko" ? "측정 기간" : "Measurement scope"}>
          {[false, true].map((value) => (
            <button key={String(value)} type="button" aria-pressed={historical === value}
              onClick={() => { setHistorical(value); setOpenId(null); }}
              className={`cursor-pointer border px-3 py-2 text-xs ${historical === value ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--control)] text-[var(--muted)]"}`}>
              {value ? (locale === "ko" ? "전체 과거 원장 · 별도 기록" : "Full historical ledger · separate scope") : (locale === "ko" ? `현재 독립계좌 · ${paperEpoch?.period.start ?? ""} 이후` : `Current accounts · since ${paperEpoch?.period.start ?? ""}`)}
            </button>
          ))}
        </div>
      )}
      {historical && <p className="mt-3 text-xs text-[var(--muted)]">{locale === "ko"
        ? "원장에 기록된 모든 기간의 왕복 거래입니다. 계좌 초기화 이전 기록을 포함하므로 현재 계좌 곡선과 직접 비교할 수 없습니다."
        : "Round trips across the full ledger, including earlier account regimes. These statistics cannot be compared directly with the current account curves."}</p>}
      {!historical && (note || noteEn) && (
        <p className="tnum mt-3 text-xs text-[var(--muted-2)]">
          {translateDataText(note ?? "", noteEn, locale)}
        </p>
      )}

      <VerdictPanel strategies={rows} market={market} onOpen={setOpenId} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5">
          {(["ALL", "KR", "US"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMarket(m)}
              aria-pressed={market === m}
              className={`mono-label cursor-pointer border px-3 py-1.5 text-[10px] font-medium transition-colors ${
                market === m
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]"
                  : "border-[var(--control)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              }`}
            >
              {m === "ALL" ? t.strategies.marketAll : m}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted-2)]">
          <span className="mono-label text-[10px]">{t.strategies.sortLabel}</span>
          {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSort(key)}
              aria-pressed={sortKey === key}
              className={`cursor-pointer border px-2.5 py-1 font-medium transition-colors ${
                sortKey === key
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--control)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              }`}
            >
              {SORT_LABEL[key]}
              {sortKey === key ? (asc ? " ↑" : " ↓") : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-x mt-5 border border-[var(--border)]" data-reveal>
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left">
              <Th>{t.strategies.headerStrategy}</Th>
              <Th>{t.strategies.headerMarket}</Th>
              <Th>{t.strategies.headerTrips}</Th>
              <Th>{t.strategies.headerWinRate}</Th>
              <Th>
                {t.strategies.headerExpectancy} (<Abbr term="bp" definition={t.glossary.bp} />)
              </Th>
              <Th>{t.strategies.headerVerdict}</Th>
              <Th hideSm>{t.strategies.headerTradesPerDay}</Th>
              <Th hideSm>{t.strategies.headerAvgHold}</Th>
              {visibleEpoch && <Th hideSm>{t.strategies.headerSinceEpoch}</Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              // null when this strategy has no round trips in the filtered
              // market — treated as a sample-size warning ("—" cells) rather
              // than silently falling back to the mixed-market total.
              const stats = statsForMarket(s, market);
              const sampleWarning = stats ? stats.sample_warning : true;
              const name = translateStrategyName(s.id, s.name_ko, s.name_en, locale);
              const epochAccount = visibleEpoch ? findEpochStrategy(visibleEpoch, s.id) : null;
              const activity = activityForMarket(s, market);
              const hasWinRate = stats?.win_rate != null && stats.ci_low != null && stats.ci_high != null;
              return (
                <tr
                  key={s.id}
                  className="border-b border-[var(--border)] bg-[var(--surface)] transition-colors last:border-0 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <button
                        type="button"
                        onClick={() => setOpenId(s.id)}
                        aria-haspopup="dialog"
                        aria-label={t.strategies.helpOpenFor(name)}
                        className="group inline-flex cursor-pointer items-center gap-1.5 text-left font-medium underline decoration-[var(--hairline)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
                      >
                        {name}
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          className="shrink-0 text-[var(--muted-2)] transition-colors group-hover:text-[var(--accent)]"
                          aria-hidden
                        >
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                      {s.enabled === false && (
                        <RowChip tone="muted">{t.strategies.offBadge}</RowChip>
                      )}
                      {baseArmIds.has(s.id) && <RowChip tone="plain">A/B</RowChip>}
                      {s.id.endsWith("_cat") && <RowChip tone="plain">A/B</RowChip>}
                      {sampleWarning && (
                        <RowChip tone="accent">{t.strategies.sampleWarning}</RowChip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--muted)]">
                    <MarketBadges asia={s.by_market.asia} us={s.by_market.us} />
                  </td>
                  <td className="tnum px-4 py-3.5">{stats ? stats.trips : "—"}</td>
                  <td className="px-4 py-3.5">
                    {hasWinRate ? (
                      <WinRateBar winRate={stats!.win_rate!} ciLow={stats!.ci_low!} ciHigh={stats!.ci_high!} />
                    ) : (
                      <span className="tnum text-xs text-[var(--muted-2)]">—</span>
                    )}
                  </td>
                  <td
                    className={`tnum px-4 py-3.5 font-medium ${
                      stats?.expectancy_bp != null
                        ? stats.expectancy_bp >= 0
                          ? "text-[var(--up)]"
                          : "text-[var(--down)]"
                        : "text-[var(--muted-2)]"
                    }`}
                  >
                    {stats?.expectancy_bp != null ? formatBp(stats.expectancy_bp) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[var(--muted)]">
                    {stats ? translateVerdict(stats.verdict, locale) : "—"}
                  </td>
                  <td className="tnum hidden px-4 py-3.5 text-xs text-[var(--muted)] sm:table-cell">
                    {activity?.trades_per_day != null ? activity.trades_per_day.toFixed(1) : "—"}
                  </td>
                  <td className="tnum hidden px-4 py-3.5 text-xs text-[var(--muted)] sm:table-cell">
                    {activity?.avg_hold_minutes != null && (stats?.trips ?? 0) > 0 ? formatHoldMinutes(activity.avg_hold_minutes) : "—"}
                  </td>
                  {visibleEpoch && (
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <SinceEpochBadges account={epochAccount} market={market} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openStrategy && (
        <StrategyHelpDrawer
          strategy={openStrategy}
          hasCatalystArm={baseArmIds.has(openStrategy.id)}
          onClose={() => setOpenId(null)}
        />
      )}
      </div>
    </section>
  );
}

/**
 * Verdict roll-up: how many strategies currently sit under each verdict, and
 * which. Reads verdicts straight from the data rather than a fixed list, so a
 * verdict the generator introduces later shows up without a code change.
 */
function VerdictPanel({
  strategies,
  market,
  onOpen,
}: {
  strategies: Strategy[];
  onOpen: (id: string) => void;
  market: "ALL" | Market;
}) {
  const t = useT();
  const { locale } = useLocale();

  const groups = useMemo(() => {
    const map = new Map<string, Strategy[]>();
    for (const s of strategies) {
      const key = statsForMarket(s, market)?.verdict ?? "표본 부족";
      const list = map.get(key);
      if (list) list.push(s);
      else map.set(key, [s]);
    }
    return [...map.entries()]
      .map(([verdict, list]) => ({
        verdict,
        list: [...list].sort((a, b) => (statsForMarket(b, market)?.trips ?? 0) - (statsForMarket(a, market)?.trips ?? 0)),
      }))
      .sort((a, b) => b.list.length - a.list.length);
  }, [strategies, market]);

  if (groups.length === 0) return null;

  return (
    <div className="plate mt-10 p-5 sm:p-6" data-reveal>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="mono-label text-[10px] text-[var(--accent)]">{t.verdicts.title}</h3>
      </div>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
        {t.verdicts.description}
      </p>
      <div className="mt-5 grid gap-px bg-[var(--border)] sm:grid-cols-2">
        {groups.map((g) => {
          const negative = g.verdict.includes("음") || g.verdict.includes("기각");
          return (
            <div key={g.verdict} className="bg-[var(--surface)] p-4">
              <div className="flex items-baseline gap-2.5">
                <span
                  className={`tnum text-2xl font-semibold leading-none ${
                    negative ? "text-[var(--down)]" : "text-[var(--foreground)]"
                  }`}
                >
                  {t.verdicts.countUnit(g.list.length)}
                </span>
                <span className="text-[13px] text-[var(--muted)]">
                  {translateVerdict(g.verdict, locale) || g.verdict}
                </span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {g.list.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(s.id)}
                      aria-haspopup="dialog"
                      className="cursor-pointer border border-[var(--control)] px-1.5 py-0.5 text-[10px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {translateStrategyName(s.id, s.name_ko, s.name_en, locale)}{" "}
                      <span className="tnum text-[var(--muted-2)]">{statsForMarket(s, market)?.trips ?? 0}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Th({ children, hideSm }: { children: React.ReactNode; hideSm?: boolean }) {
  return (
    <th
      scope="col"
      className={`mono-label px-4 py-3 text-[9px] font-medium text-[var(--muted-2)] ${
        hideSm ? "hidden sm:table-cell" : ""
      }`}
    >
      {children}
    </th>
  );
}

function RowChip({
  tone,
  children,
}: {
  tone: "accent" | "plain" | "muted";
  children: React.ReactNode;
}) {
  const cls =
    tone === "accent"
      ? "border-[var(--accent)] text-[var(--accent)]"
      : tone === "muted"
        ? "border-[var(--control)] text-[var(--muted-2)]"
        : "border-[var(--control)] text-[var(--muted)]";
  return (
    <span className={`mono-label shrink-0 border px-1.5 py-0.5 text-[9px] font-normal ${cls}`}>
      {children}
    </span>
  );
}

// Shows which market(s) a strategy trades in, each with its own trip count
// (from `by_market` — computed server-side per market, not re-derived here).
function MarketBadges({ asia, us }: { asia: MarketStats | null; us: MarketStats | null }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {asia && (
        <span className="tnum border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium">
          KR {asia.trips}
        </span>
      )}
      {us && (
        <span className="tnum border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium">
          US {us.trips}
        </span>
      )}
    </div>
  );
}

// 2026-09-06 paper_epoch column — one badge per currency this strategy has
// an account in, reading its latest cumulative % (native P&L on hover). An
// account with no epoch trades yet still gets a badge at a flat 0% (its
// `curve` array is empty, not absent) — `null` only means the strategy has
// no account for that currency at all, which is why the badge lookup keys
// off `start_capital` rather than curve length.
function SinceEpochBadges({ account, market }: { account: PaperEpochStrategy | null; market: "ALL" | Market }) {
  const t = useT();
  const { locale } = useLocale();

  if (!account) return <span className="tnum text-xs text-[var(--muted-2)]">—</span>;

  function badge(marketLabel: "KR" | "US", currency: "KRW" | "USD", points: PaperEpochCurvePoint[]) {
    const last = points[points.length - 1] as PaperEpochCurvePoint | undefined;
    const pct = last ? last.cum_pct : 0;
    const native = last ? last.cum_native : 0;
    if (pct === null) return null;
    const pctText = formatPct(pct, 2);
    return (
      <span
        key={marketLabel}
        title={t.strategies.sinceEpochTitle(marketLabel, pctText, formatMoneySigned(native, currency, locale))}
        className={`tnum border px-1.5 py-0.5 text-[10px] font-medium ${
          pct >= 0 ? "border-[var(--up)] text-[var(--up)]" : "border-[var(--down)] text-[var(--down)]"
        }`}
      >
        {marketLabel} {pctText}
      </span>
    );
  }

  const badges = [
    market !== "US" && account.start_capital.KRW !== undefined ? badge("KR", "KRW", account.curve.asia) : null,
    market !== "KR" && account.start_capital.USD !== undefined ? badge("US", "USD", account.curve.us) : null,
  ].filter((b): b is React.ReactElement => b !== null);

  if (badges.length === 0) return <span className="tnum text-xs text-[var(--muted-2)]">—</span>;

  return <div className="flex flex-wrap items-center gap-1.5">{badges}</div>;
}

function WinRateBar({
  winRate,
  ciLow,
  ciHigh,
}: {
  winRate: number;
  ciLow: number;
  ciHigh: number;
}) {
  const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
  return (
    <div className="flex items-center gap-2.5">
      <span className="tnum w-9 text-xs">{pct(winRate)}</span>
      <div className="relative h-1.5 w-24 bg-[var(--surface-2)]">
        <div
          className="absolute h-1.5 bg-[var(--muted-2)] opacity-45"
          style={{ left: pct(ciLow), width: `${(ciHigh - ciLow) * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 -translate-x-1/2 bg-[var(--accent)]"
          style={{ left: pct(winRate) }}
        />
        <div
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-[var(--muted-2)]"
          style={{ left: "50%" }}
        />
      </div>
    </div>
  );
}
