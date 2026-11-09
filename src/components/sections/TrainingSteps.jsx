"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import HandSkeleton from "@/components/ui/HandSkeleton";
import { SEAL_HAND, SEAL_PAIR, pairTransform } from "@/data/hand-poses";

/*
 * "How training works" as a scroll-driven viewfinder. A tall outer container
 * supplies the scroll distance; the inner screen is sticky. One scrubbed
 * timeline (0 → 3) plays the three steps inside a mock camera feed:
 *   0–1  the camera powers on (static clears, brackets snap in, REC lights)
 *   1–2  two tracked hands cross into the Kage Bunshin seal and hold it
 *   2–3  the jutsu releases: chakra flash, clones fan out, the seal is stamped
 * With reduced motion the scene renders in its finished state, no scrolling.
 */

const STEPS = [
  {
    n: "01",
    kanji: "一",
    title: "Allow the camera",
    body: "Open the training grounds and grant camera access. Nothing leaves your device.",
  },
  {
    n: "02",
    kanji: "二",
    title: "Form the seal",
    body: "Match the hand sign shown on screen and hold it for a moment.",
  },
  {
    n: "03",
    kanji: "三",
    title: "Watch it happen",
    body: "The technique's effect plays out live over your own camera feed.",
  },
];

const STATUS = ["Camera ready", "Tracking hands", "Jutsu released"];

const SEAL = SEAL_PAIR.center;
const HAND_FRONT = pairTransform(SEAL_PAIR.front);
const HAND_BACK = pairTransform(SEAL_PAIR.back);

function Hand({ transform }) {
  return <HandSkeleton landmarks={SEAL_HAND} transform={transform} />;
}

function SealPair() {
  return (
    <>
      <Hand transform={HAND_BACK} />
      <Hand transform={HAND_FRONT} />
    </>
  );
}

function Viewfinder() {
  return (
    <div className="relative aspect-[4/3] h-[52svh] max-w-full justify-self-end overflow-hidden border border-rule bg-surface max-md:h-[34svh] max-md:justify-self-center">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="ts-chakra" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "var(--chakra)", stopOpacity: 0.7 }} />
            <stop offset="45%" style={{ stopColor: "var(--chakra)", stopOpacity: 0.25 }} />
            <stop offset="100%" style={{ stopColor: "var(--chakra)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* chakra release flash */}
        <circle data-glow cx={SEAL.x} cy={SEAL.y} r="120" style={{ fill: "url(#ts-chakra)" }} />

        {/* shadow clones, fanned out either side */}
        <g data-clone="l" style={{ opacity: 0.4 }}>
          <g transform={`translate(-118 18) translate(${SEAL.x} ${SEAL.y}) scale(0.78) translate(${-SEAL.x} ${-SEAL.y})`}>
            <SealPair />
          </g>
        </g>
        <g data-clone="r" style={{ opacity: 0.4 }}>
          <g transform={`translate(118 18) translate(${SEAL.x} ${SEAL.y}) scale(0.78) translate(${-SEAL.x} ${-SEAL.y})`}>
            <SealPair />
          </g>
        </g>

        {/* the tracked hands */}
        <g data-approach="back">
          <Hand transform={HAND_BACK} />
        </g>
        <g data-approach="front">
          <Hand transform={HAND_FRONT} />
        </g>

        {/* seal hold ring */}
        <circle
          cx={SEAL.x}
          cy={SEAL.y}
          r="46"
          style={{ fill: "none", stroke: "var(--cream)", strokeOpacity: 0.12, strokeWidth: 2 }}
        />
        <circle
          data-hold-ring
          cx={SEAL.x}
          cy={SEAL.y}
          r="46"
          pathLength="1"
          strokeDasharray="1"
          transform={`rotate(-90 ${SEAL.x} ${SEAL.y})`}
          style={{ fill: "none", stroke: "var(--chakra)", strokeWidth: 2.4, strokeLinecap: "round" }}
        />
      </svg>

      {/* camera static, clears as the feed comes up */}
      <div data-static aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-0" />

      {/* viewfinder brackets */}
      <div data-corner className="absolute left-4 top-4 h-6 w-6 border-l border-t border-cream/60" />
      <div data-corner className="absolute right-4 top-4 h-6 w-6 border-r border-t border-cream/60" />
      <div data-corner className="absolute bottom-4 left-4 h-6 w-6 border-b border-l border-cream/60" />
      <div data-corner className="absolute bottom-4 right-4 h-6 w-6 border-b border-r border-cream/60" />

      {/* HUD */}
      <p className="p-sm absolute left-8 top-7 flex items-center gap-2 font-mono uppercase tracking-[0.2em] text-cream/80 max-sm:tracking-[0.1em]">
        <span data-rec className="h-1.5 w-1.5 rounded-full bg-hanko" aria-hidden="true" />
        Rec
      </p>
      <p className="p-sm absolute right-8 top-7 font-mono uppercase tracking-[0.2em] text-cream/80 max-sm:tracking-[0.1em]">
        Seal hold <span data-hold>100</span>%
      </p>
      <div className="p-sm absolute bottom-7 left-8 grid font-mono uppercase tracking-[0.2em] text-chakra max-sm:tracking-[0.1em]">
        {STATUS.map((s, i) => (
          <span key={s} data-status={i} className={`col-start-1 row-start-1 ${i === 2 ? "" : "opacity-0"}`}>
            {s}
          </span>
        ))}
      </div>
      <span
        data-stamp
        aria-hidden="true"
        className="p-sm absolute bottom-6 right-8 bg-hanko px-2 py-1 font-kanji text-cream"
      >
        影分身
      </span>
    </div>
  );
}

