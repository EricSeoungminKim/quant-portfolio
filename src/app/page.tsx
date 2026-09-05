import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import EpochNote from "@/components/EpochNote";
import ResearchLog from "@/components/ResearchLog";
import EquitySection from "@/components/EquitySection";
import StrategyCurves from "@/components/StrategyCurves";
import StrategyTable from "@/components/StrategyTable";
import CostTruth from "@/components/CostTruth";
import HowItWorks from "@/components/HowItWorks";
import Methodology from "@/components/Methodology";
import Safety from "@/components/Safety";
import EditorsNote from "@/components/EditorsNote";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import { performance } from "@/lib/data";
import { buildSections } from "@/lib/sections";
import {
  EPOCH_CURVES_NOTE_EN,
  EPOCH_CURVES_NOTE_KO,
  hasPaperEpoch,
  withEpochCurves,
} from "@/lib/paperEpoch";

// Reading order is the argument: the record first, then the per-strategy
// curves that decompose it, then the per-strategy statistics, then the cost
// that explains the sign of that evidence, then the mechanism, method and
// safeguards. "Why publish this" comes last, once a reader has seen what is
// being published.
export default function Home() {
  // 2026-09-06 paper_epoch: swap in each strategy's since-epoch curve where
  // one exists (`withEpochCurves` falls back to the existing lifetime curve
  // per strategy, not all-or-nothing) — everything downstream (the "has any
  // curves at all" check, the chart itself) reads this instead of the raw
  // `performance.strategies` curves.
  const curveStrategies = withEpochCurves(performance.strategies, performance);
  const paperEpochActive = hasPaperEpoch(performance) && performance.paper_epoch.strategies.length > 0;

  // The per-strategy curves section only exists when the snapshot carries
  // curves; the rail numbering closes up behind it when it does not, which is
  // why the sequence is built here once and handed down rather than typed
  // into each section.
  const hasCurves = curveStrategies.some(
    (s) => (s.curve?.asia?.length ?? 0) + (s.curve?.us?.length ?? 0) > 0
  );
  const sections = buildSections(hasCurves);
  const idx = Object.fromEntries(sections.map((s) => [s.id, s.index])) as Record<string, string>;

  return (
    <>
      <RevealOnScroll />
      <Nav sections={sections} />
      <main className="flex-1">
        <Hero data={performance} />
        <EpochNote data={performance} />
        <ResearchLog data={performance} />
        <EquitySection data={performance} index={idx.equity} />
        {hasCurves && (
          <StrategyCurves
            strategies={curveStrategies}
            note={paperEpochActive ? EPOCH_CURVES_NOTE_KO : performance.strategy_curves_note}
            noteEn={paperEpochActive ? EPOCH_CURVES_NOTE_EN : performance.strategy_curves_note_en}
            index={idx["strategy-curves"]}
          />
        )}
        <StrategyTable
          strategies={performance.strategies}
          note={performance.strategies_note}
          noteEn={performance.strategies_note_en}
          index={idx.strategies}
          paperEpoch={hasPaperEpoch(performance) ? performance.paper_epoch : null}
        />
        <CostTruth costs={performance.costs} index={idx.cost} />
        <HowItWorks index={idx.how} />
        <Methodology index={idx.methodology} data={performance} />
        <Safety index={idx.safety} />
        <EditorsNote />
      </main>
      <Footer
        generatedAt={performance.generated_at}
        disclaimer={performance.disclaimer}
        disclaimerEn={performance.disclaimer_en}
      />
    </>
  );
}
