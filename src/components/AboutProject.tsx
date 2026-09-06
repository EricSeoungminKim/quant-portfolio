"use client";

import { useT } from "@/lib/i18n";

/**
 * "What this project is" — a plain-language orientation for a reader who has
 * never seen the repo, placed right after the hero (2026-09-06). The hero
 * leads with the thesis and the measured numbers; this fills in the one
 * thing neither of those states outright — what kind of thing this even is
 * (a personal research lab, not a fund or a product) — in three or four
 * sentences, no marketing tone.
 */
export default function AboutProject() {
  const t = useT();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 md:pb-12" data-reveal>
      <div className="plate max-w-3xl p-5 sm:p-6">
        <p className="mono-label text-[10px] text-[var(--accent)]">{t.aboutProject.eyebrow}</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{t.aboutProject.body}</p>
      </div>
    </div>
  );
}
