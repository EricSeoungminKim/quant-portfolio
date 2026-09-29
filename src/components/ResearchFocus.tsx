"use client";

import type { PerformanceData } from "@/types/performance";
import { useLocale } from "@/lib/i18n";
import { researchFocus } from "@/lib/researchFocus";
import { toStrategyCurvePoints } from "@/lib/paperEpoch";
import { formatMoneySigned, formatPct } from "@/lib/format";
import StrategyCurveChart from "./StrategyCurveChart";

export default function ResearchFocus({ data }: { data: PerformanceData }) {
  const { locale } = useLocale();
  const ko = locale === "ko";
  const focus = researchFocus(data);
  const name = ko ? "KR 촉매형 변동성 돌파" : "KR catalyst volatility breakout";
  const pct = (value: number | null | undefined) => value == null ? "—" : formatPct(value, 2);
  const cells = [
    [ko ? "비용 후 실현수익률" : "Realized return after costs", pct(focus?.returnPct)],
    [ko ? "종결 거래" : "Closed round trips", focus ? String(focus.stats.trips) : "—"],
    [ko ? "실현곡선 최대낙폭" : "Realized-curve maximum drawdown", pct(focus?.maxDrawdownPct == null ? null : -focus.maxDrawdownPct)],
    [ko ? "거래당 평균 순손익" : "Mean net return per trade", focus?.stats.expectancy_bp == null ? "—" : `${focus.stats.expectancy_bp.toFixed(2)} bp`],
  ];
  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pt-12 pb-12 md:pt-16">
      <div id="research-focus" className="scroll-mt-24">
        <span className="mono-label border border-[var(--accent)] px-3 py-1.5 text-[10px] text-[var(--accent)]">01 · PAPER · BURN_IN</span>
        <h1 className="display mt-7 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">{ko ? "한 전략을 남기고,\n다음 표본을 기다립니다." : "One research focus.\nThe next sample decides."}</h1>
        <p className="mt-6 text-xl font-medium">{name}</p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{ko
          ? "여러 전략의 모의 기록을 비교한 뒤, 한국장 촉매형 돌파를 단독 주력 연구 후보로 골랐습니다. 선정은 검증 통과가 아닙니다. 새 표본으로 비용·낙폭·수익 집중도를 확인하는 burn_in 단계입니다."
          : "After comparing parallel paper records, the KR catalyst breakout became the sole primary research candidate. Selection is not validation. It remains in burn_in while new observations test costs, drawdowns and concentration."}</p>
        <div className="plate mt-8">
          <div className="border-b border-[var(--border)] px-5 py-4 text-xs text-[var(--muted)]">{ko ? "기존 독립 모의계좌 기록 · 주력 선정 이전 기간 포함" : "Existing independent paper account · includes evidence before focus selection"}<br />{focus ? `${focus.start} — ${focus.end ?? "—"}` : (ko ? "KR 계좌 자료 없음" : "KR account unavailable")}</div>
          <dl className="grid grid-cols-2 gap-px bg-[var(--border)] md:grid-cols-4">{cells.map(([label, value]) => <div key={label} className="bg-[var(--background)] px-5 py-5"><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className="tnum mt-3 text-2xl font-medium">{value}</dd></div>)}</dl>
          {focus && focus.points.length > 0 && <div className="px-3 py-5 sm:px-5"><StrategyCurveChart currency="KRW" ariaLabel={ko ? "한국장 촉매형 돌파 기존 모의계좌 실현손익" : "KR catalyst breakout historical paper realized P&L"} series={[{
            id: "vol_breakout_cat", name, color: "var(--accent)", enabled: true,
            verdict: "burn_in", points: toStrategyCurvePoints(focus.points),
          }]} /></div>}
          <div className="border-t border-[var(--border)] px-5 py-4 text-xs leading-6 text-[var(--muted)]">{focus && <p>{ko ? "누적 실현손익" : "Cumulative realized P&L"}: {focus.netKrw == null ? "—" : formatMoneySigned(focus.netKrw, "KRW", locale)} · {ko ? "승률" : "Win rate"} {pct(focus.stats.win_rate == null ? null : focus.stats.win_rate * 100)}</p>}
            <p>{ko ? "곡선·낙폭은 종결 거래의 실현손익 기준이며 초기 자본을 포함합니다. 미청산 손익·장중 낙폭·실제 주문 체결 품질은 이 수치에 포함되지 않습니다." : "The curve and drawdown use closed-trade realized P&L and include initial capital. Open positions, intraday drawdowns and live execution quality are excluded."}</p>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-6 text-[var(--muted)]">{ko
          ? "이 공개 스냅샷에는 전환 이후 성과를 분리한 기준선이 아직 없습니다. 위 기록을 새 운영 방식의 수익률로 읽으면 안 됩니다. 고정 기준선과 새 표본의 비교도 아직 검증 전입니다."
          : "This published snapshot does not yet separate a post-transition baseline. The record above is not the return of the new operating setup. The fixed-baseline comparison with new observations remains unvalidated."}</p>
        <p className="mt-3 text-xs text-[var(--muted-2)]">{ko ? "자료 생성" : "Snapshot generated"}: {data.generated_at} · <a className="underline" href="/data/performance.json">{ko ? "원장 집계 JSON" : "Ledger aggregate JSON"}</a> · <a className="underline" href="/measurement-notes.md">{ko ? "검산 방법" : "Measurement notes"}</a></p>
      </div>
    </section>
  );
}
