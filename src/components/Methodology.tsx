"use client";

import { useT } from "@/lib/i18n";
import Abbr from "./Abbr";
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
              <dt className="text-sm font-medium">
                {item.bpAbbr ? <TitleWithBpAbbr title={item.title} /> : item.title}
              </dt>
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

      {/* Compact glossary: every piece of jargon on this page in one place,
          for a reader who lands mid-section rather than at the top. */}
      <div className="mt-6 border-t border-[var(--border)] pt-6" data-reveal>
        <h4 className="mono-label text-[10px] text-[var(--accent)]">{t.methodology.glossaryTitle}</h4>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs leading-relaxed">
          {t.methodology.glossary.map((g) => (
            <div key={g.term} className="flex max-w-full gap-1.5">
              <dt className="shrink-0 font-medium text-[var(--foreground)]">{g.term}</dt>
              <dd className="text-[var(--muted)]">— {g.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Splits an item title around its one literal "bp" substring and wraps just
 * that part with the interactive glossary abbreviation — works for both the
 * English "Expectancy (bp)" and Korean "기대값(bp)" phrasing. */
function TitleWithBpAbbr({ title }: { title: string }) {
  const t = useT();
  const i = title.indexOf("bp");
  if (i === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, i)}
      <Abbr term="bp" definition={t.glossary.bp} />
      {title.slice(i + 2)}
    </>
  );
}
