"use client";

import type { PerformanceData } from "@/types/performance";
import { hasPaperEpoch } from "@/lib/paperEpoch";
import { useLocale, useT } from "@/lib/i18n";
import { translateDataText } from "@/lib/i18nData";

// Fallback Korean sentence — exact literal the 2026-09-06 owner decision
// specified, registered as a lookup key in i18nData's DATA_TEXT_EN so it
// translates the same way a generator-supplied note would. Shown even when
// `paper_epoch.account_model` hasn't landed in the snapshot yet: this is a
// fact about how the site is run, not a measured number, so there's nothing
// to wait on data for.
const FALLBACK_NOTE_KO =
  "각 전략은 독립 모의계좌 — KR 1,000만원 / US $10,000 시작, 2026-09-07 에폭, 체결·수수료는 토스 기준";

/** Compact banner just below the hero stating the per-strategy paper-account
 *  model — see `Methodology`'s dynamically-appended item for the longer
 *  version and the FX-rate glossary note. */
export default function EpochNote({ data }: { data: PerformanceData }) {
  const t = useT();
  const { locale } = useLocale();

  const model = hasPaperEpoch(data) ? data.paper_epoch.account_model : null;
  const text = translateDataText(model?.note_ko ?? FALLBACK_NOTE_KO, model?.note_en, locale);

  return (
    <div className="mx-auto max-w-6xl px-5" data-reveal>
      <p className="plate flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 py-2.5 text-[11px] leading-relaxed text-[var(--muted)] sm:px-5">
        <span className="mono-label shrink-0 text-[9px] font-medium text-[var(--accent)]">
          {t.hero.epochBadge}
        </span>
        <span>{text}</span>
      </p>
    </div>
  );
}
