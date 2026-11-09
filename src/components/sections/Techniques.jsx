"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import Parchment from "@/components/ui/Parchment";
import HorizontalRoller from "@/components/ui/HorizontalRoller";
import InkText from "@/components/animations/InkText";
import TechniqueSeal from "@/components/product/TechniqueSeal";
import TechniqueSigns from "@/components/product/TechniqueSigns";
import ShadowClonePreview from "@/components/product/ShadowClonePreview";
import RasenganPreview from "@/components/product/RasenganPreview";

/*
 * The technique registry as one giant scroll, driven by page scroll.
 * A tall outer container supplies the scroll distance; the inner screen is
 * sticky. One scrubbed timeline (0 → 10):
 *   0   – 1    the rolled scroll opens: rods part to the top and bottom
 *   1   – 8.6  the parchment is read top to bottom; each technique's seal
 *              draws itself and its name inks in as it reaches the middle,
 *              while a chakra glow travels down the margin
 *   8.6 – 9.4  the scroll rolls shut
 *   9.4 – 10   a 封 seal is stamped across it
 * With reduced motion the scroll is simply open, everything visible.
 */

const TECHNIQUES = [
  {
    id: "kage-bunshin",
    name: "Kage Bunshin no Jutsu",
    kanji: "影分身",
    fullKanji: "影分身の術",
    rank: "B",
    body: "Cross both hands at a right angle, a finger or two raised on each. Hold it, and clones of you fan out on screen.",
    signs: [{ pose: "seal", label: "Cross" }],
    Preview: ShadowClonePreview,
  },
  {
    id: "rasengan",
    name: "Rasengan",
    kanji: "螺旋丸",
    fullKanji: "螺旋丸",
    rank: "A",
    body: "Clench one fist, then open that palm face-up. A sphere forms above your hand and follows it live.",
    signs: [
      { pose: "fist", label: "Clench" },
      { pose: "open", label: "Open" },
    ],
    Preview: RasenganPreview,
  },
  {
    id: "fire-style",
    name: "Fire Style",
    kanji: "火遁",
    fullKanji: "火遁",
    rank: "?",
    body: "Not built yet. The seal holds for now.",
    sealed: true,
  },
];

const T = { open: 1, read: 8.6, close: 9.4, end: 10 };

