"use client";

import type { PerformanceData } from "@/types/performance";
import { useLocale, useT } from "@/lib/i18n";

export default function Hero({ data }: { data: PerformanceData }) {
  const t = useT();
  const { locale } = useLocale();
  const strategyCount = data.strategies.length;
  const { sessions, total_fills } = data.period;
  // `enabled` is only present once the generator started emitting it —
  // absent on older snapshots, in which case the existing copy stands.
  const hasEnabledFlag =
    typeof data.enabled_count === "number" ||
    data.strategies.some((s) => typeof s.enabled === "boolean");
  // Prefer the generator's settings-based count: strategies with no round
  // trips yet are enabled too, but never appear in `strategies[]`.
  const enabledCount =
    data.enabled_count ?? data.strategies.filter((s) => s.enabled).length;

  return (
    <section id="top" className="mx-auto max-w-6xl px-5 pt-14 pb-16 md:pt-20 md:pb-20">
      <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded border border-[var(--up)] bg-[var(--up-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--up)]">
            {t.hero.badge}
          </span>

          <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-[1.25] tracking-tight md:text-[2.6rem]">
            {t.hero.title(strategyCount)}
          </h1>

          {hasEnabledFlag && (
            <p className="tnum mt-3 text-sm font-medium text-[var(--accent)]">
              {t.hero.liveCount(enabledCount, strategyCount)}
            </p>
          )}

          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-[var(--muted)]">
            {t.hero.body}
          </p>

          <dl className="mt-9 grid grid-cols-3 gap-px overflow-hidden rounded border border-[var(--border)] bg-[var(--border)] max-w-md">
            <Stat label={t.hero.statStrategies} value={strategyCount} locale={locale} />
            <Stat label={t.hero.statSessions} value={sessions} locale={locale} />
            <Stat label={t.hero.statFills} value={total_fills} locale={locale} />
          </dl>
        </div>

        <div className="flex flex-col justify-center gap-4 rounded border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-wide text-[var(--muted-2)]">{t.hero.whyNowLabel}</p>
          <ul className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
            {t.hero.bullets.map((b) => (
              <li key={b} className="flex gap-2.5">
                <Bullet />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, locale }: { label: string; value: number; locale: "en" | "ko" }) {
  return (
    <div className="bg-[var(--surface)] px-4 py-3">
      <div className="tnum text-xl font-semibold">
        {value.toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}
      </div>
      <div className="text-xs text-[var(--muted-2)]">{label}</div>
    </div>
  );
}

function Bullet() {
  return (
    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
  );
}
