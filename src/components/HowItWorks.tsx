"use client";

import { useT } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

export default function HowItWorks() {
  const t = useT();

  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading eyebrow={t.how.eyebrow} title={t.how.title} description={t.how.description} />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {t.how.planes.map((p, i) => {
          const highlight = i === 2; // "거래" / "Trade" — the live-trading plane
          return (
            <div
              key={p.name}
              className={`rounded border p-4 ${
                highlight ? "border-[var(--accent)] bg-[var(--surface)]" : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{p.name}</span>
                {highlight && (
                  <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--background)]">
                    {t.how.liveBadge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--muted-2)]">
                {t.how.whenWrong} {p.risk}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{p.allowed}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--muted-2)]">{t.how.timelineTitle}</h3>
          <ol className="mt-4 space-y-0">
            {t.how.timeline.map((time, i) => (
              <li key={time.time} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-[10px] font-medium text-[var(--accent)]">
                    {i + 1}
                  </span>
                  {i < t.how.timeline.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-[var(--border)]" />
                  )}
                </div>
                <div className="pb-1">
                  <span className="tnum text-sm font-medium">{time.time}</span>
                  <span className="ml-2 text-sm">{time.label}</span>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{time.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted-2)]">{t.how.dataSourcesTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {t.how.dataSources.map((d) => (
                <li key={d} className="flex items-center gap-2.5">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--muted-2)]">{t.how.aiTitle}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="font-medium">{t.how.aiPresent}</p>
                <p className="mt-1.5 leading-relaxed text-[var(--muted)]">{t.how.aiPresentDesc}</p>
              </div>
              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="font-medium">{t.how.aiAbsent}</p>
                <p className="mt-1.5 leading-relaxed text-[var(--muted)]">{t.how.aiAbsentDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