function Entry({ t, revealed, active, entryRef }) {
  const { Preview } = t;
  return (
    <article
      ref={entryRef}
      className="flex min-h-[64svh] items-center py-10 max-md:min-h-0 max-md:py-12"
    >
      <div className="grid w-full grid-cols-[auto_1fr] items-start gap-10 max-sm:grid-cols-1 max-sm:gap-5">
        <TechniqueSeal
          kanji={t.kanji}
          rank={t.rank}
          sealed={t.sealed}
          drawn={revealed}
          className="h-36 w-36 max-md:h-28 max-md:w-28 max-sm:h-24 max-sm:w-24"
        />

        <div className="min-w-0">
          <p className="p-sm font-mono uppercase tracking-[0.2em] text-hanko">
            {t.sealed ? "Sealed" : `${t.rank}-rank`} · {t.fullKanji}
          </p>
          <InkText
            as="h3"
            className={`h3 mt-1 ${t.sealed ? "text-ink/50" : "text-ink"}`}
            play={revealed}
            delay={0.3}
          >
            {t.name}
          </InkText>
          <div
            className={`transition-[opacity,translate] duration-700 ease-out ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: revealed ? "0.5s" : "0s" }}
          >
            <p className="p-md mt-2 max-w-[42ch] text-ink/75">{t.body}</p>
            {t.signs && <TechniqueSigns signs={t.signs} />}
            {Preview && (
              <div className="relative mt-6 aspect-[16/9] w-full max-w-[30rem] overflow-hidden bg-ink shadow-[inset_0_0_1.2rem_color-mix(in_srgb,var(--ink)_90%,transparent)] ring-1 ring-bronze-deep">
                <Preview active={active} />
                <span className="p-sm absolute left-3 top-2 flex items-center gap-2 font-mono uppercase tracking-[0.2em] text-cream/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-hanko" aria-hidden="true" />
                  Live preview
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Techniques() {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const entryRefs = useRef([]);
  const [opened, setOpened] = useState(false);
  const [revealed, setRevealed] = useState(() => TECHNIQUES.map(() => false));
  const [active, setActive] = useState(-1);
  const live = TECHNIQUES.filter((t) => !t.sealed).length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (prefersReducedMotion()) {
      // Everything shown at once, on the next frame.
      const id = requestAnimationFrame(() => {
        setOpened(true);
        setRevealed(TECHNIQUES.map(() => true));
      });
      return () => cancelAnimationFrame(id);
    }

    const frame = frameRef.current;
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const q = gsap.utils.selector(root);
    const last = { opened: false, revealed: TECHNIQUES.map(() => false), active: -1 };

    const ctx = gsap.context(() => {
      const rod = () => q("[data-rod='top']")[0].offsetHeight;
      // Rods meet in the middle when the scroll is rolled.
      const closedShift = () => frame.offsetHeight / 2 - rod();
      const travel = () => Math.max(0, content.scrollHeight - viewport.clientHeight);

      gsap.set(q("[data-rod='top']"), { y: closedShift });
      gsap.set(q("[data-rod='bottom']"), { y: () => -closedShift() });
      gsap.set(q("[data-paper]"), { "--clip": "50%" });
      gsap.set(q("[data-chakra-fill]"), { scaleY: 0, transformOrigin: "top" });
      gsap.set(q("[data-chakra-orb]"), { top: "0%", opacity: 0 });
      gsap.set(q("[data-stamp]"), { opacity: 0, scale: 1.8, rotate: -14 });
      gsap.set(q("[data-ripple]"), { opacity: 0, scale: 0.6 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: () => sync(),
        },
      });

      // 1 — unroll
      tl.to(q("[data-rod='top']"), { y: 0, duration: T.open, ease: "power2.inOut" }, 0)
        .to(q("[data-rod='bottom']"), { y: 0, duration: T.open, ease: "power2.inOut" }, 0)
        .fromTo(q("[data-paper]"), { "--clip": "50%" }, { "--clip": "0%", duration: T.open, ease: "power2.inOut" }, 0)

        // 2 — read down the scroll, chakra travelling along the margin
        .to(content, { y: () => -travel(), duration: T.read - T.open }, T.open)
        .to(q("[data-chakra-orb]"), { opacity: 1, duration: 0.2 }, T.open)
        .to(q("[data-chakra-orb]"), { top: "100%", duration: T.read - T.open }, T.open)
        .to(q("[data-chakra-fill]"), { scaleY: 1, duration: T.read - T.open }, T.open)
        .to(q("[data-chakra-orb]"), { opacity: 0, duration: 0.2 }, T.read - 0.2)

        // 3 — roll shut
        .to(q("[data-rod='top']"), { y: closedShift, duration: T.close - T.read, ease: "power2.inOut" }, T.read)
        .to(q("[data-rod='bottom']"), { y: () => -closedShift(), duration: T.close - T.read, ease: "power2.inOut" }, T.read)
        .fromTo(
          q("[data-paper]"),
          { "--clip": "0%" },
          { "--clip": "50%", duration: T.close - T.read, ease: "power2.inOut", immediateRender: false },
          T.read,
        )

        // 4 — stamp the seal
        .to(q("[data-stamp]"), { opacity: 1, scale: 1, rotate: -6, duration: 0.25, ease: "power4.in" }, T.close)
        .to(q("[data-ripple]"), { opacity: 0.8, scale: 1, duration: 0.05 }, T.close + 0.25)
        .to(q("[data-ripple]"), { opacity: 0, scale: 1.8, duration: 0.3, ease: "power2.out" }, T.close + 0.3)
        .to({}, { duration: T.end - T.close - 0.6 }, T.close + 0.6);

      // Which entries have been reached, and which one is in the middle.
      function sync() {
        const t = tl.time();
        const isOpen = t > T.open * 0.7 && t < T.read + 0.3;
        const y = gsap.getProperty(content, "y");
        const h = viewport.clientHeight;
        let nearest = -1;
        let best = Infinity;
        const seen = entryRefs.current.map((el, i) => {
          if (!el) return false;
          const center = el.offsetTop + el.offsetHeight / 2 + y;
          const d = Math.abs(center - h / 2);
          if (isOpen && center > h * 0.1 && center < h * 0.9 && d < best) {
            best = d;
            nearest = i;
          }
          return last.revealed[i] || (t > T.open * 0.7 && el.offsetTop + y < h * 0.7);
        });
        if (isOpen !== last.opened) {
          last.opened = isOpen || last.opened;
          setOpened(last.opened);
        }
        if (seen.some((v, i) => v !== last.revealed[i])) {
          last.revealed = seen;
          setRevealed(seen);
        }
        if (nearest !== last.active) {
          last.active = nearest;
          setActive(nearest);
        }
      }
      sync();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="techniques"
      ref={rootRef}
      aria-label="Techniques"
      className="relative h-[520svh] border-t border-rule bg-ink motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-6 motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        <div
          ref={frameRef}
          className="relative h-[86svh] w-[min(62rem,92vw)] [--rod:2.4rem] max-sm:[--rod:2rem] motion-reduce:h-auto"
        >
          {/* parchment between the rods */}
          <div
            data-paper
            style={{ clipPath: "inset(var(--clip, 0%) 0 var(--clip, 0%) 0)" }}
            className="absolute inset-x-[1.4rem] bottom-[calc(var(--rod)/2)] top-[calc(var(--rod)/2)] max-sm:inset-x-[1rem] motion-reduce:relative motion-reduce:inset-auto motion-reduce:my-[calc(var(--rod)/2)]"
          >
          <Parchment
            as="div"
            className="h-full shadow-[0_1rem_2rem_-0.6rem_color-mix(in_srgb,var(--ink)_80%,transparent)] motion-reduce:h-auto"
          >
            {/* chakra travelling down the margin */}
            <div
              aria-hidden="true"
              className="absolute bottom-[8%] left-10 top-[8%] w-px bg-ink/10 max-sm:left-5 motion-reduce:hidden"
              data-paper-margin
            >
              <div data-chakra-fill className="absolute inset-0 bg-linear-to-b from-chakra/10 to-chakra/70" />
              <div
                data-chakra-orb
                className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chakra shadow-[0_0_1rem_0.4rem_color-mix(in_srgb,var(--chakra)_55%,transparent)]"
              />
            </div>

            <div ref={viewportRef} className="absolute inset-0 overflow-hidden motion-reduce:relative" data-paper-viewport>
              <div ref={contentRef} className="px-20 pb-[30svh] pt-16 max-md:px-14 max-sm:pb-[20svh] max-sm:pl-10 max-sm:pr-6 motion-reduce:pb-12">
                <header className="max-w-[44ch]">
                  <p className="p-sm font-mono text-ink/60">
                    {live} of {TECHNIQUES.length} stamped and trainable
                  </p>
                  <InkText as="h2" className="h2 mt-2 tracking-tight text-ink" play={opened} delay={0.2}>
                    Techniques
                  </InkText>
                  <p
                    className={`p-lg mt-4 text-ink/70 transition-opacity duration-700 ${opened ? "opacity-100" : "opacity-0"}`}
                    style={{ transitionDelay: opened ? "0.6s" : "0s" }}
                  >
                    Ranked as they&apos;d appear in a ninja registry. Keep scrolling to read the
                    scroll; sealed entries are on the way.
                  </p>
                </header>

                {TECHNIQUES.map((t, i) => (
                  <Entry
                    key={t.id}
                    t={t}
                    revealed={revealed[i]}
                    active={active === i}
                    entryRef={(el) => {
                      entryRefs.current[i] = el;
                    }}
                  />
                ))}
              </div>
            </div>
          </Parchment>
          </div>

          {/* rods */}
          <div data-rod="top" className="absolute inset-x-0 top-0 z-10 h-(--rod)">
            <HorizontalRoller className="absolute inset-0" />
          </div>
          <div data-rod="bottom" className="absolute inset-x-0 bottom-0 z-10 h-(--rod)">
            <HorizontalRoller className="absolute inset-0" />
          </div>

          {/* the closing seal */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center motion-reduce:hidden">
            <span data-ripple className="absolute h-36 w-36 rounded-full border-2 border-hanko/70" />
            <span
              data-stamp
              className="h2 flex h-24 w-24 items-center justify-center bg-hanko font-kanji text-cream shadow-[0_0.6rem_1.2rem_color-mix(in_srgb,var(--ink)_70%,transparent)]"
            >
              封
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
