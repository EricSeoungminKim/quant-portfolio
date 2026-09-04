import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ResearchLog from "@/components/ResearchLog";
import EquitySection from "@/components/EquitySection";
import StrategyTable from "@/components/StrategyTable";
import CostTruth from "@/components/CostTruth";
import HowItWorks from "@/components/HowItWorks";
import Methodology from "@/components/Methodology";
import Safety from "@/components/Safety";
import EditorsNote from "@/components/EditorsNote";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import { performance } from "@/lib/data";

// Reading order is the argument: the record first, then the per-strategy
// evidence, then the cost that explains the sign of that evidence, then the
// mechanism, method and safeguards. "Why publish this" comes last, once a
// reader has seen what is being published.
export default function Home() {
  return (
    <>
      <RevealOnScroll />
      <Nav />
      <main className="flex-1">
        <Hero data={performance} />
        <ResearchLog data={performance} />
        <EquitySection data={performance} />
        <StrategyTable
          strategies={performance.strategies}
          note={performance.strategies_note}
          noteEn={performance.strategies_note_en}
        />
        <CostTruth costs={performance.costs} />
        <HowItWorks />
        <Methodology />
        <Safety />
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
