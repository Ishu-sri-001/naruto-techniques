import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import TrainingSteps from "@/components/sections/TrainingSteps";
import Techniques from "@/components/sections/Techniques";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col bg-ink text-cream">
      <Header />
      <Hero />
      <About />
      <TrainingSteps />
      <Techniques />
      <Footer />
    </div>
  );
}
