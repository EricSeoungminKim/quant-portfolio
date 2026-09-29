"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n";

export default function ResearchHistory({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return <details id="research-history" className="group border-y border-[var(--border)] scroll-mt-20">
    <summary className="mx-auto max-w-6xl cursor-pointer px-5 py-8 text-lg font-medium">
      <span className="mono-label mr-3 text-xs text-[var(--accent)]">02</span>
      {locale === "ko" ? "전체 전략의 기록과 비교 펼치기" : "Explore the full strategy record and comparisons"}
      <p className="mt-2 text-xs font-normal text-[var(--muted)]">{locale === "ko" ? "기존 계좌 합계·손실·전략별 곡선·거래 비용을 그대로 보존합니다. 주력 전략의 새 성과와 집계 범위를 구분해 읽어 주세요." : "Aggregate accounts, losses, strategy curves and costs are preserved. Their scope differs from new results for the primary candidate."}</p>
    </summary>
    {children}
  </details>;
}
