"use client";

import type { PerformanceData } from "@/types/performance";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText } from "@/lib/i18nData";
import { formatDateOnly } from "@/lib/format";
import { formatPct } from "@/lib/format";

/** Dated decisions and their limitations; no retrospective winner claim. */
export function ResearchJourney({ data }: { data: PerformanceData }) {
  const { locale } = useLocale();
  const ko = locale === "ko";
  const stages = ko ? [
    ["2026-09-07", "병렬 모의계좌로 시작", "각 전략에 독립 자본을 배정해 비용 후 거래 기록을 비교했습니다."],
    ["2026-09-30 AM", "9/29 마감 기록 점검", "한국시간 9/30 오전, 9/29 마감 자료의 기간·분모·낙폭을 맞췄습니다. KR 촉매형의 당시 36거래도 최대 이익 1거래를 빼면 순손실이어서 수익 집중을 경계했습니다."],
    ["2026-09-30", "KR 촉매형을 연구 주력으로 선정", "여러 전략의 병렬 운영을 줄이고 한 후보에 관찰을 집중합니다. 실거래 승격이나 우월성 입증은 아닙니다."],
    ["NEXT", "새 표본으로 다시 검증", "9/7 계좌 이력과 주력 전환 이후의 새 표본을 구분해 기록합니다. 비용·낙폭·이익 집중을 관찰하며 파라미터 개선 효과는 아직 검증 전입니다."],
  ] : [
    ["2026-09-07", "Start with parallel paper accounts", "Independent capital per strategy made post-cost records comparable."],
    ["2026-09-30 AM", "Audit the Sep 29 close", "On the morning of Sep 30 KST, periods, denominators and drawdowns in the Sep 29 closing record were reconciled. The KR catalyst arm's 36 trades were net-negative without its largest winner: concentration remained a concern."],
    ["2026-09-30", "Select one KR research focus", "Reduce parallel operation and concentrate observation on one candidate. This is neither live promotion nor proof of superiority."],
    ["NEXT", "Test on new observations", "Record new observations after the focus transition separately from the Sep 7 account history. Track costs, drawdowns and concentration; parameter improvements remain unvalidated."],
  ];
  const epoch = data.paper_epoch && "epoch" in data.paper_epoch ? data.paper_epoch : null;
  const evidence = (id: string, market: "asia" | "us") => {
    const account = epoch?.strategies.find((s) => s.id === id);
    const stat = account?.by_market?.[market];
    const last = account?.curve[market].at(-1);
    if (!stat) return ko ? "자료 없음" : "No data";
    return `${market === "asia" ? "KR" : "US"} · ${stat.trips} ${ko ? "거래" : "trips"} · ${last?.cum_pct == null ? "—" : formatPct(last.cum_pct, 2)} · ${ko ? "승률" : "win rate"} ${stat.win_rate == null ? "—" : `${(stat.win_rate * 100).toFixed(1)}%`} · ${stat.expectancy_bp == null ? "—" : stat.expectancy_bp.toFixed(2)} bp/${ko ? "거래" : "trade"}`;
  };
  const smallBooks = epoch?.strategies.flatMap((s) => [s.by_market?.asia, s.by_market?.us]).filter((s) => s && s.trips < 30).length ?? 0;
  const reasons = ko ? [
    ["짧은 보유 전략", evidence("scalp_1m", "asia") + " / " + evidence("pullback_impulse", "us"), "9/29 마감 자료에서 KR 스캘프·US 눌림목의 비용 후 손실이 확인되어 주력에서 제외했습니다. 거래 빈도와 노이즈의 관계는 추가 검증할 가설입니다."],
    ["기본형 KR 돌파", evidence("vol_breakout", "asia"), "9/29까지 비용 후 손실과 12거래의 작은 표본으로 주력 선정 근거가 부족했습니다. 촉매형과의 차이가 유니버스 때문이라고 단정하지 않습니다."],
    ["촉매형 US 돌파", evidence("vol_breakout_cat", "us"), "한국장에 관찰을 집중하기 위해 보류했습니다. 시장·비용·체결 환경이 달라 KR 성과를 옮길 근거가 부족하며, 양수 이력도 실전 집행 검증을 대신하지 않습니다."],
    ["표본이 적은 계좌", `${smallBooks}개 시장별 계좌가 30거래 미만`, "증거가 부족해 운영 우선순위를 보류했습니다. 미거래·저표본은 실패 확정이 아니며, 30거래를 넘었다고 검증 완료도 아닙니다."],
  ] : [
    ["Short-hold strategies", evidence("scalp_1m", "asia") + " / " + evidence("pullback_impulse", "us"), "Post-cost losses in KR scalping and US pullbacks through Sep 29 excluded these lanes from the primary focus. A link between trading frequency and noise remains a hypothesis."],
    ["Base KR breakout", evidence("vol_breakout", "asia"), "Post-cost losses and only 12 trades through Sep 29 provided insufficient evidence for primary selection. Universe differences are not established causes."],
    ["US catalyst breakout", evidence("vol_breakout_cat", "us"), "Deferred to concentrate observation on KR. Different markets, costs and execution prevent automatic transfer; a positive record does not validate live execution."],
    ["Limited samples", `${smallBooks} market accounts below 30 trips`, "Deferred in operational priority because evidence is limited. No trades or few trades do not establish failure; crossing 30 trades does not establish validity."],
  ];
  return <section className="mx-auto max-w-6xl px-5 py-12">
    <h2 className="display text-2xl font-semibold">{ko ? "왜 한 전략에 집중하게 됐나" : "Why the research narrowed"}</h2>
    <ol className="mt-8 grid gap-6 md:grid-cols-4">{stages.map(([date, title, body]) => <li key={date} className="border-t-2 border-[var(--accent)] pt-4"><span className="mono-label text-xs text-[var(--muted-2)]">{date}</span><h3 className="mt-3 font-medium">{title}</h3><p className="mt-3 text-xs leading-6 text-[var(--muted)]">{body}</p></li>)}</ol>
    <details className="mt-8 border-y border-[var(--border)] py-5"><summary className="cursor-pointer font-medium">{ko ? "다른 전략을 보류한 이유와 비교 기록" : "Why other lanes were deferred, with their records"}</summary>
      <p className="mt-4 text-xs leading-6 text-[var(--muted)]">{ko ? "승률이 낮다고 수익성이 없다는 뜻은 아닙니다. 수익 크기·비용·표본을 함께 봅니다. 아래는 공개 스냅샷의 기존 계좌 기록이며, 미래 성과의 순위표가 아닙니다." : "A low win rate does not imply unprofitability. Payoffs, costs and sample size also matter. These are existing account records, not a ranking of future performance."}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{reasons.map(([title, numbers, body]) => <article key={title}><h3 className="text-sm font-medium">{title}</h3><p className="tnum mt-2 text-xs">{numbers}</p><p className="mt-2 text-xs leading-6 text-[var(--muted)]">{body}</p></article>)}</div>
      <a href="#research-history" className="mt-5 inline-block text-xs underline">{ko ? "전체 전략 기록과 비용 보기" : "View the full record and costs"}</a>
    </details>
  </section>;
}

