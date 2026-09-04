"use client";

import { useT } from "@/lib/i18n";

/**
 * "Why publish this now", moved out of the hero (2026-09-04). The hero now
 * leads with the measured numbers; the argument for publishing them belongs
 * at the end, where a reader who has seen the record can weigh it.
 */
export default function EditorsNote() {
  const t = useT();

  return (
    <section aria-labelledby="editors-note-title" className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
      <div className="plate p-5 sm:p-7" data-reveal>
        <div className="grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-10">
          <div>
            <p className="mono-label text-[10px] text-[var(--accent)]">{t.editorsNote.label}</p>
            <h2 id="editors-note-title" className="display mt-3 text-lg font-semibold">
              {t.editorsNote.title}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted-2)]">
              {t.editorsNote.signoff}
            </p>
          </div>
          <ol className="border-t border-[var(--border)] md:border-t-0">
            {t.editorsNote.bullets.map((b, i) => (
              <li
                key={b}
                className="flex gap-4 border-b border-[var(--border)] py-3.5 last:border-b-0 md:first:pt-0"
              >
                <span className="tnum shrink-0 pt-0.5 text-[11px] text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[13px] leading-[1.7] text-[var(--muted)]">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
