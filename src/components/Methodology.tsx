"use client";

import { useT } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

export default function Methodology() {
  const t = useT();

  return (
    <section id="methodology" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <SectionHeading
        eyebrow={t.methodology.eyebrow}
        title={t.methodology.title}
        description={t.methodology.description}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {t.methodology.items.map((item) => (
          <div key={item.title} className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
