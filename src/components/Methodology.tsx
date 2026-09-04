"use client";

import { useT } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

export default function Methodology({ index }: { index: string }) {
  const t = useT();

  return (
    <section id="methodology" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHeading
        index={index}
        eyebrow={t.methodology.eyebrow}
        title={t.methodology.title}
        description={t.methodology.description}
      />

      <dl className="mt-10 grid gap-px bg-[var(--border)] sm:grid-cols-2" data-reveal>
        {t.methodology.items.map((item, i) => (
          <div key={item.title} className="bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex items-baseline gap-2.5">
              <span className="tnum text-[10px] text-[var(--accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <dt className="text-sm font-medium">{item.title}</dt>
            </div>
            <dd className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{item.detail}</dd>
          </div>
        ))}
        {/* An odd item count would otherwise leave the grid's last cell as a
            bare border-coloured block. */}
        {t.methodology.items.length % 2 === 1 && (
          <div className="hidden bg-[var(--surface)] sm:block" aria-hidden />
        )}
      </dl>
    </section>
  );
}