export default function TrainingSteps() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const steps = q("[data-step]");
      const status = q("[data-status]");
      const hold = q("[data-hold]")[0];
      const counter = { v: 0 };

      // Start state, set before the timeline so nothing flashes.
      gsap.set(steps, { opacity: 0.3 });
      gsap.set(steps[0], { opacity: 1 });
      gsap.set(q("[data-rail]"), { scaleY: 0, transformOrigin: "top" });
      gsap.set(q("[data-static]"), { opacity: 0.9 });
      gsap.set(q("[data-corner]"), { opacity: 0, scale: 1.6 });
      gsap.set(q("[data-rec]"), { opacity: 0 });
      gsap.set(status, { opacity: 0 });
      gsap.set(status[0], { opacity: 1 });
      gsap.set(q('[data-approach="back"]'), { x: -140, opacity: 0 });
      gsap.set(q('[data-approach="front"]'), { x: 140, opacity: 0 });
      gsap.set(q("[data-approach] [data-bone]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-approach] [data-joint]"), { scale: 0, transformOrigin: "center", transformBox: "fill-box" });
      gsap.set(q("[data-hold-ring]"), { strokeDashoffset: 1 });
      gsap.set(q("[data-glow]"), { scale: 0, opacity: 0, transformOrigin: "center", transformBox: "fill-box" });
      gsap.set(q("[data-clone]"), { opacity: 0, x: 0 });
      gsap.set(q("[data-stamp]"), { opacity: 0, scale: 1.8 });
      hold.textContent = "0";

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true },
      });

      tl.to(q("[data-rail]"), { scaleY: 1, duration: 3 }, 0)

        // 1 — the camera powers on
        .to(q("[data-static]"), { opacity: 0, duration: 0.7 }, 0.05)
        .to(q("[data-corner]"), { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out", stagger: 0.05 }, 0.1)
        .to(q("[data-rec]"), { opacity: 1, duration: 0.1 }, 0.5)

        // 2 — the hands come in and form the seal
        .to(steps[0], { opacity: 0.3, duration: 0.15 }, 0.95)
        .to(steps[1], { opacity: 1, duration: 0.15 }, 0.95)
        .to(status[0], { opacity: 0, duration: 0.1 }, 0.95)
        .to(status[1], { opacity: 1, duration: 0.1 }, 1)
        .to(q("[data-approach]"), { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 1)
        .to(q("[data-approach] [data-bone]"), { strokeDashoffset: 0, duration: 0.4, stagger: 0.01 }, 1.05)
        .to(q("[data-approach] [data-joint]"), { scale: 1, duration: 0.2, stagger: 0.008 }, 1.15)
        .to(q("[data-hold-ring]"), { strokeDashoffset: 0, duration: 0.45 }, 1.5)
        .to(counter, {
          v: 100,
          duration: 0.45,
          onUpdate: () => {
            hold.textContent = Math.round(counter.v);
          },
        }, 1.5)

        // 3 — release
        .to(steps[1], { opacity: 0.3, duration: 0.15 }, 1.95)
        .to(steps[2], { opacity: 1, duration: 0.15 }, 1.95)
        .to(status[1], { opacity: 0, duration: 0.1 }, 1.95)
        .to(status[2], { opacity: 1, duration: 0.1 }, 2)
        .to(q("[data-glow]"), { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }, 2)
        .to(q("[data-glow]"), { opacity: 0.55, duration: 0.4 }, 2.35)
        .fromTo(q('[data-clone="l"]'), { x: 118 }, { x: 0, opacity: 0.4, duration: 0.5, ease: "power2.out" }, 2.1)
        .fromTo(q('[data-clone="r"]'), { x: -118 }, { x: 0, opacity: 0.4, duration: 0.5, ease: "power2.out" }, 2.1)
        .to(q("[data-stamp]"), { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, 2.55)
        .to({}, { duration: 0.2 }, 2.8);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="training-heading"
      className="relative h-[300svh] border-t border-rule bg-ink motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center px-20 py-16 max-md:px-12 max-sm:px-6 max-sm:py-10 motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        <h2 id="training-heading" className="ink h2 tracking-tight text-cream">
          How training works
        </h2>
        <p className="lines-up p-lg mt-4 max-w-[42ch] text-muted max-sm:hidden">
          Three motions, same order every time. Chakra builds through the seal and releases on
          the last step.
        </p>

        <div className="mt-12 grid grid-cols-[1fr_1.3fr] items-center gap-16 max-md:mt-8 max-md:grid-cols-1 max-md:gap-8">
          <div className="relative flex gap-8 max-md:order-2">
            {/* progress rail */}
            <div className="relative w-px shrink-0 bg-rule" aria-hidden="true">
              <div data-rail className="absolute inset-0 bg-chakra" />
            </div>

            <ol className="flex flex-col gap-10 max-md:gap-5">
              {STEPS.map((s) => (
                <li key={s.n} data-step>
                  <div className="flex items-baseline gap-2">
                    <span className="p-sm font-mono text-muted">{s.n}</span>
                    <span className="p-sm font-kanji text-cream/50">{s.kanji}</span>
                  </div>
                  <h3 className="ink h3 mt-1 text-cream">{s.title}</h3>
                  <p className="lines-up p-md mt-1 max-w-[22rem] text-muted max-sm:hidden">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <Viewfinder />
        </div>
      </div>
    </section>
  );
}
