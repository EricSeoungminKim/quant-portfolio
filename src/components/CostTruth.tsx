import type { ReactNode } from "react";
import type { Costs } from "@/types/performance";
import SectionHeading from "./SectionHeading";

export default function CostTruth({ costs }: { costs: Costs }) {
  const maxBp = Math.max(costs.kr_stock_roundtrip_bp, costs.kr_etf_roundtrip_bp, costs.us_roundtrip_bp);
  const taxBp = 20;
  const otherBp = costs.kr_stock_roundtrip_bp - taxBp;

  const bars = [
    { label: "KR 개별주 (왕복)", value: costs.kr_stock_roundtrip_bp, breakdown: true },
    { label: "KR ETF (왕복)", value: costs.kr_etf_roundtrip_bp },
    { label: "US (왕복)", value: costs.us_roundtrip_bp },
  ];

  return (
    <section id="cost" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading
        eyebrow="Cost Reality"
        title="비용의 진실"
        description="전략의 엣지가 왕복 비용보다 크지 않으면, 매매 자체가 순손실의 원인이 됩니다. 국내 개별주 거래의 절반 이상이 세금입니다."
      />

      <div className="mt-8 rounded border border-[var(--border)] bg-[var(--surface)] p-5 md:p-7">
        <div className="space-y-5">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span>{b.label}</span>
                <span className="tnum font-medium">{b.value}bp</span>
              </div>
              <div className="h-5 w-full overflow-hidden rounded-sm bg-[var(--surface-2)]">
                {b.breakdown ? (
                  <div className="flex h-full">
                    <div
                      className="flex h-full items-center bg-[var(--down)] pl-2 text-[10px] font-medium text-white"
                      style={{ width: `${(taxBp / maxBp) * 100}%` }}
                    >
                      세금 {taxBp}bp
                    </div>
                    <div
                      className="flex h-full items-center bg-[var(--muted-2)] pl-2 text-[10px] font-medium text-[var(--surface)]"
                      style={{ width: `${(otherBp / maxBp) * 100}%` }}
                    >
                      수수료·슬리피지 {otherBp}bp
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${(b.value / maxBp) * 100}%` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm leading-relaxed text-[var(--muted)]">
          {costs.note}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Note title="측정에 반영">
          체결마다 실제 수수료·세금·슬리피지를 원장에 기록하고, 전략별 기대값(bp)은 항상 비용
          차감 후 수치로 표기합니다.
        </Note>
        <Note title="엣지 &lt; 비용일 때">
          진입 규칙을 억지로 조이지 않습니다. 판정을 &ldquo;기각&rdquo; 또는 &ldquo;판단
          보류&rdquo;로 명시하고, 해당 전략의 자본 배분을 낮춥니다.
        </Note>
      </div>
    </section>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold text-[var(--accent)]">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{children}</p>
    </div>
  );
}
