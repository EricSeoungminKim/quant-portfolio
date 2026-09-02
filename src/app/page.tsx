import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import EquitySection from "@/components/EquitySection";
import StrategyTable from "@/components/StrategyTable";
import HowItWorks from "@/components/HowItWorks";
import CostTruth from "@/components/CostTruth";
import Safety from "@/components/Safety";
import Footer from "@/components/Footer";
import { performance } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero data={performance} />
        <EquitySection data={performance} />
        <StrategyTable strategies={performance.strategies} />
        <HowItWorks />
        <CostTruth costs={performance.costs} />
        <Safety />
      </main>
      <Footer
        generatedAt={performance.generated_at}
        disclaimer={performance.disclaimer}
        disclaimerEn={performance.disclaimer_en}
      />
    </>
  );
}
