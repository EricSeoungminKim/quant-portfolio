"use client";

/**
 * Section heading with a numbered index.
 *
 * The index is not decoration: the page is a sequence — thesis, evidence,
 * per-strategy evidence, cost, mechanism, method, safeguards — and the same
 * numbers key the sticky rail in Nav. The rule under the eyebrow extends on
 * first paint (disabled under prefers-reduced-motion via globals.css).
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl" data-reveal>
      <div className="flex items-baseline gap-3">
        <span className="mono-label text-[11px] text-[var(--accent)]">{index}</span>
        <span className="mono-label text-[11px] text-[var(--muted-2)]">{eyebrow}</span>
      </div>
      <div className="mt-2.5 h-px w-full bg-[var(--hairline)]" aria-hidden />
      <h2 className="display mt-5 text-2xl font-semibold md:text-[2rem] md:leading-[1.15]">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      )}
    </div>
  );
}
