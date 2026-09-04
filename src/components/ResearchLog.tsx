"use client";

import type { PerformanceData } from "@/types/performance";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText } from "@/lib/i18nData";
import { formatDateOnly } from "@/lib/format";

/**
 * The desk's running log line: what window is being measured, how wide the
 * sample is, how many strategies are live, and how much of gross P&L the
 * costs took. Every cell is data-driven and drops out when its field is
 * absent from the snapshot.
 */
export default function ResearchLog({ data }: { data: PerformanceData }) {
  const t = useT();
  const { locale } = useLocale();

  const window =
    data.period.start &&
    `${formatDateOnly(data.period.start)}${
      data.period.end ? ` – ${formatDateOnly(data.period.end)}` : ""
    }`;
  const scope = translateDataText(data.period.note ?? "", data.period.note_en, locale);
  const sample = translateDataText(
    data.strategies_note ?? "",
    data.strategies_note_en,
    locale
  );
  const enabledCount = data.enabled_count ?? data.strategies.filter((s) => s.enabled).length;
  const feeDrag = data.costs.fee_drag_pct_of_gross;

  const cells: { label: string; value: string; tone?: "warn" }[] = [];
  if (window) cells.push({ label: t.researchLog.periodLabel, value: window });
  cells.push({
    label: t.researchLog.tripsLabel,
    value: sample || t.researchLog.sessionsUnit(data.period.sessions),
  });
  if (scope) cells.push({ label: t.researchLog.scopeLabel, value: scope });
  cells.push({
    label: t.researchLog.enabledLabel,
    value: t.researchLog.enabledUnit(enabledCount),
  });
  if (feeDrag != null) {
    cells.push({
      label: t.researchLog.feeDragLabel,
      value: t.researchLog.feeDragValue(feeDrag),
      tone: "warn",
    });
  }

  return (
    <section aria-label={t.researchLog.label} className="band">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex items-center gap-3 border-b border-[var(--border)] py-2.5">
          <span className="mono-label text-[10px] text-[var(--accent)]">
            {t.researchLog.label}
          </span>
          <span className="h-px flex-1 bg-[var(--hairline)]" aria-hidden />
        </div>
        {/* One log line, wrapping. Every cell carries its own left rule and
            the list is pulled left by the rule's own offset, so the first cell
            of every wrapped row aligns with the content column. */}
        <dl className="-ml-5 flex flex-wrap">
          {cells.map((c) => (
            <div
              key={c.label}
              className="flex min-w-0 flex-1 basis-64 flex-col gap-1.5 border-l border-[var(--border)] px-5 py-4"
            >
              <dt className="mono-label text-[10px] text-[var(--muted-2)]">{c.label}</dt>
              <dd
                className={`text-[13px] leading-snug ${
                  c.tone === "warn"
                    ? "tnum font-medium text-[var(--down)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                {c.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
