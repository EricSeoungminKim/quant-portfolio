"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChartYAxis, EquityPoint, PhaseBoundaryMark } from "@/types/performance";
import { formatDateLocale, formatPct } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";

const DEFAULT_W = 880;
const H = 340;
const PAD_L = 46;
const PAD_R = 10;
const PAD_T = 20;
const PAD_B = 30;

export default function EquityChart({
  rows,
  yAxis,
  phaseBoundaries,
  title,
}: {
  rows: EquityPoint[];
  yAxis: ChartYAxis;
  phaseBoundaries: PhaseBoundaryMark[];
  title: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Only points with a computable percentage can be plotted (cum_pct/day_pct
  // are null when the book's seed is 0/unknown for that stretch — nothing to
  // divide by). This is a defensive filter: in practice a book's seed is a
  // single value for its whole visible range, so it's all-or-nothing.
  const equity = useMemo(
    () => rows.filter((r): r is EquityPoint & { cum_pct: number; day_pct: number } =>
      r.cum_pct !== null && r.day_pct !== null
    ),
    [rows]
  );

  // Match the SVG's viewBox width to the container's real pixel width so
  // 1 viewBox unit ≈ 1 CSS px at all times. Without this, a fixed viewBox
  // scaled down to a narrow phone shrinks the (fixed user-unit) font size
  // right along with it — a 10px label can render at ~3px on a 320px phone.
  const [W, setW] = useState(DEFAULT_W);
  // Measured in a layout effect (not a plain effect) so the first painted
  // frame already uses the real container width — with the container's height
  // reserved below, that means the chart never reflows or squashes on load.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setW(Math.round(w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const n = equity.length;
  // Range/ticks come from the generator (chart.y_axis) — the same 18%-padding,
  // 5-tick formula that used to run here now runs server-side against the
  // full dataset (2026-09-02 "render-ready JSON" directive). Only the pixel
  // mapping (xAt/yAt) — genuinely a rendering concern — stays client-side.
  const { min: minV, max: maxV, ticks: yTicks, zero } = yAxis;

  const xAt = (i: number) => PAD_L + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => PAD_T + ((maxV - v) / (maxV - minV)) * innerH;
  const zeroY = yAt(zero);

  const linePath = useMemo(
    () =>
      equity
        .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.cum_pct).toFixed(1)}`)
        .join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [equity, maxV, minV, W]
  );

  const areaPath = useMemo(() => {
    if (n === 0) return "";
    const first = `M ${xAt(0).toFixed(1)} ${zeroY.toFixed(1)}`;
    const mid = equity.map((p, i) => `L ${xAt(i).toFixed(1)} ${yAt(p.cum_pct).toFixed(1)}`).join(" ");
    const last = `L ${xAt(n - 1).toFixed(1)} ${zeroY.toFixed(1)} Z`;
    return `${first} ${mid} ${last}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equity, maxV, minV, W]);

  function handlePointer(clientX: number) {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const fracX = (clientX - rect.left) / rect.width;
    const vbX = fracX * W;
    const idx = Math.round(((vbX - PAD_L) / innerW) * (n - 1));
    setActiveIdx(Math.min(n - 1, Math.max(0, idx)));
  }

  const active = activeIdx !== null ? equity[activeIdx] : null;

  // Plotter draw-in. The dash length has to be the path's real length, which
  // only the browser can measure — so it is read after layout and written to a
  // custom property the .draw-line keyframes consume. globals.css turns the
  // whole thing off under prefers-reduced-motion.
  const lineRef = useRef<SVGPathElement>(null);
  const [drawLength, setDrawLength] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    try {
      setDrawLength(Math.ceil(el.getTotalLength()) + 2);
    } catch {
      // getTotalLength is unavailable in some non-browser renderers — the
      // line then paints without the draw-in, which is the correct fallback.
      setDrawLength(null);
    }
  }, [linePath]);
  const drawStyle = drawLength
    ? ({ "--draw-length": `${drawLength}` } as React.CSSProperties)
    : undefined;

  // X labels: space them by available pixel width, not just point count, so
  // narrow screens automatically drop to fewer labels. First and last are
  // always shown regardless. English labels ("Aug 11") run noticeably wider
  // than Korean ones ("8/11"), so the per-label budget is locale-aware —
  // otherwise English labels overlap at widths where Korean ones still fit.
  // This (like xAt/yAt above) depends on the actual rendered container pixel
  // width, so it can't be precomputed server-side.
  const approxLabelPx = locale === "ko" ? 30 : 48;
  const maxLabels = Math.max(2, Math.floor(innerW / approxLabelPx));
  const xLabelEvery = n <= maxLabels ? 1 : Math.max(1, Math.ceil((n - 1) / (maxLabels - 1)));

  // The last point is always forced into the shown set (below), which can
  // land closer than one label-width to the last regularly-spaced label —
  // drop that one instead of letting the two overlap.
  const shownXLabels = useMemo(() => {
    const idx: number[] = [];
    for (let i = 0; i < n; i += xLabelEvery) idx.push(i);
    const last = n - 1;
    const prev = idx[idx.length - 1];
    if (prev !== last) {
      if (prev !== undefined && last - prev < xLabelEvery / 2) idx.pop();
      idx.push(last);
    }
    return new Set(idx);
  }, [n, xLabelEvery]);

  if (n === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-[var(--muted-2)]">
        {t.equity.emptyBook}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-1.5 sm:gap-2.5">
        <div
          aria-hidden
          className="flex w-4 shrink-0 items-center justify-center text-center text-[10px] leading-tight text-[var(--muted-2)]"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {t.equity.yAxisTitle}
        </div>

        <div
          ref={containerRef}
          className="relative min-w-0 flex-1 select-none"
          style={{ height: H }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full touch-none"
            preserveAspectRatio="none"
            role="img"
            aria-label={t.equity.chartAriaLabel(title)}
            onPointerMove={(e) => handlePointer(e.clientX)}
            onPointerDown={(e) => handlePointer(e.clientX)}
            onPointerLeave={() => setActiveIdx(null)}
          >
            {/* horizontal grid ticks, each labeled with its signed value + unit */}
            {yTicks.map((v) => {
              const isZero = Math.abs(v) < 1e-9;
              return (
                <g key={v}>
                  <line
                    x1={PAD_L}
                    x2={W - PAD_R}
                    y1={yAt(v)}
                    y2={yAt(v)}
                    stroke={isZero ? "var(--muted)" : "var(--grid-line)"}
                    strokeWidth={isZero ? 1.5 : 1}
                    strokeDasharray={isZero ? "4 3" : undefined}
                  />
                  <text
                    x={PAD_L - 8}
                    y={yAt(v)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="tnum"
                    fontSize={10}
                    fontWeight={isZero ? 600 : 400}
                    fill={isZero ? "var(--foreground)" : "var(--muted-2)"}
                  >
                    {isZero ? "0%" : formatPct(v, 1)}
                  </text>
                </g>
              );
            })}

            {/* zero baseline callout, drawn just inside the plot area so it
                never gets clipped against the left edge of the viewBox */}
            <text
              x={PAD_L + 4}
              y={Math.max(PAD_T + 8, zeroY - 4)}
              fontSize={9}
              fill="var(--muted)"
              className="tnum"
            >
              {t.equity.zeroBaseline}
            </text>

            {/* phase boundary markers (indices computed server-side) */}
            {phaseBoundaries.map((b) => (
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
                <text x={xAt(b.index) + 5} y={PAD_T + 10} fontSize={10} fill="var(--accent)">
                  {locale === "ko" ? b.label : b.label_en ?? b.label}
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

            <path
              d={areaPath}
              fill="var(--up-bg)"
              clipPath="url(#clip-positive)"
              className="fade-in-late"
            />
            <path
              d={areaPath}
              fill="var(--down-bg)"
              clipPath="url(#clip-negative)"
              className="fade-in-late"
            />
            <path
              ref={lineRef}
              d={linePath}
              fill="none"
              stroke="var(--up)"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              clipPath="url(#clip-positive)"
              className={drawLength ? "draw-line" : undefined}
              style={drawStyle}
            />
            <path
              d={linePath}
              fill="none"
              stroke="var(--down)"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              clipPath="url(#clip-negative)"
              className={drawLength ? "draw-line" : undefined}
              style={drawStyle}
            />

            {/* x labels — the last one is right-anchored so it never gets
                clipped against the plot's right edge (2026-09-02 fix: it used
                to render center-anchored like every other label, so "Sep 2"
                could get cut down to "Sep" at narrow widths). */}
            {equity.map((p, i) =>
              shownXLabels.has(i) ? (
                <text
                  key={p.date}
                  x={xAt(i)}
                  y={H - PAD_B + 16}
                  textAnchor={i === n - 1 ? "end" : "middle"}
                  className="tnum"
                  fontSize={10}
                  fill="var(--muted-2)"
                >
                  {formatDateLocale(p.date, locale)}
                </text>
              ) : null
            )}

            {/* points */}
            {equity.map((p, i) => (
              <circle
                className="fade-in-late"
                key={p.date}
                cx={xAt(i)}
                cy={yAt(p.cum_pct)}
                r={activeIdx === i ? 4 : 2.5}
                fill={p.day_pct >= 0 ? "var(--up)" : "var(--down)"}
                stroke="var(--surface)"
                strokeWidth={1}
                tabIndex={0}
                role="img"
                aria-label={t.equity.pointAriaLabel(p.date, formatPct(p.cum_pct), formatPct(p.day_pct), p.fills)}
                onFocus={() => setActiveIdx(i)}
              />
            ))}

            {/* crosshair — both axes, with the y value pinned to the axis so the
                reading can be taken without moving to the tooltip */}
            {active && activeIdx !== null && (
              <g pointerEvents="none">
                <line
                  x1={xAt(activeIdx)}
                  x2={xAt(activeIdx)}
                  y1={PAD_T}
                  y2={H - PAD_B}
                  stroke="var(--foreground)"
                  strokeOpacity={0.28}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={yAt(active.cum_pct)}
                  y2={yAt(active.cum_pct)}
                  stroke="var(--foreground)"
                  strokeOpacity={0.28}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <rect
                  x={0}
                  y={yAt(active.cum_pct) - 8}
                  width={PAD_L - 4}
                  height={16}
                  fill={active.cum_pct >= 0 ? "var(--up)" : "var(--down)"}
                />
                <text
                  x={PAD_L - 8}
                  y={yAt(active.cum_pct)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="tnum"
                  fontSize={9}
                  fontWeight={600}
                  fill="var(--surface)"
                >
                  {formatPct(active.cum_pct, 1)}
                </text>
              </g>
            )}
          </svg>

          {active && (
            <div
              className="pointer-events-none absolute top-2 right-2 min-w-[9.5rem] max-w-[calc(100%-1rem)] border border-[var(--control)] bg-[var(--surface)] px-3 py-2 text-xs"
              style={{ boxShadow: "0 6px 22px rgba(0,0,0,0.22)" }}
            >
              <div className="tnum font-medium">{active.date}</div>
              <div className="mt-1 flex justify-between gap-4 text-[var(--muted)]">
                <span>{t.equity.tooltipCum}</span>
                <span className={`tnum ${active.cum_pct >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                  {formatPct(active.cum_pct)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-[var(--muted)]">
                <span>{t.equity.tooltipDay}</span>
                <span className={`tnum ${active.day_pct >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                  {formatPct(active.day_pct)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-[var(--muted)]">
                <span>{t.equity.tooltipFills}</span>
                <span className="tnum">
                  {active.fills} {t.equity.fillsSuffix}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-1.5 ml-[calc(1rem+0.375rem)] text-[10px] text-[var(--muted-2)] sm:ml-[calc(1rem+0.625rem)]">
        {t.equity.xAxisTitle}
      </div>
    </div>
  );
}
