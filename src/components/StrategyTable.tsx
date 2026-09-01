"use client";

import { useMemo, useState } from "react";
import type { Market, Strategy } from "@/types/performance";
import { formatBp } from "@/lib/format";
import SectionHeading from "./SectionHeading";

type SortKey = "expectancy_bp" | "win_rate" | "trips";

const SORT_LABEL: Record<SortKey, string> = {
  expectancy_bp: "기대값",
  win_rate: "승률",
  trips: "왕복",
};

export default function StrategyTable({ strategies }: { strategies: Strategy[] }) {
  const [market, setMarket] = useState<"ALL" | Market>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("expectancy_bp");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const filtered =
      market === "ALL" ? strategies : strategies.filter((s) => s.markets.includes(market));
    const sorted = [...filtered].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return asc ? diff : -diff;
    });
    return sorted;
  }, [strategies, market, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((v) => !v);
    } else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <section id="strategies" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading
        eyebrow="Strategy Scoreboard"
        title="전략별 성적표"
        description="왕복 수가 적을수록 승률·기대값의 신뢰구간이 넓어집니다 — 표본 부족 뱃지가 붙은 전략은 판단을 보류하세요."
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5">
          {(["ALL", "KR", "US"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                market === m
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {m === "ALL" ? "전체" : m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-2)]">
          정렬:
          {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`rounded border px-2.5 py-1 font-medium transition-colors ${
                sortKey === key
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] hover:text-[var(--foreground)]"
              }`}
            >
              {SORT_LABEL[key]} {sortKey === key ? (asc ? "↑" : "↓") : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-x mt-5 rounded border border-[var(--border)]">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs text-[var(--muted-2)]">
              <th className="px-4 py-3 font-medium">전략</th>
              <th className="px-4 py-3 font-medium">시장</th>
              <th className="px-4 py-3 font-medium">왕복</th>
              <th className="px-4 py-3 font-medium">승률 (95% CI)</th>
              <th className="px-4 py-3 font-medium">기대값</th>
              <th className="px-4 py-3 font-medium">판정</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-[var(--border)] last:border-0 bg-[var(--surface)]">
                <td className="px-4 py-3.5 font-medium">
                  <div className="flex items-center gap-2">
                    {s.name_ko}
                    {s.sample_warning && (
                      <span className="rounded border border-[var(--accent)] px-1.5 py-0.5 text-[10px] font-normal text-[var(--accent)]">
                        표본 부족
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[var(--muted)]">{s.markets.join(", ")}</td>
                <td className="tnum px-4 py-3.5">{s.trips}</td>
                <td className="px-4 py-3.5">
                  <WinRateBar winRate={s.win_rate} ciLow={s.ci_low} ciHigh={s.ci_high} />
                </td>
                <td
                  className={`tnum px-4 py-3.5 font-medium ${
                    s.expectancy_bp >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
                  }`}
                >
                  {formatBp(s.expectancy_bp)}
                </td>
                <td className="px-4 py-3.5 text-xs text-[var(--muted)]">{s.verdict}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
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
      <div className="relative h-1.5 w-24 rounded-full bg-[var(--surface-2)]">
        <div
          className="absolute h-1.5 rounded-full bg-[var(--muted-2)] opacity-40"
          style={{ left: pct(ciLow), width: `${(ciHigh - ciLow) * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-[var(--surface)] bg-[var(--accent)]"
          style={{ left: pct(winRate) }}
        />
        <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-[var(--muted-2)]" style={{ left: "50%" }} />
      </div>
    </div>
  );
}
