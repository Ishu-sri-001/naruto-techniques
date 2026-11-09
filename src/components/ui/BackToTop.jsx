"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { fireBurst } from "@/lib/fire-burst";
import KonohaMark from "@/components/ui/KonohaMark";

// Pause between the burst and the climb, so the fire lands before the page moves.
const LAUNCH_DELAY = 0.35;

/*
 * Ember-lit Konoha seal. On click it erupts in a Katon burst (lib/fire-burst)
 * and a GSAP tween carries the page to the top, handing each frame to Lenis
 * so the two never fight. Wheel or touch during the climb hands control back.
 */
export default function BackToTop({ className = "" }) {
  const lenis = useLenis();
  const sealRef = useRef(null);
  const stopRef = useRef(null);

  useEffect(() => () => stopRef.current?.(), []);

  const scrollTo = (y) =>
    lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);

  const launch = () => {
    if (stopRef.current) return;
    if (prefersReducedMotion()) {
      scrollTo(0);
      return;
    }

    const seal = sealRef.current;
    const box = seal.getBoundingClientRect();
    const from = window.scrollY;
    const duration = gsap.utils.clamp(1.4, 2.6, from / 4000);

    const fx = fireBurst({
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
      size: box.width,
      rise: duration,
    });

    const kick = gsap
      .timeline()
      .to(seal, { scale: 0.86, duration: 0.12, ease: "power2.in" })
      .to(seal, { scale: 1, duration: 0.9, ease: "elastic.out(1.1, 0.4)" });

    const proxy = { y: from };
    const climb = gsap.to(proxy, {
      y: 0,
      duration,
      delay: LAUNCH_DELAY,
      ease: "power3.inOut",
      onUpdate: () => scrollTo(proxy.y),
      onComplete: () => {
        release();
        // Keyboard users land at the top of the page, not on a button now off screen.
        document.querySelector("header a")?.focus({ preventScroll: true });
      },
    });

    const takeOver = () => {
      climb.kill();
      release();
    };
    function release() {
      window.removeEventListener("wheel", takeOver);
      window.removeEventListener("touchstart", takeOver);
      stopRef.current = null;
    }
    window.addEventListener("wheel", takeOver, { passive: true });
    window.addEventListener("touchstart", takeOver, { passive: true });

    stopRef.current = () => {
      climb.kill();
      kick.kill();
      fx.kill();
      release();
    };
  };

  return (
    <button
      type="button"
      onClick={launch}
      className={`group relative flex flex-col items-center gap-[1vw] outline-none max-md:gap-3 ${className}`}
    >
      <span
        ref={sealRef}
        className="relative grid aspect-square w-[6vw] place-items-center rounded-full group-focus-visible:ring-2 group-focus-visible:ring-ember max-md:w-[11vw] max-sm:w-[18vw]"
      >
        <span aria-hidden="true" className="ember-pulse absolute inset-0 rounded-full bg-dusk" />
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="fire-ring absolute inset-[-16%] text-ember"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="22 7 4 9 34 6 2 10 16 8"
          />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="fire-ring-rev absolute inset-[-4%] text-hanko"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="1 6"
          />
        </svg>
        <KonohaMark
          strokeWidth={6}
          className="ember-glow relative w-[56%] text-ember transition-[rotate] duration-1000 ease-out group-hover:rotate-[360deg]"
        />
      </span>
      <span className="p-md text-hanko-soft transition-colors duration-300 group-hover:text-ember">
        Back to top <span aria-hidden="true">↑</span>
      </span>
    </button>
  );
}
