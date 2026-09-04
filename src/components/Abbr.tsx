"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/**
 * An inline jargon term with a dotted underline that reveals its definition
 * in a small popover — on hover and keyboard focus for desktop, and on tap
 * for touch, since a bare `<abbr title>` never reaches touch or keyboard
 * users. Used at the first "bp" occurrence in each section (see
 * CostTruth.tsx, StrategyTable.tsx, Methodology.tsx) and wherever else a term
 * from the Methodology glossary needs an inline definition.
 */
export default function Abbr({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  // A term near the right edge of its container (e.g. a right-aligned table
  // or bar-chart value) would otherwise push the popover off-screen — flip
  // it to hang off the trigger's right edge instead once open, the same
  // technique the strategy-curves chart tooltip already uses.
  useLayoutEffect(() => {
    if (!open || !tooltipRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) setAlignRight(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{ font: "inherit", color: "inherit" }}
        className="cursor-help border-0 border-b border-dotted border-current bg-transparent p-0 align-baseline"
      >
        {term}
      </button>
      {open && (
        <span
          ref={tooltipRef}
          role="tooltip"
          id={tooltipId}
          className={`pointer-events-none absolute top-full z-30 mt-1.5 w-max max-w-[min(16rem,85vw)] border border-[var(--control)] bg-[var(--surface)] px-2.5 py-2 text-left text-[11px] font-normal normal-case leading-relaxed text-[var(--muted)] shadow-[0_6px_22px_rgba(0,0,0,0.22)] ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          {definition}
        </span>
      )}
    </span>
  );
}
