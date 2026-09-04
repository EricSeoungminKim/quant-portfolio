"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MarketStats, Strategy, StrategyHelp } from "@/types/performance";
import { useLocale, useT } from "@/lib/i18n";
import { translateStrategyName, translateVerdict } from "@/lib/i18nData";
import { formatBp, formatHoldMinutes } from "@/lib/format";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Picks the locale's field, falling back to the other only when it's absent. */
function pick(help: StrategyHelp | null | undefined, base: string, locale: "en" | "ko"): string {
  if (!help) return "";
  const record = help as unknown as Record<string, unknown>;
  const primary = record[`${base}_${locale}`];
  if (typeof primary === "string" && primary.trim()) return primary;
  return "";
}

export default function StrategyHelpDrawer({
  strategy,
  hasCatalystArm,
  onClose,
}: {
  strategy: Strategy;
  /** True when a `<id>_cat` sibling exists, making this the base arm of a pair. */
  hasCatalystArm: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const help = strategy.help ?? null;
  const name = translateStrategyName(strategy.id, strategy.name_ko, strategy.name_en, locale);
  const isCatalystArm = strategy.id.endsWith("_cat");

  // Focus management: remember what was focused, move focus into the panel,
  // trap Tab inside it while open, and hand focus back on close.
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      restoreRef.current?.focus?.();
    };
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  const sections = [
    { label: t.strategies.sectionTheory, body: pick(help, "theory", locale) },
    { label: t.strategies.sectionEntry, body: pick(help, "entry", locale) },
    { label: t.strategies.sectionExit, body: pick(help, "exit", locale) },
    { label: t.strategies.sectionSizing, body: pick(help, "sizing", locale) },
    { label: t.strategies.sectionEvidence, body: pick(help, "evidence", locale) },
  ];
  const anyBody = sections.some((s) => s.body);
  const refs = help?.refs?.filter((r) => r && r.url && r.label) ?? [];

  const categoryLabel = (() => {
    switch (help?.category) {
      case "intraday":
        return t.strategies.categoryIntraday;
      case "swing":
        return t.strategies.categorySwing;
      case "experimental":
        return t.strategies.categoryExperimental;
      default:
        return help?.category ?? null;
    }
  })();

  return (
    <div className="fixed inset-0 z-50" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-label={t.strategies.close}
        onClick={onClose}
        className="scrim-in absolute inset-0 h-full w-full cursor-default bg-[color-mix(in_srgb,var(--background)_78%,transparent)] backdrop-blur-[2px]"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="strategy-help-title"
        className="drawer-in absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="mono-label text-[10px] text-[var(--accent)]">
              {t.strategies.helpTitle}
            </p>
            <h2
              id="strategy-help-title"
              className="display mt-2 text-xl font-semibold break-words"
            >
              {name}
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {categoryLabel && <Chip tone="accent">{categoryLabel}</Chip>}
              {(isCatalystArm || hasCatalystArm) && (
                <Chip tone="plain">
                  {isCatalystArm ? t.strategies.armCatalyst : t.strategies.armBase}
                </Chip>
              )}
              {strategy.enabled === false ? (
                <Chip tone="muted">{t.strategies.offBadge}</Chip>
              ) : strategy.enabled === true ? (
                <Chip tone="plain">{t.strategies.liveBadge}</Chip>
              ) : null}
              {strategy.total.sample_warning && (
                <Chip tone="accent">{t.strategies.sampleWarning}</Chip>
              )}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.strategies.close}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--control)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="scroll-y min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {(isCatalystArm || hasCatalystArm) && (
            <p className="mb-6 border-l-2 border-[var(--accent)] bg-[var(--accent-wash)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--muted)]">
              {t.strategies.armNote}
            </p>
          )}

          {!anyBody && (
            <p className="mb-7 text-sm leading-relaxed text-[var(--muted)]">
              {t.strategies.noHelp}
            </p>
          )}

          <dl className="space-y-6">
            {sections.map((s) => (
              <div key={s.label}>
                <dt className="mono-label text-[10px] text-[var(--muted-2)]">{s.label}</dt>
                <dd
                  className={`mt-2 text-sm leading-[1.75] ${
                    s.body ? "text-[var(--foreground)]" : "text-[var(--muted-2)] italic"
                  }`}
                >
                  {s.body || t.strategies.missing}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <p className="mono-label text-[10px] text-[var(--muted-2)]">
              {t.strategies.sectionRefs}
            </p>
            {refs.length > 0 ? (
              <ul className="mt-2.5 space-y-2">
                {refs.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-2 text-sm leading-relaxed text-[var(--accent)] underline decoration-[var(--accent)]/35 underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
                    >
                      <span className="break-words">{r.label}</span>
                      <svg
                        className="mt-1 shrink-0"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                      <span className="sr-only">{t.strategies.externalLink}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic text-[var(--muted-2)]">{t.strategies.missing}</p>
            )}
          </div>

          {/* The same honesty stats as the table row — a reader who opened the
              explainer should not have to close it to see the record. */}
          <div className="plate mt-9 p-4 sm:p-5">
            <p className="mono-label text-[10px] text-[var(--muted-2)]">
              {t.strategies.statsTitle}
            </p>
            <StatGrid stats={strategy.total} strategy={strategy} />

            <p className="mono-label mt-6 text-[10px] text-[var(--muted-2)]">
              {t.strategies.perMarketTitle}
            </p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <MarketCell label={t.strategies.marketAsia} stats={strategy.by_market.asia} />
              <MarketCell label={t.strategies.marketUs} stats={strategy.by_market.us} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatGrid({ stats, strategy }: { stats: Strategy["total"]; strategy: Strategy }) {
  const t = useT();
  const { locale } = useLocale();
  const rows: { label: string; value: string; tone?: "up" | "down" }[] = [
    { label: t.strategies.statTrips, value: String(stats.trips) },
    {
      label: t.strategies.statWinRate,
      value: `${(stats.win_rate * 100).toFixed(0)}% (${(stats.ci_low * 100).toFixed(0)}–${(
        stats.ci_high * 100
      ).toFixed(0)}%)`,
    },
    {
      label: t.strategies.statExpectancy,
      value: formatBp(stats.expectancy_bp),
      tone: stats.expectancy_bp >= 0 ? "up" : "down",
    },
    { label: t.strategies.statVerdict, value: translateVerdict(stats.verdict, locale) || "—" },
    {
      label: t.strategies.statTradesPerDay,
      value: strategy.trades_per_day != null ? strategy.trades_per_day.toFixed(1) : "—",
    },
    {
      label: t.strategies.statAvgHold,
      value:
        strategy.avg_hold_minutes != null ? formatHoldMinutes(strategy.avg_hold_minutes) : "—",
    },
  ];
  return (
    <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
      {rows.map((r) => (
        <div key={r.label}>
          <dt className="text-[10px] text-[var(--muted-2)]">{r.label}</dt>
          <dd
            className={`tnum mt-0.5 text-[13px] font-medium ${
              r.tone === "up"
                ? "text-[var(--up)]"
                : r.tone === "down"
                  ? "text-[var(--down)]"
                  : "text-[var(--foreground)]"
            }`}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function MarketCell({ label, stats }: { label: string; stats: MarketStats | null }) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <div className="border border-[var(--border)] px-3 py-2.5">
      <p className="text-[10px] text-[var(--muted-2)]">{label}</p>
      {stats ? (
        <p className="tnum mt-1 text-[12px]">
          {t.verdicts.tripsUnit(stats.trips)} ·{" "}
          <span className={stats.expectancy_bp >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}>
            {formatBp(stats.expectancy_bp)}
          </span>{" "}
          · <span className="text-[var(--muted)]">{translateVerdict(stats.verdict, locale) || "—"}</span>
        </p>
      ) : (
        <p className="tnum mt-1 text-[12px] text-[var(--muted-2)]">—</p>
      )}
    </div>
  );
}

function Chip({ tone, children }: { tone: "accent" | "plain" | "muted"; children: React.ReactNode }) {
  const cls =
    tone === "accent"
      ? "border-[var(--accent)] text-[var(--accent)]"
      : tone === "muted"
        ? "border-[var(--control)] text-[var(--muted-2)]"
        : "border-[var(--control)] text-[var(--muted)]";
  return (
    <span className={`mono-label border px-1.5 py-0.5 text-[9px] font-medium ${cls}`}>
      {children}
    </span>
  );
}
