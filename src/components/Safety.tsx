import SectionHeading from "./SectionHeading";

const SAFEGUARDS = [
  {
    title: "텔레그램 원격 정지 · 청산",
    detail: "장중 어디서든 메시지 한 번으로 신규 진입을 멈추거나 보유 포지션을 즉시 청산.",
    icon: <IconStop />,
  },
  {
    title: "회로차단기",
    detail: "손실이 일일 한도를 넘으면 해당 전략을 자동으로 그날 거래에서 제외.",
    icon: <IconBreaker />,
  },
  {
    title: "서버측 손절",
    detail: "클라이언트 연결이 끊겨도 브로커 서버에 걸린 주문으로 손절이 집행.",
    icon: <IconShield />,
  },
  {
    title: "데드맨 스위치",
    detail: "엔진의 헬스체크가 일정 시간 끊기면 안전한 상태로 자동 정지.",
    icon: <IconPulse />,
  },
  {
    title: "장중 배포 차단",
    detail: "정규장이 열려 있는 동안에는 배포·재시작 파이프라인 자체가 막힘.",
    icon: <IconLock />,
  },
];

export default function Safety() {
  return (
    <section id="safety" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading
        eyebrow="Safeguards"
        title="안전장치"
        description="실제 돈이 걸려 있는 시스템입니다. 전략이 틀리는 것보다 시스템이 통제 불능이 되는 것을 더 경계합니다."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SAFEGUARDS.map((s) => (
          <div key={s.title} className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="text-[var(--accent)]">{s.icon}</div>
            <p className="mt-3 text-sm font-medium">{s.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{s.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IconStop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}
function IconBreaker() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
    </svg>
  );
}
function IconPulse() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 12h4l2 7 4-14 2 7h6" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
