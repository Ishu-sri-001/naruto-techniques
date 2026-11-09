"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

/*
 * The footer's Konoha-at-sunset panorama and everything alive in it.
 *
 * The art box keeps the illustration's exact aspect ratio, so the lantern
 * glow, the sun and the tree the leaves fall from are pinned in % of the
 * picture at every breakpoint; tablet and mobile only change its height and
 * slide it left to keep Naruto and the tree in frame.
 *
 * Motion, all GSAP, mounted against the parent <footer>:
 *   parallax  the art trails the scroll as the footer rises; a near layer of
 *             petals outruns it, so the scene reads in depth
 *   ambient   slow breathing zoom, flickering lantern, pulsing sun, maple
 *             leaves falling from the tree, sakura drifting across — paused
 *             whenever the footer is off screen
 *   pointer   the art and near petals drift against the cursor
 *   reveal    footer content rises in once, the brush stroke draws under the tagline
 * Reduced motion: the still scene, no particles.
 */

const IMAGE_W = 1672;
const IMAGE_H = 941;

const LEAF_TONES = ["text-hanko", "text-ember", "text-hanko-deep", "text-hanko-soft"];
const LEAVES = Array.from({ length: 12 }, (_, i) => LEAF_TONES[i % LEAF_TONES.length]);
const FAR_PETALS = 10;
const NEAR_PETALS = 6;

