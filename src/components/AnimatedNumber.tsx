"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 900;

/**
 * Counts a measured value up once, the first time it scrolls into view.
 *
 * Two constraints shape this:
 *  - No layout shift. The element reserves the final string's width in `ch`
 *    up front (tabular figures make `ch` exact), so a counter running from
 *    "0" to "143" never reflows its neighbours.
 *  - Reduced motion is a hard stop, not a shorter animation. When the user
 *    asks for less motion the final value is painted immediately and no
 *    rAF loop is ever started.
 */
export default function AnimatedNumber({
  value,
  format,
  className = "",
}: {
  value: number;
  /** Renders the in-flight value; also defines the reserved width. */
  format: (v: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => format(value));
  const final = format(value);

  // If the measured value changes between renders, snap to the new settled
  // value during render rather than in an effect — React's own "adjusting
  // state when a prop changes" pattern, and the only path that keeps the
  // reduced-motion case correct without a synchronous setState in an effect.
  const [renderedFor, setRenderedFor] = useState(value);
  if (renderedFor !== value) {
    setRenderedFor(value);
    setDisplay(final);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion is a hard stop: `display` already holds the settled
    // value, so there is nothing to do but skip the animation entirely.
    if (reduced) return;

    let frame = 0;
    let cancelled = false;

    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        if (cancelled) return;
        const p = Math.min(1, (now - start) / DURATION_MS);
        // easeOutExpo — fast commitment, long settle, like a readout locking on
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setDisplay(format(value * eased));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      setDisplay(format(0));
      frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, format]);

  return (
    <span
      ref={ref}
      className={className}
      // Reserve the settled width so the count-up can't reflow the row.
      style={{ display: "inline-block", minWidth: `${final.length}ch` }}
    >
      {display}
    </span>
  );
}
