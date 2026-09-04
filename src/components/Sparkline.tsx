"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { EquityPoint } from "@/types/performance";

const W = 240;
const H = 72;
const PAD = 6;

/**
 * The hero's equity line: the same curve as section 01, at tile scale, drawn
 * in left-to-right on first paint the way a plotter would.
 *
 * `preserveAspectRatio="none"` lets the drawing stretch to whatever width the
 * tile has; `vector-effect="non-scaling-stroke"` keeps the stroke a true 1.5px
 * through that stretch, so the line never thickens or thins with the layout.
 */
export default function Sparkline({
  rows,
  label,
}: {
  rows: EquityPoint[];
  label: string;
}) {
  const points = rows.filter(
    (r): r is EquityPoint & { cum_pct: number } => r.cum_pct !== null
  );
  const lineRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState<number | null>(null);

  const values = points.map((p) => p.cum_pct);
  // Always include zero so the baseline is on the chart even when every point
  // sits below it — the distance from zero is the whole reading.
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const n = points.length;

  const xAt = (i: number) => PAD + (n <= 1 ? (W - PAD * 2) / 2 : (i / (n - 1)) * (W - PAD * 2));
  const yAt = (v: number) => PAD + ((max - v) / span) * (H - PAD * 2);
  const zeroY = yAt(0);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(p.cum_pct).toFixed(2)}`).join(" ");
  const area =
    n > 0
      ? `M ${xAt(0).toFixed(2)} ${zeroY.toFixed(2)} ${points
          .map((p, i) => `L ${xAt(i).toFixed(2)} ${yAt(p.cum_pct).toFixed(2)}`)
          .join(" ")} L ${xAt(n - 1).toFixed(2)} ${zeroY.toFixed(2)} Z`
      : "";

  useLayoutEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    try {
      setLen(Math.ceil(el.getTotalLength()) + 2);
    } catch {
      setLen(null);
    }
  }, [line]);

  if (n === 0) return null;

  const last = points[n - 1].cum_pct;
  const tone = last >= 0 ? "var(--up)" : "var(--down)";
  const wash = last >= 0 ? "var(--up-bg)" : "var(--down-bg)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-[72px] w-full"
      role="img"
      aria-label={label}
    >
      <line
        x1={0}
        x2={W}
        y1={zeroY}
        y2={zeroY}
        stroke="var(--border)"
        strokeWidth={1}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
      />
      <path d={area} fill={wash} className="fade-in-late" />
      <path
        ref={lineRef}
        d={line}
        fill="none"
        stroke={tone}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={len ? "draw-line" : undefined}
        style={len ? ({ "--draw-length": `${len}` } as React.CSSProperties) : undefined}
      />
    </svg>
  );
}
