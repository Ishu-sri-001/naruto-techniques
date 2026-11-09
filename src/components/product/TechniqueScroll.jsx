"use client";

import { useEffect, useRef, useState } from "react";
import ScrollRoller from "@/components/ui/ScrollRoller";
import Parchment from "@/components/ui/Parchment";
import TechniqueSigns from "@/components/product/TechniqueSigns";
import InkText from "@/components/animations/InkText";

/*
 * One technique as a hanging scroll in the library. The left rod stays put;
 * opening slides the right rod across while the parchment is revealed from
 * left to right (a clip, so the contents never reflow mid-unroll). Closed,
 * only the kanji strip shows, with the name beside the scroll. A sealed
 * technique stays rolled, tied with a paper seal that flutters on hover.
 *
 * Geometry: --rw is the rod width, --strip the closed paper width. The
 * paper spans the row between the two rod centres; rods are drawn at their
 * natural proportions, so the rod length is fitted to the row height.
 */

const EASE = "ease-[cubic-bezier(0.6,0.1,0,1)]";
const ROD_REM = 1.6;

function RankStamp({ rank, sealed }) {
  return (
    <span
      className={`p-sm flex h-7 w-7 items-center justify-center font-mono text-cream shadow-[0_0.1rem_0.2rem_color-mix(in_srgb,var(--ink)_40%,transparent)] ${
        sealed ? "bg-ink/70" : "bg-hanko"
      }`}
    >
      {rank}
    </span>
  );
}

