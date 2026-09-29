"use client";

import { useLocale, useT } from "@/lib/i18n";

/**
 * "What this project is" — a plain-language orientation for a reader who has
 * never seen the repo, placed right after the hero (2026-09-06). The hero
 * leads with the thesis and the measured numbers; this fills in the one
 * thing neither of those states outright — what kind of thing this even is
 * (a personal research lab, not a fund or a product) — in three or four
 * sentences, no marketing tone.
 */
export default function AboutProject() {
  const t = useT();
  const { locale } = useLocale();
  const evidence = locale === "ko" ? [
    ["설계", "평면별 의존 규칙", "수집·분석·거래·제어의 허용된 임포트 방향을 테스트로 검사합니다."],
    ["검증", "원장부터 공개 수치까지", "성과 JSON의 자본·기간·거래 수를 검사하고 원장 집계와 교차대조합니다."],
    ["운영", "실패도 남기는 파이프라인", "하트비트·실패 원장·운영 문서로 멈춘 작업과 수정 근거를 추적합니다."],
  ] : [
    ["DESIGN", "Enforced dependency rules", "Import tests check the boundaries between collection, analysis, trading and control."],
    ["VERIFICATION", "From ledger to public totals", "Publication checks capital, period and trade counts, then reconciles them with ledger calculations."],
    ["OPERATIONS", "Failures leave a record", "Heartbeats, failure ledgers and runbooks make stopped jobs and corrective actions traceable."],
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 md:pb-12" data-reveal>
      <div className="plate p-5 sm:p-6">
        <p className="mono-label text-[10px] text-[var(--accent)]">{t.aboutProject.eyebrow}</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{t.aboutProject.body}</p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {evidence.map(([label, title, body]) => (
          <div className="border-t border-[var(--border)] pt-4" key={label}>
            <p className="mono-label text-[10px] text-[var(--accent)]">{label}</p>
            <h3 className="mt-2 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
