"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { StrategyCurvePoint } from "@/types/performance";
import type { CurveSeries } from "@/lib/series";
import { formatDateLocale, formatMoneyCompact, formatMoneySigned } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";

const H = 300;
const PAD_L = 48;
const PAD_R = 10;
const PAD_T = 14;
const PAD_B = 28;
const DEFAULT_W = 640;
/** Below this the container scrolls instead of squashing the plot further. */
const MIN_W = 240;
/** How close (px) the pointer must be to a line before it counts as hovered. */
const HIGHLIGHT_RADIUS = 26;

interface Sample {
  /** Carried-forward cumulative value, or null before the series starts. */
  value: number | null;
  /** The raw point when this date is one of the series' own observations. */
  obs: StrategyCurvePoint | null;
}

/** 5-ish round tick values covering [min, max], always including zero. */
function niceScale(min: number, max: number, count = 5) {
  const lo0 = Math.min(0, min);
  const hi0 = Math.max(0, max);
  const span = hi0 - lo0 || Math.abs(hi0) || 1;
  const raw = span / (count - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(lo0 / step) * step;
  const hi = Math.ceil(hi0 / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 0.5; v += step) {
    ticks.push(Math.abs(v) < step * 1e-6 ? 0 : Number(v.toPrecision(12)));
  }
  return { min: lo, max: hi === lo ? lo + step : hi, ticks };
}

export default function StrategyCurveChart({
  series,
  currency,
  ariaLabel,
}: {
  /** Already filtered to the visible set — hidden lines never reach here. */
  series: CurveSeries[];
  currency: "KRW" | "USD";
  ariaLabel: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(DEFAULT_W);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [pointerY, setPointerY] = useState<number | null>(null);

  // Match the viewBox width to the real container width so 1 user unit ≈ 1
  // CSS px — otherwise a fixed viewBox scaled to a phone shrinks the (fixed
  // user-unit) label text right along with it. Layout effect, not a plain
  // effect, so the first painted frame already uses the real width.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setW(Math.max(MIN_W, Math.round(w)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Shared x axis: the union of every visible series' dates. Strategies only
  // emit a point on a day they closed a round trip, so the date sets barely
  // overlap — without the union (and the carry-forward below) two lines would
  // be drawn against different x scales and could not be compared at all.
  const dates = useMemo(
    () => Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.date)))).sort(),
    [series]
  );
  const n = dates.length;

  const samples: Sample[][] = useMemo(
    () =>
      series.map((s) => {
        const byDate = new Map(s.points.map((p) => [p.date, p]));
        let carried: number | null = null;
        return dates.map((d) => {
          const obs = byDate.get(d) ?? null;
          if (obs) carried = obs.cum_net;
          return { value: carried, obs };
        });
      }),
    [series, dates]
  );

  const scale = useMemo(() => {
    const values = samples.flat().map((s) => s.value).filter((v): v is number => v !== null);
    if (values.length === 0) return niceScale(0, 0);
    return niceScale(Math.min(...values), Math.max(...values));
  }, [samples]);

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const xAt = (i: number) => PAD_L + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v: number) =>
    PAD_T + ((scale.max - v) / (scale.max - scale.min || 1)) * innerH;

  // Step-after: a cumulative total is only known on the days it was observed,
  // so it holds flat until the next observation rather than sloping between
  // two readings that never happened.
  const paths = useMemo(
    () =>
      samples.map((row) => {
        let d = "";
        let prevY: number | null = null;
        row.forEach((s, i) => {
          if (s.value === null) return;
          const y = yAt(s.value);
          if (prevY === null) d += `M ${xAt(i).toFixed(1)} ${y.toFixed(1)}`;
          else d += ` L ${xAt(i).toFixed(1)} ${prevY.toFixed(1)} L ${xAt(i).toFixed(1)} ${y.toFixed(1)}`;
          prevY = y;
        });
        return d;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [samples, scale, W]
  );

  const svgRef = useRef<SVGSVGElement>(null);

  // No plotter draw-in here, unlike section 01. stroke-dasharray is load-bearing
  // on this chart — it is half of each series' identity (hue + pattern), and the
  // .draw-line technique works by overwriting stroke-dasharray with the path
  // length, which would erase the dashed/dotted arms permanently. The lines fade
  // in together instead (.series-in, off under prefers-reduced-motion), and the
  // fade runs once per mount rather than replaying on every legend toggle.
  const animatedRef = useRef(false);
  const [enterAnim, setEnterAnim] = useState(true);
  useLayoutEffect(() => {
    if (animatedRef.current) {
      setEnterAnim(false);
      return;
    }
    animatedRef.current = true;
  }, [paths]);

  function moveTo(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const vbX = ((clientX - rect.left) / rect.width) * W;
    const vbY = ((clientY - rect.top) / rect.height) * H;
    const idx = Math.round(((vbX - PAD_L) / innerW) * (n - 1));
    setActiveIdx(Math.min(n - 1, Math.max(0, idx)));
    setPointerY(vbY);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (n === 0) return;
    const step = (delta: number) => {
      e.preventDefault();
      setPointerY(null);
      setActiveIdx((cur) => {
        const base = cur === null ? (delta > 0 ? -1 : n) : cur;
        return Math.min(n - 1, Math.max(0, base + delta));
      });
    };
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Home") {
      e.preventDefault();
      setActiveIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIdx(n - 1);
    } else if (e.key === "Escape") {
      setActiveIdx(null);
      setPointerY(null);
    }
  }

  // Rows shown in the tooltip: every visible series that has started by this
  // date, so the reader never has to land the pointer on a line to get a value.
  const readout = useMemo(() => {
    if (activeIdx === null) return [];
    return series
      .map((s, si) => ({ s, si, sample: samples[si][activeIdx] }))
      .filter((r) => r.sample.value !== null)
      .sort((a, b) => (b.sample.value ?? 0) - (a.sample.value ?? 0));
  }, [activeIdx, samples, series]);

  // Which line the pointer is nearest, for the highlight. Null on keyboard
  // (there is no pointer position) and when nothing is close enough, in which
  // case every line stays at full strength.
  const highlightIdx = useMemo(() => {
    if (activeIdx === null || pointerY === null) return null;
    let best: number | null = null;
    let bestD = HIGHLIGHT_RADIUS;
    readout.forEach((r) => {
      const d = Math.abs(yAt(r.sample.value as number) - pointerY);
      if (d < bestD) {
        bestD = d;
        best = r.si;
      }
    });
    return best;
    // yAt is derived from `scale` and `W`, both of which are already deps —
    // listing the closure itself would re-run this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, pointerY, readout, scale, W]);

  // X labels spaced by available pixels, not point count, so a narrow screen
  // drops labels automatically. English ("Aug 11") runs wider than Korean
  // ("8/11"), so the budget is locale-aware.
  const shownXLabels = useMemo(() => {
    const per = locale === "ko" ? 34 : 52;
    const maxLabels = Math.max(2, Math.floor(innerW / per));
    const every = n <= maxLabels ? 1 : Math.max(1, Math.ceil((n - 1) / (maxLabels - 1)));
    const idx: number[] = [];
    for (let i = 0; i < n; i += every) idx.push(i);
    // The last date is always labeled, which can land it within a label-width
    // of the previous regularly-spaced one ("Sep 2" printing over "Sep 3").
    // Measure that gap in pixels rather than in indices — the index spacing
    // says nothing about how wide the rendered text is.
    const last = n - 1;
    const prev = idx[idx.length - 1];
    if (prev !== last) {
      const gapPx = ((last - (prev ?? 0)) / Math.max(1, n - 1)) * innerW;
      if (prev !== undefined && gapPx < per) idx.pop();
      idx.push(last);
    }
    return new Set(idx);
  }, [n, innerW, locale]);

  if (n === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--muted-2)]"
        style={{ height: H }}
      >
        {t.curves.emptyMarket}
      </div>
    );
  }

  const tooltipOnLeft = activeIdx !== null && xAt(activeIdx) > W * 0.55;

  return (
    <div className="scroll-x">
      <div
        ref={containerRef}
        tabIndex={0}
        role="group"
        aria-label={t.curves.chartKeyboardHint}
        onKeyDown={onKeyDown}
        onBlur={() => {
          setActiveIdx(null);
          setPointerY(null);
        }}
        className="relative min-w-0 select-none"
        style={{ height: H, minWidth: MIN_W }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full touch-pan-y"
          role="img"
          aria-label={ariaLabel}
          onPointerMove={(e) => moveTo(e.clientX, e.clientY)}
          onPointerDown={(e) => moveTo(e.clientX, e.clientY)}
          onPointerLeave={() => {
            setActiveIdx(null);
            setPointerY(null);
          }}
        >
          {/* y grid — the zero rule is the emphasized one, because on a net
              P&L chart the only line that means anything on its own is break-even */}
          {scale.ticks.map((v) => {
            const isZero = v === 0;
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
                  x={PAD_L - 6}
                  y={yAt(v)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="tnum"
                  fontSize={9.5}
                  fontWeight={isZero ? 600 : 400}
                  fill={isZero ? "var(--foreground)" : "var(--muted-2)"}
                >
                  {isZero ? t.curves.breakEven : formatMoneyCompact(v, currency)}
                </text>
              </g>
            );
          })}

          {/* x labels — last one right-anchored so it can't clip off the edge */}
          {dates.map((d, i) =>
            shownXLabels.has(i) ? (
              <text
                key={d}
                x={xAt(i)}
                y={H - PAD_B + 15}
                textAnchor={i === n - 1 ? "end" : i === 0 ? "start" : "middle"}
                className="tnum"
                fontSize={9.5}
                fill="var(--muted-2)"
              >
                {formatDateLocale(d, locale)}
              </text>
            ) : null
          )}

          {activeIdx !== null && (
            <line
              x1={xAt(activeIdx)}
              x2={xAt(activeIdx)}
              y1={PAD_T}
              y2={H - PAD_B}
              stroke="var(--foreground)"
              strokeOpacity={0.3}
              strokeWidth={1}
              strokeDasharray="3 3"
              pointerEvents="none"
            />
          )}

          {series.map((s, si) => {
            const faded = highlightIdx !== null && highlightIdx !== si;
            const hot = highlightIdx === si;
            // A strategy with a single closed-trip day has no segment to
            // stroke — it gets a dot, so a one-point line is still on the chart
            // instead of silently missing from it.
            const only = s.points.length === 1 ? samples[si].findIndex((x) => x.obs) : -1;
            return (
              <g
                key={s.id}
                opacity={faded ? 0.35 : 1}
                pointerEvents="none"
                className={enterAnim ? "series-in" : undefined}
              >
                <path
                  d={paths[si]}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hot ? 2.75 : 2}
                  strokeDasharray={s.dash || undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {only >= 0 && (
                  <circle cx={xAt(only)} cy={yAt(samples[si][only].value as number)} r={3.5} fill={s.color} />
                )}
                {activeIdx !== null && samples[si][activeIdx].value !== null && (
                  <circle
                    cx={xAt(activeIdx)}
                    cy={yAt(samples[si][activeIdx].value as number)}
                    r={hot ? 4.5 : 3}
                    fill={s.color}
                    stroke="var(--surface)"
                    strokeWidth={1.25}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {activeIdx !== null && readout.length > 0 && (
          <div
            className="pointer-events-none absolute top-1.5 z-10 max-h-[calc(100%-0.75rem)] max-w-[calc(100%-1rem)] overflow-hidden border border-[var(--control)] bg-[var(--surface)] px-2.5 py-2 text-[11px]"
            style={{
              boxShadow: "0 6px 22px rgba(0,0,0,0.22)",
              ...(tooltipOnLeft ? { left: "0.5rem" } : { right: "0.5rem" }),
            }}
            aria-hidden
          >
            <div className="tnum mb-1 font-medium">{dates[activeIdx]}</div>
            <table className="w-full border-collapse">
              <tbody>
                {readout.map(({ s, si, sample }) => (
                  <tr key={s.id} className={highlightIdx !== null && highlightIdx !== si ? "opacity-50" : ""}>
                    <td className="py-px pr-1.5 align-middle">
                      <svg width="14" height="8" aria-hidden className="block">
                        <line
                          x1="0"
                          x2="14"
                          y1="4"
                          y2="4"
                          stroke={s.color}
                          strokeWidth="2.5"
                          strokeDasharray={s.dash || undefined}
                        />
                      </svg>
                    </td>
                    <td className="max-w-[9rem] truncate py-px pr-2.5 text-[var(--muted)]">{s.name}</td>
                    <td
                      className={`tnum py-px text-right font-medium ${
                        (sample.value as number) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
                      }`}
                    >
                      {formatMoneySigned(sample.value as number, currency, locale)}
                    </td>
                    <td className="tnum py-px pl-2 text-right text-[10px] text-[var(--muted-2)]">
                      {sample.obs && sample.obs.day_net !== 0
                        ? formatMoneySigned(sample.obs.day_net, currency, locale)
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-1 text-[9.5px] text-[var(--muted-2)]">{t.curves.tooltipDayHint}</div>
          </div>
        )}

        {/* Keyboard readout. The tooltip above is aria-hidden because it
            updates on every pointermove; this region only changes when the
            crosshair is actually moved with the arrow keys, so it announces
            once per step instead of continuously. */}
        <div className="sr-only" aria-live="polite">
          {activeIdx !== null
            ? t.curves.readoutAria(
                dates[activeIdx],
                readout.map(
                  (r) => `${r.s.name} ${formatMoneySigned(r.sample.value as number, currency, locale)}`
                )
              )
            : ""}
        </div>
      </div>
    </div>
  );
}
