import SageReveal from "@/components/animations/SageReveal";
import ParallaxExit from "@/components/animations/ParallaxExit";
import PlaqueButton from "@/components/ui/PlaqueButton";

export default function Hero() {
  return (
    <section className="relative isolate h-svh overflow-hidden bg-ink max-md:h-auto">
      <ParallaxExit className="h-full max-md:flex max-md:flex-col">
      <div className="absolute inset-0 -z-10 max-md:relative max-md:inset-auto max-md:h-[72svh] max-md:w-full">
        <SageReveal
          base="/images/naruto/naruto-base.webp"
          reveal="/images/naruto/naruto-sage.webp"
          alt="Naruto Uzumaki, staring straight at the viewer"
          className="h-full w-full"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-linear-to-b from-ink/50 to-transparent max-md:h-[22%] max-md:from-ink/85"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-linear-to-t from-ink/70 to-transparent max-md:h-[40%] max-md:from-ink"
        />
      </div>

      <div className="flex h-full flex-col justify-end px-20 pb-[8vh] max-md:relative max-md:-mt-[20svh] max-md:h-auto max-md:px-12 max-md:pb-20 max-sm:-mt-[16svh] max-sm:px-6 max-sm:pb-16">
        <h1 className="ink h1 flex items-baseline justify-between uppercase tracking-tight max-md:justify-start max-md:gap-[3vw] max-sm:flex-col max-sm:gap-0">
          <span className="text-chakra">Chakra</span>{" "}
          <span className="text-cream">Cam</span>
        </h1>

        <div className="mt-8 flex items-end justify-between gap-12 max-md:flex-col max-md:items-start max-md:gap-10">
          <div className="w-[32%] max-md:w-[70%] max-sm:w-full">
            <p className="lines-up p-lg text-cream/75">
              A webcam jutsu trainer. Form real hand signs and Rasengan or Shadow Clones
              answer live, tracked entirely on your device.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-8 max-sm:gap-6">
              <PlaqueButton href="/train">Start Training</PlaqueButton>
              <a
                href="#about"
                className="group inline-flex items-center gap-2 p-md text-cream/80 outline-none transition hover:text-cream focus-visible:ring-2 focus-visible:ring-chakra focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                <span
                  aria-hidden="true"
                  className="p-sm text-chakra transition-transform group-hover:translate-x-0.5"
                >
                  ▶
                </span>
                How it works
              </a>
            </div>
          </div>

          <p className="p-sm flex items-center gap-3 font-mono uppercase tracking-[0.2em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-hanko" aria-hidden="true" />
            <span className="pointer-coarse:hidden">Move across Naruto to enter Sage Mode</span>
            <span className="hidden pointer-coarse:inline">Drag across Naruto to enter Sage Mode</span>
          </p>
        </div>
      </div>
      </ParallaxExit>
    </section>
  );
}
