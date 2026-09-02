"use client";

import { useT } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

const ICONS = [
  <IconStop key="stop" />,
  <IconBreaker key="breaker" />,
  <IconShield key="shield" />,
  <IconPulse key="pulse" />,
  <IconLock key="lock" />,
];

export default function Safety() {
  const t = useT();

  return (
    <section id="safety" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading eyebrow={t.safety.eyebrow} title={t.safety.title} description={t.safety.description} />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {t.safety.items.map((s, i) => (
          <div key={s.title} className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="text-[var(--accent)]">{ICONS[i]}</div>
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
