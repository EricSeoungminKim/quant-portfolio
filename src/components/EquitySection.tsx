import type { PerformanceData } from "@/types/performance";
import EquityChart from "./EquityChart";
import SectionHeading from "./SectionHeading";

export default function EquitySection({ data }: { data: PerformanceData }) {
  return (
    <section id="equity" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading
        eyebrow="Equity Curve"
        title="수익 곡선"
        description="시작 시드 대비 누적 수익률. 점을 클릭하거나 키보드로 이동하면 그날의 체결 수와 당일 등락을 볼 수 있습니다."
      />

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
        <Legend swatch="var(--up)" label="양수(+) — 국내 관행상 빨강" />
        <Legend swatch="var(--down)" label="음수(−) — 국내 관행상 파랑" />
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-0.5 bg-[var(--accent)]" />
          단계 경계 (실계좌 이식)
        </span>
      </div>

      <div className="mt-6 rounded border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
        <EquityChart equity={data.equity} phases={data.phases} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.phases.map((phase) => (
          <div key={phase.id} className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{phase.label}</span>
              <span className="tnum text-xs text-[var(--muted-2)]">
                {phase.from} {phase.to ? `– ${phase.to}` : "– 진행 중"}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{phase.note}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--muted-2)]">
        {data.excluded.seeding_liquidation.note} (제외된 체결 {data.excluded.seeding_liquidation.fills}건)
      </p>
    </section>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: swatch }} />
      {label}
    </span>
  );
}