function MapleLeaf() {
  return (
    <svg viewBox="0 0 24 24" className="block w-full" fill="currentColor">
      <path d="M12 2 13.4 5.6 16 4.2 15.4 8.6 19.2 7 18 10.4 21.6 11.8 18 14 18.8 16.8 14.4 15.6 14.6 18.2 12 16.6 9.4 18.2 9.6 15.6 5.2 16.8 6 14 2.4 11.8 6 10.4 4.8 7 8.6 8.6 8 4.2 10.6 5.6Z" />
      <path d="M12 16.6v5.8" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

function Petal() {
  return (
    <svg viewBox="0 0 24 24" className="block w-full" fill="currentColor">
      <path d="M12 3.5 9.8 1.6C5.4 4.6 4.8 13.4 12 22c7.2-8.6 6.6-17.4 2.2-20.4z" />
    </svg>
  );
}

export default function KonohaScene() {
  const artRef = useRef(null);

  useEffect(() => {
    const art = artRef.current;
    const footer = art?.closest("footer");
    if (!art || !footer || prefersReducedMotion()) return;

    const q = gsap.utils.selector(footer);
    const r = gsap.utils.random;
    const cleanups = [];

    const ctx = gsap.context(() => {
      // ---- Parallax: art lags the scroll, near petals lead it ----
      const rising = { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: true };
      gsap.fromTo(
        q("[data-scene-parallax]"),
        { yPercent: -10 },
        { yPercent: 0, ease: "none", scrollTrigger: rising },
      );
      gsap.fromTo(
        q("[data-scene-near]"),
        { yPercent: 25 },
        { yPercent: -5, ease: "none", scrollTrigger: rising },
      );

      // ---- Ambient: one paused master, played only while on screen ----
      const ambient = gsap.timeline({ paused: true });
      const breathe = q("[data-scene-breathe]")[0];

      ambient.to(breathe, { scale: 1.04, duration: 16, ease: "sine.inOut", repeat: -1, yoyo: true }, 0);
      ambient.to(
        q("[data-glow='lantern']"),
        {
          opacity: () => r(0.55, 1),
          scale: () => r(0.92, 1.08),
          duration: 0.5,
          ease: "sine.inOut",
          repeat: -1,
          repeatRefresh: true,
        },
        0,
      );
      ambient.to(
        q("[data-glow='sun']"),
        { opacity: 1, scale: 1.12, duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true },
        0,
      );

      // Maple leaves let go of the canopy (top-left of the picture) and
      // tumble down and right on the evening breeze.
      q("[data-leaf]").forEach((leaf) => {
        const flutter = leaf.firstElementChild;
        const fall = r(7, 12);
        const tl = gsap.timeline({ repeat: -1, repeatRefresh: true, repeatDelay: r(0.5, 4) });
        tl.fromTo(
          leaf,
          {
            left: () => `${r(2, 40)}%`,
            top: () => `${r(2, 18)}%`,
            x: 0,
            y: 0,
            scale: () => r(0.6, 1.2),
            rotation: () => r(-60, 60),
            opacity: 0,
          },
          {
            x: () => art.offsetWidth * r(0.06, 0.32),
            y: () => art.offsetHeight * r(0.5, 0.8),
            rotation: () => r(220, 620),
            duration: fall,
            ease: "none",
          },
        )
          .to(leaf, { opacity: 1, duration: 0.8, ease: "power1.out" }, 0)
          .to(leaf, { opacity: 0, duration: 1.4, ease: "power1.in" }, fall - 1.4);
        ambient.add(tl, r(0, 9));
        ambient.to(
          flutter,
          { rotationY: 360, duration: r(1.4, 2.6), ease: "none", repeat: -1, transformPerspective: 300 },
          0,
        );
        ambient.to(
          flutter,
          { xPercent: r(120, 240), duration: r(1.2, 2), ease: "sine.inOut", repeat: -1, yoyo: true },
          0,
        );
      });

      // Sakura drift across the whole sky, far (in the picture) and near.
      const drift = (petals, box, { from, to, life, tops, alpha }) =>
        petals.forEach((petal) => {
          const flutter = petal.firstElementChild;
          const span = r(life[0], life[1]);
          const tl = gsap.timeline({ repeat: -1, repeatRefresh: true, repeatDelay: r(0, 3) });
          tl.fromTo(
            petal,
            {
              left: `${from}%`,
              top: () => `${r(tops[0], tops[1])}%`,
              x: 0,
              y: 0,
              rotation: () => r(0, 360),
              scale: () => r(0.6, 1.1),
              opacity: 0,
            },
            {
              x: () => box.offsetWidth * ((to - from) / 100) * r(0.9, 1.1),
              y: () => box.offsetHeight * r(0.05, 0.3),
              rotation: () => r(300, 720),
              duration: span,
              ease: "none",
            },
          )
            .to(petal, { opacity: r(alpha[0], alpha[1]), duration: 1.6 }, 0)
            .to(petal, { opacity: 0, duration: 1.6 }, span - 1.6);
          ambient.add(tl, r(0, span));
          ambient.to(
            flutter,
            { yPercent: r(-260, 260), rotationX: 180, duration: r(1.6, 3), ease: "sine.inOut", repeat: -1, yoyo: true },
            0,
          );
        });

      drift(q("[data-petal='far']"), art, { from: -4, to: 104, life: [16, 24], tops: [6, 55], alpha: [0.5, 0.85] });
      drift(q("[data-petal='near']"), footer, { from: -6, to: 106, life: [9, 14], tops: [4, 70], alpha: [0.6, 0.9] });

      ScrollTrigger.create({
        trigger: footer,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? ambient.play() : ambient.pause()),
      });

      // ---- Pointer: the art and near petals drift against the cursor ----
      if (window.matchMedia("(pointer: fine)").matches) {
        const near = q("[data-scene-near]")[0];
        const artX = gsap.quickTo(breathe, "xPercent", { duration: 1.4, ease: "power3.out" });
        const artY = gsap.quickTo(breathe, "yPercent", { duration: 1.4, ease: "power3.out" });
        const nearX = gsap.quickTo(near, "xPercent", { duration: 1.1, ease: "power3.out" });
        const onMove = (e) => {
          const box = footer.getBoundingClientRect();
          const px = (e.clientX - box.left) / box.width - 0.5;
          const py = (e.clientY - box.top) / box.height - 0.5;
          artX(-px * 2);
          artY(-py * 1.2);
          nearX(-px * 5);
        };
        const onLeave = () => {
          artX(0);
          artY(0);
          nearX(0);
        };
        footer.addEventListener("pointermove", onMove);
        footer.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          footer.removeEventListener("pointermove", onMove);
          footer.removeEventListener("pointerleave", onLeave);
        });
      }

      // ---- Reveal: content rises in once, then the brush stroke draws ----
      gsap
        .timeline({
          scrollTrigger: { trigger: q("[data-footer-content]")[0], start: "top 85%", once: true },
        })
        .from(q("[data-footer-reveal]"), {
          yPercent: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
        })
        .from(
          q("[data-brush]"),
          { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power2.inOut" },
          0.5,
        );
    }, footer);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div
        ref={artRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 aspect-1672/941 w-full overflow-hidden max-md:h-[90vw] max-md:w-auto max-md:translate-x-[-2%] max-sm:h-[150vw] max-sm:translate-x-[-7%]"
      >
        <div data-scene-parallax className="absolute inset-0">
          <div data-scene-breathe className="absolute inset-0 scale-[1.06]">
            <Image
              src="/images/footer/image.png"
              alt=""
              width={IMAGE_W}
              height={IMAGE_H}
              sizes="(max-width: 767px) 270vw, (max-width: 1024px) 170vw, 106vw"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* lantern and setting sun, lit from inside */}
            <span
              data-glow="lantern"
              className="absolute left-[14.2%] top-[23.4%] aspect-square w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ember)_55%,transparent)_0%,transparent_65%)] mix-blend-screen"
            />
            <span
              data-glow="sun"
              className="absolute left-[30.8%] top-[36.7%] aspect-square w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ember)_40%,transparent)_0%,transparent_62%)] opacity-70 mix-blend-screen"
            />

            {LEAVES.map((tone, i) => (
              <span
                key={`leaf-${i}`}
                data-leaf
                className={`absolute left-0 top-0 w-[1.6%] opacity-0 will-change-transform ${tone}`}
              >
                <span className="block">
                  <MapleLeaf />
                </span>
              </span>
            ))}

            {Array.from({ length: FAR_PETALS }, (_, i) => (
              <span
                key={`far-${i}`}
                data-petal="far"
                className="absolute left-0 top-0 w-[0.8%] text-sakura opacity-0 will-change-transform"
              >
                <span className="block">
                  <Petal />
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* soft lead-in from the section above; the foot sinks into dusk */}
        <div className="absolute inset-x-0 top-0 h-[8%] bg-linear-to-b from-ink to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-linear-to-b from-transparent to-dusk" />
      </div>

      <div
        data-scene-near
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-5"
      >
        {Array.from({ length: NEAR_PETALS }, (_, i) => (
          <span
            key={`near-${i}`}
            data-petal="near"
            className="absolute left-0 top-0 w-[1.6vw] text-sakura opacity-0 blur-[0.1vw] will-change-transform max-md:w-[2.8vw] max-sm:w-[4.6vw]"
          >
            <span className="block">
              <Petal />
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
