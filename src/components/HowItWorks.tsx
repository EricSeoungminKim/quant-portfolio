import SectionHeading from "./SectionHeading";

const PLANES = [
  {
    name: "수집",
    risk: "데이터가 빈다",
    allowed: "스크래핑, LLM 요약, 실패·재시도 허용",
  },
  {
    name: "분석",
    risk: "종목 선정이 나빠진다",
    allowed: "LLM 판단, 느린 배치 허용",
  },
  {
    name: "거래",
    risk: "돈을 잃는다",
    allowed: "결정론적 코드만 — LLM·네트워크 호출 금지",
    highlight: true,
  },
  {
    name: "제어",
    risk: "다음 세션이 나빠진다",
    allowed: "자동 파라미터 조정, 실험, 롤백",
  },
];

const TIMELINE = [
  { time: "00:00", label: "국면(regime) 판정", detail: "시장별 공격/중립/방어 배율 갱신" },
  { time: "07:50", label: "일일 리포트", detail: "관심종목 후보를 확신도 엔진에 태움" },
  { time: "09:00", label: "한국장 개장", detail: "채널 돌파 · 개장 돌파 · 세션 신고가 전략 가동" },
  { time: "22:30", label: "미국장 개장", detail: "동일 전략군이 US 유니버스로 확장 운용" },
  { time: "06:00", label: "정산", detail: "체결을 거래 원장에 영속화, 전략별 승률·기대값 집계" },
];

const DATA_SOURCES = ["키움 웹소켓 (실시간 시세)", "Toss (주문 집행)", "네이버 증권", "DART", "FRED"];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading
        eyebrow="Architecture"
        title="어떻게 작동하는가"
        description="코드는 기능이 아니라 '틀렸을 때 무엇을 잃는가'로 4개 평면으로 나뉩니다. 평면 간 의존 방향은 테스트가 임포트 그래프로 강제합니다."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PLANES.map((p) => (
          <div
            key={p.name}
            className={`rounded border p-4 ${
              p.highlight
                ? "border-[var(--accent)] bg-[var(--surface)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{p.name}</span>
              {p.highlight && (
                <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--background)]">
                  실거래
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-2)]">틀리면 → {p.risk}</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{p.allowed}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--muted-2)]">하루 시각표 (KST)</h3>
          <ol className="mt-4 space-y-0">
            {TIMELINE.map((t, i) => (
              <li key={t.time} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-[10px] font-medium text-[var(--accent)]">
                    {i + 1}
                  </span>
                  {i < TIMELINE.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-[var(--border)]" />
                  )}
                </div>
                <div className="pb-1">
                  <span className="tnum text-sm font-medium">{t.time}</span>
                  <span className="ml-2 text-sm">{t.label}</span>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{t.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted-2)]">데이터 출처</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {DATA_SOURCES.map((d) => (
                <li key={d} className="flex items-center gap-2.5">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--muted-2)]">AI가 있는 자리 / 없는 자리</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="font-medium">AI 있음</p>
                <p className="mt-1.5 leading-relaxed text-[var(--muted)]">
                  수집 요약, 종목 후보 분석, 제어 평면의 파라미터 제안
                </p>
              </div>
              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="font-medium">AI 없음</p>
                <p className="mt-1.5 leading-relaxed text-[var(--muted)]">
                  진입·청산 판단, 주문 집행 — 가격 기반 결정론적 코드만 실행
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
