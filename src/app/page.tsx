import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
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

// Reading order is the argument: the record first, then the per-strategy
// curves that decompose it, then the per-strategy statistics, then the cost
// that explains the sign of that evidence, then the mechanism, method and
// safeguards. "Why publish this" comes last, once a reader has seen what is
// being published.
export default function Home() {
  // The per-strategy curves section only exists when the snapshot carries
  // curves; the rail numbering closes up behind it when it does not, which is
  // why the sequence is built here once and handed down rather than typed
  // into each section.
  const hasCurves = performance.strategies.some(
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
        <ResearchLog data={performance} />
        <EquitySection data={performance} index={idx.equity} />
        {hasCurves && (
          <StrategyCurves
            strategies={performance.strategies}
            note={performance.strategy_curves_note}
            noteEn={performance.strategy_curves_note_en}
            index={idx["strategy-curves"]}
          />
        )}
        <StrategyTable
          strategies={performance.strategies}
          note={performance.strategies_note}
          noteEn={performance.strategies_note_en}
          index={idx.strategies}
        />
        <CostTruth costs={performance.costs} index={idx.cost} />
        <HowItWorks index={idx.how} />
        <Methodology index={idx.methodology} />
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