/**
 * The desk's running log line: what window is being measured, how wide the
 * sample is, how many strategies are live, and how much of gross P&L the
 * costs took. Every cell is data-driven and drops out when its field is
 * absent from the snapshot.
 */
export default function ResearchLog({ data }: { data: PerformanceData }) {
  const t = useT();
  const { locale } = useLocale();

  const window =
    data.period.start &&
    `${formatDateOnly(data.period.start)}${
      data.period.end ? ` – ${formatDateOnly(data.period.end)}` : ""
    }`;
  const scope = translateDataText(data.period.note ?? "", data.period.note_en, locale);
  const sample = translateDataText(
    data.strategies_note ?? "",
    data.strategies_note_en,
    locale
  );
  const enabledCount = data.enabled_count ?? data.strategies.filter((s) => s.enabled).length;
  const feeDrag = data.costs.fee_drag_pct_of_gross;

  const cells: { label: string; value: string; tone?: "warn" }[] = [];
  if (window) cells.push({ label: t.researchLog.periodLabel, value: window });
  cells.push({
    label: t.researchLog.tripsLabel,
    value: sample || t.researchLog.sessionsUnit(data.period.sessions),
  });
  if (scope) cells.push({ label: t.researchLog.scopeLabel, value: scope });
  cells.push({
    label: t.researchLog.enabledLabel,
    value: t.researchLog.enabledUnit(enabledCount),
  });
  if (feeDrag != null) {
    cells.push({
      label: t.researchLog.feeDragLabel,
      value: t.researchLog.feeDragValue(feeDrag),
      tone: "warn",
    });
  }

  return (
    <section aria-label={t.researchLog.label} className="band">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex items-center gap-3 border-b border-[var(--border)] py-2.5">
          <span className="mono-label text-[10px] text-[var(--accent)]">
            {t.researchLog.label}
          </span>
          <span className="h-px flex-1 bg-[var(--hairline)]" aria-hidden />
        </div>
        {/* One log line, wrapping. Every cell carries its own left rule and
            the list is pulled left by the rule's own offset, so the first cell
            of every wrapped row aligns with the content column. */}
        <dl className="-ml-5 flex flex-wrap">
          {cells.map((c) => (
            <div
              key={c.label}
              className="flex min-w-0 flex-1 basis-64 flex-col gap-1.5 border-l border-[var(--border)] px-5 py-4"
            >
              <dt className="mono-label text-[10px] text-[var(--muted-2)]">{c.label}</dt>
              <dd
                className={`text-[13px] leading-snug ${
                  c.tone === "warn"
                    ? "tnum font-medium text-[var(--down)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {c.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
