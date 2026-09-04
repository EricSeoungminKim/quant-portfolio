"use client";

import { useT, type PlaneCopy, type TimelineEntry } from "@/lib/i18n";
import SectionHeading from "./SectionHeading";

export default function HowItWorks() {
  const t = useT();

  return (
    <section id="how" className="band">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHeading
        index="04"
        eyebrow={t.how.eyebrow}
        title={t.how.title}
        description={t.how.description}
      />

      {/* --- The four planes ------------------------------------------------ */}
      <Block title={t.how.planesTitle} note={t.how.planesNote}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-reveal>
          {t.how.planes.map((p) => (
            <PlaneCard key={p.id} plane={p} />
          ))}
        </div>

        <figure className="mt-8" data-reveal>
          <div className="scroll-x plate p-4 sm:p-6">
            <PlaneDiagram />
          </div>
          <figcaption className="mt-3 max-w-2xl text-xs leading-relaxed text-[var(--muted-2)]">
            <span className="mono-label mr-2 text-[10px] text-[var(--accent)]">
              {t.how.diagramTitle}
            </span>
            {t.how.diagramCaption}
          </figcaption>
        </figure>
      </Block>

      {/* --- The day -------------------------------------------------------- */}
      <Block title={t.how.timelineTitle} note={t.how.timelineNote}>
        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[var(--muted-2)]">
          <LegendDot tone="kr" label={t.how.legendKr} />
          <LegendDot tone="us" label={t.how.legendUs} />
          <LegendDot tone="all" label={t.how.legendAll} />
        </div>

        <ol className="border-t border-[var(--border)]">
          {t.how.timeline.map((entry) => (
            <TimelineRow key={`${entry.time}-${entry.label}`} entry={entry} />
          ))}
        </ol>

        <div className="mt-8 plate p-5 sm:p-6">
          <h4 className="mono-label text-[10px] text-[var(--accent)]">{t.how.railsTitle}</h4>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.how.rails.map((r) => (
              <div key={r.label}>
                <dt className="text-[13px] font-medium">{r.label}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{r.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Block>

      {/* --- Inputs --------------------------------------------------------- */}
      <Block title={t.how.sourcesTitle} note={t.how.sourcesNote}>
        <ul className="grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3" data-reveal>
          {t.how.sources.map((s) => (
            <li key={s.name} className="bg-[var(--surface)] p-4">
              <p className="text-[13px] font-medium">{s.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{s.detail}</p>
            </li>
          ))}
        </ul>
      </Block>

      {/* --- Research pipeline ---------------------------------------------- */}
      <Block title={t.how.pipelineTitle} note={t.how.pipelineNote}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12">
          <figure className="order-2 lg:order-1">
            <PromotionFunnel />
            <figcaption className="mt-3 text-xs leading-relaxed text-[var(--muted-2)]">
              {t.how.pipelineCaption}
            </figcaption>
          </figure>

          <ol className="order-1 border-t border-[var(--border)] lg:order-2">
            {t.how.pipeline.map((p) => (
              <li
                key={p.step}
                className="flex gap-4 border-b border-[var(--border)] py-3.5 sm:gap-5"
              >
                <span className="tnum shrink-0 pt-0.5 text-[11px] text-[var(--accent)]">
                  {p.step}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{p.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Block>

      {/* --- Boundaries ------------------------------------------------------ */}
      <div className="mt-16 grid gap-3 lg:grid-cols-3" data-reveal>
        <Callout title={t.how.abTitle} body={t.how.abBody} />
        <Callout title={t.how.notAutomatedTitle} body={t.how.notAutomatedBody} accent />
        <div className="plate p-5">
          <h4 className="mono-label text-[10px] text-[var(--accent)]">{t.how.aiTitle}</h4>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-[13px] font-medium">{t.how.aiPresent}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                {t.how.aiPresentDesc}
              </p>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-[13px] font-medium">{t.how.aiAbsent}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                {t.how.aiAbsentDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-14 md:mt-16">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="h-px flex-1 bg-[var(--hairline)]" aria-hidden />
      </div>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">{note}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Callout({ title, body, accent }: { title: string; body: string; accent?: boolean }) {
  return (
    <div className={`plate p-5 ${accent ? "border-[var(--accent)]" : ""}`}>
      <h4 className="mono-label text-[10px] text-[var(--accent)]">{title}</h4>
      <p className="mt-3.5 text-xs leading-[1.75] text-[var(--muted)]">{body}</p>
    </div>
  );
}

function PlaneCard({ plane }: { plane: PlaneCopy }) {
  const t = useT();
  const isTrade = plane.id === "trade";
  return (
    <div
      className={`plate flex flex-col p-4 ${isTrade ? "border-[var(--down)] bg-[var(--down-bg)]" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{plane.name}</span>
        <span className="mono-label text-[9px] text-[var(--muted-2)]">{plane.id}</span>
      </div>
      <p
        className={`mt-2 text-xs font-medium ${
          isTrade ? "text-[var(--down)]" : "text-[var(--muted-2)]"
        }`}
      >
        {t.how.whenWrong} {plane.risk}
      </p>
      <dl className="mt-3.5 space-y-2.5 border-t border-[var(--border)] pt-3.5">
        <div>
          <dt className="mono-label text-[9px] text-[var(--muted-2)]">{t.how.mayLabel}</dt>
          <dd className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{plane.may}</dd>
        </div>
        <div>
          <dt className="mono-label text-[9px] text-[var(--muted-2)]">{t.how.mayNotLabel}</dt>
          <dd className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{plane.mayNot}</dd>
        </div>
      </dl>
    </div>
  );
}

function LegendDot({ tone, label }: { tone: "kr" | "us" | "all"; label: string }) {
  const bg =
    tone === "kr" ? "var(--up)" : tone === "us" ? "var(--down)" : "var(--muted-2)";
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2 w-2" style={{ background: bg }} aria-hidden />
      {label}
    </span>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const tone =
    entry.market === "KR"
      ? "var(--up)"
      : entry.market === "US"
        ? "var(--down)"
        : "var(--muted-2)";
  return (
    <li className="flex gap-3 border-b border-[var(--border)] py-3.5 sm:gap-5">
      <div className="flex w-14 shrink-0 items-start gap-2 sm:w-20">
        <span className="mt-1.5 inline-block h-2 w-2 shrink-0" style={{ background: tone }} aria-hidden />
        <span className="tnum text-[12px] font-medium">{entry.time}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{entry.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{entry.detail}</p>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------------------
   Diagrams — inline SVG, no chart library, themed entirely through CSS
   variables so both palettes are handled by one drawing.
--------------------------------------------------------------------------- */

function PlaneDiagram() {
  const t = useT();
  const [collect, analyze, trade, control] = t.how.planes;
  const BOX_W = 126;
  const BOX_H = 58;
  const TOP = 70;
  const xs = [16, 202, 388, 574];
  const boxes = [
    { x: xs[0], label: collect.name },
    { x: xs[1], label: analyze.name },
    { x: xs[2], label: trade.name },
    { x: xs[3], label: control.name },
  ];
  const mid = (i: number) => xs[i] + BOX_W / 2;
  const cy = TOP + BOX_H / 2;

  return (
    <svg
      viewBox="0 0 716 220"
      className="block h-auto w-full min-w-[640px]"
      role="img"
      aria-label={`${t.how.diagramTitle}: ${t.how.diagramCaption}`}
    >
      {boxes.map((b, i) => {
        const isTrade = i === 2;
        return (
          <g key={b.label}>
            <rect
              x={b.x}
              y={TOP}
              width={BOX_W}
              height={BOX_H}
              fill={isTrade ? "var(--down-bg)" : "var(--surface-2)"}
              stroke={isTrade ? "var(--down)" : "var(--border)"}
              strokeWidth={isTrade ? 1.5 : 1}
            />
            <text
              x={b.x + BOX_W / 2}
              y={cy + 5}
              textAnchor="middle"
              fontSize={15}
              fontWeight={600}
              fill="var(--foreground)"
            >
              {b.label}
            </text>
          </g>
        );
      })}

      {/* collect → analyze: ordinary forward dependency */}
      <Arrow x1={xs[0] + BOX_W + 6} x2={xs[1] - 6} y={cy} />

      {/* analyze → trade: a list of names crosses here, never an order */}
      <Arrow x1={xs[1] + BOX_W + 6} x2={xs[2] - 6} y={cy} dashed />
      <text
        x={(xs[1] + BOX_W + xs[2]) / 2}
        y={TOP + BOX_H + 22}
        textAnchor="middle"
        fontSize={12}
        fill="var(--accent)"
      >
        {t.how.diagramNewsEdge}
      </text>

      {/* trade → control: the ledger flows forward */}
      <Arrow x1={xs[2] + BOX_W + 6} x2={xs[3] - 6} y={cy} />

      {/* control → trade, the long way round: written to a settings file and
          picked up on the engine's next reload, never a direct import */}
      <path
        d={`M ${mid(3)} ${TOP + BOX_H} L ${mid(3)} 176 L ${mid(2)} 176 L ${mid(2)} ${TOP + BOX_H + 8}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <path
        d={`M ${mid(2)} ${TOP + BOX_H + 2} l -5 9 l 10 0 z`}
        fill="var(--accent)"
      />
      <text
        x={(mid(2) + mid(3)) / 2}
        y={194}
        textAnchor="middle"
        fontSize={12}
        fill="var(--accent)"
      >
        {t.how.diagramSettingsEdge}
      </text>

      {/* the edge that does not exist: collect and analyze may never import
          the trade plane. Marked, labelled, and enforced by a test. */}
      <path
        d={`M ${mid(0)} ${TOP} L ${mid(0)} 40 L ${mid(2)} 40 L ${mid(2)} ${TOP - 4}`}
        fill="none"
        stroke="var(--muted-2)"
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={0.6}
      />
      <g transform={`translate(${(mid(0) + mid(2)) / 2} 40)`}>
        <circle r={11} fill="var(--background)" stroke="var(--up)" strokeWidth={1.2} />
        <line x1={-4.5} y1={-4.5} x2={4.5} y2={4.5} stroke="var(--up)" strokeWidth={1.8} />
        <line x1={4.5} y1={-4.5} x2={-4.5} y2={4.5} stroke="var(--up)" strokeWidth={1.8} />
      </g>
      {/* Painted with a surface-coloured halo so the label stays legible
          where it crosses the dashed edge it is annotating. */}
      <text
        x={(mid(0) + mid(2)) / 2 + 18}
        y={44}
        fontSize={12}
        fill="var(--up)"
        stroke="var(--surface)"
        strokeWidth={4}
        paintOrder="stroke"
      >
        {t.how.diagramNoImport}
      </text>
    </svg>
  );
}

function Arrow({ x1, x2, y, dashed }: { x1: number; x2: number; y: number; dashed?: boolean }) {
  const stroke = dashed ? "var(--accent)" : "var(--muted-2)";
  return (
    <g>
      <line
        x1={x1}
        x2={x2 - 6}
        y1={y}
        y2={y}
        stroke={stroke}
        strokeWidth={1}
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      <path d={`M ${x2} ${y} l -8 -4.5 l 0 9 z`} fill={stroke} />
    </g>
  );
}

function PromotionFunnel() {
  const t = useT();
  const steps = t.how.pipeline;
  const n = steps.length;
  const bandH = 34;
  const gap = 5;
  const top = 8;
  const maxW = 300;
  const minW = 84;
  const height = top + n * bandH + (n - 1) * gap + 8;

  return (
    <svg
      viewBox={`0 0 320 ${height}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`${t.how.pipelineTitle}: ${steps.map((s) => `${s.step} ${s.label}`).join(", ")}. ${t.how.pipelineCaption}`}
    >
      {steps.map((s, i) => {
        const wTop = maxW - ((maxW - minW) * i) / n;
        const wBottom = maxW - ((maxW - minW) * (i + 1)) / n;
        const y = top + i * (bandH + gap);
        const cx = 160;
        const last = i === n - 1;
        return (
          <g key={s.step}>
            <path
              d={`M ${cx - wTop / 2} ${y} L ${cx + wTop / 2} ${y} L ${cx + wBottom / 2} ${
                y + bandH
              } L ${cx - wBottom / 2} ${y + bandH} Z`}
              fill={last ? "var(--accent-wash)" : "var(--surface-2)"}
              stroke={last ? "var(--accent)" : "var(--border)"}
              strokeWidth={1}
            />
            <text
              x={cx}
              y={y + bandH / 2 + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={500}
              fill={last ? "var(--accent)" : "var(--muted)"}
            >
              {s.step} · {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
