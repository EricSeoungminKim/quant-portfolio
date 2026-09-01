"use client";

import { useMemo, useRef, useState } from "react";
import type { EquityPoint, Phase } from "@/types/performance";
import { formatDate, formatPct } from "@/lib/format";

const W = 880;
const H = 340;
const PAD_L = 46;
const PAD_R = 10;
const PAD_T = 20;
const PAD_B = 30;

export default function EquityChart({
  equity,
  phases,
}: {
  equity: EquityPoint[];
  phases: Phase[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const n = equity.length;
  const values = equity.map((p) => p.cum_pct);
  const rawMax = Math.max(0, ...values);
  const rawMin = Math.min(0, ...values);
  const span = Math.max(rawMax - rawMin, 1);
  const maxV = rawMax + span * 0.18;
  const minV = rawMin - span * 0.18;

  const xAt = (i: number) => PAD_L + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => PAD_T + ((maxV - v) / (maxV - minV)) * innerH;
  const zeroY = yAt(0);

  const linePath = useMemo(
    () =>
      equity
        .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.cum_pct).toFixed(1)}`)
        .join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [equity, maxV, minV]
  );

  const areaPath = useMemo(() => {
    const first = `M ${xAt(0).toFixed(1)} ${zeroY.toFixed(1)}`;
    const mid = equity.map((p, i) => `L ${xAt(i).toFixed(1)} ${yAt(p.cum_pct).toFixed(1)}`).join(" ");
    const last = `L ${xAt(n - 1).toFixed(1)} ${zeroY.toFixed(1)} Z`;
    return `${first} ${mid} ${last}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equity, maxV, minV]);

  // First index of each phase after the initial one — draws the boundary marker.
  const boundaries = useMemo(() => {
    const marks: { index: number; label: string }[] = [];
    let prevPhase: string | null = null;
    equity.forEach((p, i) => {
      if (prevPhase !== null && p.phase !== prevPhase) {
        const phase = phases.find((ph) => ph.id === p.phase);
        marks.push({ index: i, label: phase?.label ?? p.phase });
      }
      prevPhase = p.phase;
    });
    return marks;
  }, [equity, phases]);

  function handlePointer(clientX: number) {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const fracX = (clientX - rect.left) / rect.width;
    const vbX = fracX * W;
    const idx = Math.round(((vbX - PAD_L) / innerW) * (n - 1));
    setActiveIdx(Math.min(n - 1, Math.max(0, idx)));
  }

  const active = activeIdx !== null ? equity[activeIdx] : null;
  const yTicks = [maxV, (maxV + minV) / 2, minV];

  // X labels: sparse, roughly 6 across the width.
  const xLabelEvery = Math.max(1, Math.round(n / 6));

  return (
    <div ref={containerRef} className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        role="img"
        aria-label="시작 시드 대비 누적 수익률 곡선"
        onPointerMove={(e) => handlePointer(e.clientX)}
        onPointerDown={(e) => handlePointer(e.clientX)}
        onPointerLeave={() => setActiveIdx(null)}
      >
        {/* horizontal grid ticks */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="var(--grid-line)"
              strokeWidth={1}
            />
            <text
              x={PAD_L - 8}
              y={yAt(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="tnum"
              fontSize={10}
              fill="var(--muted-2)"
            >
              {v.toFixed(1)}%
            </text>
          </g>
        ))}

        {/* zero baseline, emphasized */}
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--muted-2)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* phase boundary markers */}
        {boundaries.map((b) => (
          <g key={b.index}>
            <line
              x1={xAt(b.index)}
              x2={xAt(b.index)}
              y1={PAD_T}
              y2={H - PAD_B}
              stroke="var(--accent)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <text
              x={xAt(b.index) + 5}
              y={PAD_T + 10}
              fontSize={10}
              fill="var(--accent)"
            >
              {b.label}
            </text>
          </g>
        ))}

        <defs>
          <clipPath id="clip-positive">
            <rect x={PAD_L} y={PAD_T} width={innerW} height={Math.max(0, zeroY - PAD_T)} />
          </clipPath>
          <clipPath id="clip-negative">
            <rect x={PAD_L} y={zeroY} width={innerW} height={Math.max(0, H - PAD_B - zeroY)} />
          </clipPath>
        </defs>

        <path d={areaPath} fill="var(--up-bg)" clipPath="url(#clip-positive)" />
        <path d={areaPath} fill="var(--down-bg)" clipPath="url(#clip-negative)" />
        <path d={linePath} fill="none" stroke="var(--up)" strokeWidth={1.75} clipPath="url(#clip-positive)" />
        <path d={linePath} fill="none" stroke="var(--down)" strokeWidth={1.75} clipPath="url(#clip-negative)" />

        {/* x labels */}
        {equity.map((p, i) =>
          i % xLabelEvery === 0 || i === n - 1 ? (
            <text
              key={p.date}
              x={xAt(i)}
              y={H - PAD_B + 16}
              textAnchor="middle"
              className="tnum"
              fontSize={10}
              fill="var(--muted-2)"
            >
              {formatDate(p.date)}
            </text>
          ) : null
        )}

        {/* points */}
        {equity.map((p, i) => (
          <circle
            key={p.date}
            cx={xAt(i)}
            cy={yAt(p.cum_pct)}
            r={activeIdx === i ? 4 : 2.5}
            fill={p.day_pct >= 0 ? "var(--up)" : "var(--down)"}
            stroke="var(--surface)"
            strokeWidth={1}
            tabIndex={0}
            role="img"
            aria-label={`${p.date}, 누적 ${formatPct(p.cum_pct)}, 당일 ${formatPct(p.day_pct)}, 체결 ${p.fills}건`}
            onFocus={() => setActiveIdx(i)}
          />
        ))}

        {activeIdx !== null && (
          <line
            x1={xAt(activeIdx)}
            x2={xAt(activeIdx)}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke="var(--foreground)"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-2 right-2 min-w-[9.5rem] rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-sm"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
        >
          <div className="tnum font-medium">{active.date}</div>
          <div className="mt-1 flex justify-between gap-4 text-[var(--muted)]">
            <span>누적</span>
            <span className={`tnum ${active.cum_pct >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
              {formatPct(active.cum_pct)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[var(--muted)]">
            <span>당일</span>
            <span className={`tnum ${active.day_pct >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
              {formatPct(active.day_pct)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[var(--muted)]">
            <span>체결</span>
            <span className="tnum">{active.fills}건</span>
          </div>
        </div>
      )}
    </div>
  );
}
