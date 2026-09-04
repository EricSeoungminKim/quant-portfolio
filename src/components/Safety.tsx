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

export default function Safety({ index }: { index: string }) {
  const t = useT();

  // Trust band: the safeguards read as one continuous guarantee rather than
  // five separate cards, so they sit in a single full-bleed band with
  // hairline-divided cells.
  return (
    <section id="safety" className="band">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHeading
          index={index}
          eyebrow={t.safety.eyebrow}
          title={t.safety.title}
          description={t.safety.description}
        />

        <ul
          className="mt-10 grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3"
          data-reveal
        >
          {t.safety.items.map((s, i) => (
            <li key={s.title} className="flex gap-3.5 bg-[var(--surface)] p-5">
              <span className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden>
                {ICONS[i]}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{s.detail}</p>
              </div>
            </li>
          ))}
          {/* Keeps the final row of the 3-column grid from showing a bare
              border-coloured cell. */}
          <li className="hidden bg-[var(--surface)] lg:block" aria-hidden />
        </ul>
      </div>
    </section>
  );
}

function IconStop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}
function IconBreaker() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
    </svg>
  );
}
function IconPulse() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M3 12h4l2 7 4-14 2 7h6" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
