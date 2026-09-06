"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "@/lib/i18n";
import { formatDateOnly } from "@/lib/format";
import SectionHeading from "./SectionHeading";
import researchLog from "@/data/research-log.json";

type Verdict = "GO" | "NO_GO" | "INSUFFICIENT";

interface ResearchLogEntry {
  id: string;
  date: string;
  idea: string;
  idea_en: string;
  data: string;
  data_en: string;
  method: string;
  method_en: string;
  headline: string;
  headline_en: string;
  verdict: Verdict;
  reason: string;
  reason_en: string;
  source: string;
}

const entries = researchLog as ResearchLogEntry[];

/**
 * Research verdicts log (2026-09-06) — curated backtest/research findings
 * from the trading repo's own research cycle (`src/data/research-log.json`,
 * hand-curated, not part of the generator's `performance.json` contract).
 * Placed after Methodology: this is the evidence trail behind the pipeline
 * that section describes, and it is deliberately unflattering — almost every
 * row here is a rejection. Every rejected idea is listed on purpose (see
 * `intentSentence`), not trimmed to a highlight reel.
 */
export default function ResearchVerdicts({ index }: { index: string }) {
  const t = useT();
  const { locale } = useLocale();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    []
  );

  const counts = useMemo(() => {
    const c = { GO: 0, NO_GO: 0, INSUFFICIENT: 0 } as Record<Verdict, number>;
    for (const e of sorted) c[e.verdict] += 1;
    return c;
  }, [sorted]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section id="research-verdicts" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHeading
        index={index}
        eyebrow={t.researchVerdicts.eyebrow}
        title={t.researchVerdicts.title}
        description={t.researchVerdicts.description}
      />

      <p
        className="mt-5 max-w-2xl border-l-2 border-[var(--accent)] pl-3.5 text-sm leading-relaxed text-[var(--foreground)]"
        data-reveal
      >
        {t.researchVerdicts.intentSentence}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4" data-reveal>
        <span className="tnum text-xs text-[var(--muted-2)]">
          {t.researchVerdicts.countLabel(sorted.length)}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {counts.NO_GO > 0 && <CountChip tone="down" label={t.researchVerdicts.verdictNoGo} n={counts.NO_GO} />}
          {counts.GO > 0 && <CountChip tone="up" label={t.researchVerdicts.verdictGo} n={counts.GO} />}
          {counts.INSUFFICIENT > 0 && (
            <CountChip tone="muted" label={t.researchVerdicts.verdictInsufficient} n={counts.INSUFFICIENT} />
          )}
        </div>
      </div>

      <div className="scroll-x mt-5 border border-[var(--border)]" data-reveal>
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left">
              <Th>{t.researchVerdicts.colDate}</Th>
              <Th>{t.researchVerdicts.colIdea}</Th>
              <Th>{t.researchVerdicts.colHeadline}</Th>
              <Th>{t.researchVerdicts.colVerdict}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const idea = locale === "ko" ? e.idea : e.idea_en;
              const open = openIds.has(e.id);
              return (
                <RowGroup
                  key={e.id}
                  entry={e}
                  idea={idea}
                  open={open}
                  onToggle={() => toggle(e.id)}
                  locale={locale}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RowGroup({
  entry,
  idea,
  open,
  onToggle,
  locale,
}: {
  entry: ResearchLogEntry;
  idea: string;
  open: boolean;
  onToggle: () => void;
  locale: "ko" | "en";
}) {
  const t = useT();
  const headline = locale === "ko" ? entry.headline : entry.headline_en;
  const data = locale === "ko" ? entry.data : entry.data_en;
  const method = locale === "ko" ? entry.method : entry.method_en;
  const reason = locale === "ko" ? entry.reason : entry.reason_en;
  const panelId = `research-log-${entry.id}`;

  return (
    <>
      <tr
        className="cursor-pointer border-b border-[var(--border)] bg-[var(--surface)] transition-colors last:border-0 hover:bg-[var(--surface-2)]"
        onClick={onToggle}
      >
        <td className="tnum whitespace-nowrap px-4 py-3.5 align-top text-xs text-[var(--muted-2)]">
          {formatDateOnly(entry.date)}
        </td>
        <td className="px-4 py-3.5 align-top font-medium">{idea}</td>
        <td className="px-4 py-3.5 align-top text-xs leading-relaxed text-[var(--muted)]">{headline}</td>
        <td className="px-4 py-3.5 align-top">
          <VerdictBadge verdict={entry.verdict} />
        </td>
        <td className="px-3 py-3.5 align-top text-right">
          <button
            type="button"
            onClick={(ev) => {
              ev.stopPropagation();
              onToggle();
            }}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? t.researchVerdicts.collapseFor(idea) : t.researchVerdicts.expandFor(idea)}
            className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border border-[var(--control)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              aria-hidden
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </td>
      </tr>
      {open && (
        <tr id={panelId} className="border-b border-[var(--border)] bg-[var(--band)] last:border-0">
          <td colSpan={5} className="px-4 py-4 sm:px-6">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="mono-label text-[9px] text-[var(--muted-2)]">
                  {t.researchVerdicts.dataLabel}
                </dt>
                <dd className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{data}</dd>
              </div>
              <div>
                <dt className="mono-label text-[9px] text-[var(--muted-2)]">
                  {t.researchVerdicts.methodLabel}
                </dt>
                <dd className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{method}</dd>
              </div>
              <div>
                <dt className="mono-label text-[9px] text-[var(--muted-2)]">
                  {t.researchVerdicts.reasonLabel}
                </dt>
                <dd className="mt-1.5 text-xs leading-relaxed text-[var(--foreground)]">{reason}</dd>
              </div>
            </dl>
            <p className="tnum mt-4 text-[10px] text-[var(--muted-2)]">
              {t.researchVerdicts.sourceLabel}: {entry.source}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const t = useT();
  const label =
    verdict === "GO"
      ? t.researchVerdicts.verdictGo
      : verdict === "NO_GO"
        ? t.researchVerdicts.verdictNoGo
        : t.researchVerdicts.verdictInsufficient;
  const cls =
    verdict === "GO"
      ? "border-[var(--up)] text-[var(--up)]"
      : verdict === "NO_GO"
        ? "border-[var(--down)] text-[var(--down)]"
        : "border-[var(--control)] text-[var(--muted)]";
  return (
    <span className={`mono-label inline-block whitespace-nowrap border px-1.5 py-0.5 text-[9px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function CountChip({ tone, label, n }: { tone: "up" | "down" | "muted"; label: string; n: number }) {
  const cls =
    tone === "up"
      ? "border-[var(--up)] text-[var(--up)]"
      : tone === "down"
        ? "border-[var(--down)] text-[var(--down)]"
        : "border-[var(--control)] text-[var(--muted)]";
  return (
    <span className={`mono-label inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-medium ${cls}`}>
      <span className="tnum">{n}</span>
      {label}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th scope="col" className="mono-label px-4 py-3 text-[9px] font-medium text-[var(--muted-2)]">
      {children}
    </th>
  );
}
