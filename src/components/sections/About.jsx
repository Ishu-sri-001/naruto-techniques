import JutsuSealRing from "@/components/JutsuSealRing";
import ScrollSpin from "@/components/animations/ScrollSpin";

export default function About() {
  return (
    <section
      id="about"
      className="relative z-10 overflow-hidden bg-ink px-20 py-32 max-md:px-12 max-md:py-24 max-sm:px-6 max-sm:py-16"
    >
      <div className="grid grid-cols-[1fr_1.2fr] items-center gap-16 max-md:grid-cols-1 max-md:gap-12">
        <ScrollSpin className="flex justify-center max-md:order-2">
          <JutsuSealRing className="aspect-square w-[30vw] max-md:w-[52vw] max-sm:w-[76vw]" />
        </ScrollSpin>

        <div>
          <h2 className="ink h2 tracking-tight text-cream">
            <span className="block">Form the seal.</span>
            <span className="block">The camera reads it.</span>
            <span className="block text-chakra">The jutsu happens.</span>
          </h2>
          <p className="lines-up p-lg mt-8 max-w-[42ch] text-muted">
            Hold the hand sign in front of your camera and its technique plays out live over
            your own feed. Hand tracking runs on-device, so nothing is uploaded anywhere.
          </p>
        </div>
      </div>
    </section>
  );
}
