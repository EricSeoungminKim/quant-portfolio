import type { PerformanceData } from "@/types/performance";

export default function Hero({ data }: { data: PerformanceData }) {
  const strategyCount = data.strategies.length;
  const { sessions, total_fills } = data.period;

  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pt-14 pb-16 md:pt-20 md:pb-20">
      <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded border border-[var(--up)] bg-[var(--up-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--up)]">
            모의투자 (paper) — 실제 수익이 아닙니다
          </span>

          <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-[1.25] tracking-tight md:text-[2.6rem]">
            한국·미국 정규장에서{" "}
            <span className="text-[var(--accent)]">{strategyCount}개 전략</span>이
            동시에 도는 개인용 자동매매 엔진
          </h1>

          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-[var(--muted)]">
            수익률을 자랑하려는 페이지가 아닙니다. 이 프로젝트는 &ldquo;측정을
            얼마나 엄격하게 하는가&rdquo;를 보여주는 페이지입니다. 표본이
            작으면 판단을 보류하고, 세금·수수료를 실비로 반영하고, 손실도
            그대로 공개합니다.
          </p>

          <dl className="mt-9 grid grid-cols-3 gap-px overflow-hidden rounded border border-[var(--border)] bg-[var(--border)] max-w-md">
            <Stat label="전략" value={strategyCount} />
            <Stat label="거래일" value={sessions} />
            <Stat label="체결" value={total_fills} />
          </dl>
        </div>

        <div className="flex flex-col justify-center gap-4 rounded border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-wide text-[var(--muted-2)]">
            지금 공개하는 이유
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
            <li className="flex gap-2.5">
              <Bullet />
              GitHub은 비공개라 코드를 직접 보여줄 수 없습니다 — 대신 원리와
              실측치를 공개합니다.
            </li>
            <li className="flex gap-2.5">
              <Bullet />
              3주차 모의투자는 누적 손실 구간입니다. 유리한 구간만 잘라
              보여주지 않습니다.
            </li>
            <li className="flex gap-2.5">
              <Bullet />
              전략마다 신뢰구간과 표본 경고를 함께 표기해 과신을 막습니다.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--surface)] px-4 py-3">
      <div className="tnum text-xl font-semibold">{value.toLocaleString("ko-KR")}</div>
      <div className="text-xs text-[var(--muted-2)]">{label}</div>
    </div>
  );
}

function Bullet() {
  return (
    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
  );
}
