export default function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="tnum text-xs font-medium uppercase tracking-widest text-[var(--accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      )}
    </div>
  );
}