export default function TechniqueScroll({ technique, open = false, onOpen }) {
  const { id, name, kanji, rank, body, signs, sealed, Preview } = technique;
  const rowRef = useRef(null);
  const [rodLength, setRodLength] = useState(240);
  const isOpen = open && !sealed;

  // Fit the rod's drawn length to the row height so it keeps a constant width.
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const ro = new ResizeObserver(([entry]) => {
      setRodLength(Math.round((entry.contentRect.height * 26) / (ROD_REM * rem)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rodClass =
    "h-full w-(--rw) drop-shadow-[0.1rem_0.3rem_0.3rem_color-mix(in_srgb,var(--ink)_70%,transparent)]";

  return (
    <div
      ref={rowRef}
      data-open={isOpen}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" && !sealed) onOpen?.(id);
      }}
      className={`group relative h-72 transition-[height] duration-700 ${EASE} [--rw:1.6rem] [--strip:7rem] max-md:h-44 max-md:data-[open=true]:h-[34rem] max-sm:[--strip:4.5rem] max-sm:data-[open=true]:h-[38rem]`}
    >
      {/* name beside the closed scroll; the paper slides over it on opening */}
      <div
        className={`absolute inset-y-0 flex flex-col justify-center transition-opacity duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
        style={{ left: "calc(var(--strip) + var(--rw) + 2rem)" }}
      >
        <p className={`p-sm font-mono uppercase tracking-[0.2em] ${sealed ? "text-hanko-soft" : "text-chakra"}`}>
          {sealed ? "Sealed" : `${rank}-rank`}
        </p>
        <InkText as="h3" className={`h3 mt-1 ${sealed ? "text-cream/45" : "text-cream"}`}>
          {name}
        </InkText>
        <p className="lines-up p-md mt-1 text-muted">
          {sealed ? "Not built yet. The seal holds for now." : "Unroll to see the signs and a live preview."}
        </p>
      </div>

      {/* parchment, revealed from the left */}
      <Parchment
        as="div"
        className={`absolute inset-y-[1.2rem] left-[calc(var(--rw)/2)] right-[calc(var(--rw)/2)] shadow-[0_0.6rem_1rem_-0.4rem_color-mix(in_srgb,var(--ink)_80%,transparent)] transition-[clip-path] duration-700 ${EASE}`}
        paperClassName="items-stretch"
        style={{ clipPath: isOpen ? "inset(0 0 0 0)" : "inset(0 calc(100% - var(--strip)) 0 0)" }}
      >
        <div className="relative flex w-(--strip) shrink-0 flex-col items-center justify-center gap-4 border-r border-bronze/30">
          <span
            aria-hidden="true"
            className={`h3 font-kanji tracking-[0.2em] [writing-mode:vertical-rl] max-md:p-lg ${
              sealed ? "text-ink/40" : "text-ink/90"
            }`}
          >
            {kanji}
          </span>
          <span className="max-md:hidden">
            <RankStamp rank={sealed ? "?" : rank} sealed={sealed} />
          </span>
        </div>

        {!sealed && (
          <div
            id={`${id}-scroll`}
            aria-hidden={!isOpen}
            className="relative grid min-w-0 flex-1 grid-cols-[1.1fr_1fr] items-center gap-10 py-5 pl-10 pr-12 max-md:grid-cols-1 max-md:content-center max-md:gap-5 max-md:pl-6 max-md:pr-8 max-sm:pl-4 max-sm:pr-5"
          >
            <div className="min-w-0">
              <p className="p-sm font-mono uppercase tracking-[0.2em] text-hanko">
                {rank}-rank · {technique.fullKanji}
              </p>
              <InkText as="h3" className="h3 mt-1 text-ink" play={isOpen} delay={0.45}>
                {name}
              </InkText>
              <p className="lines-up p-md mt-2 max-w-[38ch] text-ink/75">{body}</p>
              <TechniqueSigns signs={signs} />
            </div>

            <div className="relative aspect-[16/10] h-full max-h-full justify-self-end overflow-hidden bg-ink shadow-[inset_0_0_1.2rem_color-mix(in_srgb,var(--ink)_90%,transparent)] ring-1 ring-bronze-deep max-md:h-auto max-md:w-full max-md:justify-self-stretch">
              {Preview && <Preview active={isOpen} />}
              <span className="p-sm absolute left-3 top-2 flex items-center gap-2 font-mono uppercase tracking-[0.2em] text-cream/70">
                <span className="h-1.5 w-1.5 rounded-full bg-hanko" aria-hidden="true" />
                Live preview
              </span>
            </div>
          </div>
        )}
      </Parchment>

      {/* left rod, fixed */}
      <div className="absolute left-0 top-0 z-10 h-full">
        <ScrollRoller length={rodLength} className={rodClass} />
      </div>

      {/* right rod, slides with the unrolling edge */}
      <div
        className={`absolute top-0 z-10 h-full transition-[left] duration-700 ${EASE}`}
        style={{ left: isOpen ? "calc(100% - var(--rw))" : "var(--strip)" }}
      >
        <ScrollRoller length={rodLength} className={rodClass} />
      </div>

      {/* paper seal tied around a sealed scroll */}
      {sealed && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -bottom-1 z-20 w-8 origin-top motion-safe:group-hover:animate-[tag-flutter_0.9s_ease-in-out_infinite]"
          style={{ left: "calc(var(--rw) / 2 + var(--strip) / 2 - 1rem)" }}
        >
          <Parchment as="div" className="h-full w-full -rotate-2 shadow-[0_0.3rem_0.6rem_color-mix(in_srgb,var(--ink)_60%,transparent)]" paperClassName="flex-col items-center justify-center gap-2">
            <span className="relative h-1/4 w-px bg-hanko/70" />
            <span className="h3 relative font-kanji text-hanko max-md:p-lg">封</span>
            <span className="relative h-1/4 w-px bg-hanko/70" />
          </Parchment>
        </div>
      )}

      {/* closed: the whole row is the control that unrolls it */}
      {!sealed && !isOpen && (
        <button
          type="button"
          aria-expanded="false"
          aria-controls={`${id}-scroll`}
          onClick={() => onOpen?.(id)}
          className="absolute inset-0 z-30 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-chakra focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
        >
          <span className="sr-only">Unroll {name}</span>
        </button>
      )}
    </div>
  );
}
