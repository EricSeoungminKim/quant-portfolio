"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LocaleToggle from "./LocaleToggle";
import { useT } from "@/lib/i18n";
import type { SectionEntry } from "@/lib/sections";

export default function Nav({ sections }: { sections: SectionEntry[] }) {
  const t = useT();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("equity");

  // Read progress: scroll position over scrollable height. Written straight
  // to a transform (scaleX) rather than a width, so it never triggers layout.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Active section: the topmost section whose heading has passed under the
  // sticky header. rootMargin pins the trigger line just below the bar.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const labels: Record<string, string> = {
    equity: t.nav.equity,
    curves: t.nav.curves,
    strategies: t.nav.strategies,
    cost: t.nav.cost,
    how: t.nav.how,
    methodology: t.nav.methodology,
    safety: t.nav.safety,
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a
          href="#top"
          className="group flex shrink-0 items-baseline gap-2.5"
          translate="no"
        >
          <span className="mono-label text-[12px] font-semibold text-[var(--foreground)]">
            {t.nav.brand}
          </span>
          <span className="hidden text-[11px] text-[var(--muted-2)] sm:inline">
            {t.nav.tagline}
          </span>
        </a>

        <nav aria-label={t.nav.sectionsLabel} className="hidden lg:block">
          <ol className="flex items-center gap-5">
            {sections.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-baseline gap-1.5 text-[13px] transition-colors ${
                      isActive
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span
                      className={`tnum text-[10px] ${
                        isActive ? "text-[var(--accent)]" : "text-[var(--muted-2)]"
                      }`}
                    >
                      {s.index}
                    </span>
                    {labels[s.key]}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Read progress. Sits on the header's own bottom border, so it costs no
          extra vertical space and can never cover a focused element. */}
      <div
        className="absolute inset-x-0 -bottom-px h-px bg-[var(--accent)] origin-left"
        style={{ transform: `scaleX(${progress})` }}
        role="progressbar"
        aria-label={t.nav.progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      />
    </header>
  );
}
