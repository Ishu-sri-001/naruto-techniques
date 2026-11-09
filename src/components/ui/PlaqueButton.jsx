"use client";

import { useState } from "react";
import Link from "next/link";
import PlaqueSurface from "@/components/ui/PlaqueSurface";

/*
 * An aged parchment plaque button: a raised wooden frame whose ends step in
 * with a small scoop and angle out to a point, cracked parchment, a red ink
 * rule along the outline, red key-pattern ornaments in the four end
 * corners, and a brass rivet at each end. The surface is rendered in WebGL
 * (PlaqueSurface) so it reads as a real object, with the light following
 * the pointer on hover while cracks spread across the paper. The label is printed into the paper (ink multiplied
 * over the texture). Everything is sized from --h, the plaque height.
 *
 * The flat CSS layers are the fallback when WebGL is missing; they hide
 * once the surface has drawn.
 */

const PAPER = "paper-grain notched absolute bg-parchment bg-blend-multiply";

// Red key-pattern (fret) ornament for one corner; mirrored for the others.
function Fret({ className }) {
  return (
    <svg
      viewBox="0 0 24 18"
      aria-hidden="true"
      className={`absolute h-[calc(var(--h)*0.22)] w-[calc(var(--h)*0.3)] mix-blend-multiply ${className}`}
    >
      <path
        d="M1 1.5 H15 M8 1.5 V9 H22 M15 5 V13 M1 9 H5 M1 9 V16"
        style={{ fill: "none", stroke: "var(--hanko-deep)", strokeWidth: 1.6, strokeLinecap: "square", opacity: 0.85 }}
      />
    </svg>
  );
}

export default function PlaqueButton({ href, children, className = "" }) {
  const [surfaceReady, setSurfaceReady] = useState(false);

  return (
    <Link
      href={href}
      className={`group relative inline-flex h-(--h) shrink-0 items-center justify-center px-[calc(var(--h)*1.1)] outline-none drop-shadow-[0_0.4rem_0.6rem_color-mix(in_srgb,var(--ink)_75%,transparent)] [--h:4rem] [--notch:0.5rem] max-sm:[--h:3.5rem] ${className}`}
    >
      {/* flat fallback */}
      <span aria-hidden="true" className={surfaceReady ? "hidden" : "contents"}>
        <span className="notched absolute inset-0 bg-linear-to-b from-bronze to-bronze-deep" />
        <span className={`${PAPER} inset-[0.3rem]`} />
        <span className="notched absolute inset-[0.6rem] bg-hanko-deep/60" />
        <span className={`${PAPER} inset-[0.7rem]`} />
      </span>

      <PlaqueSurface onReady={setSurfaceReady} />

      <Fret className="left-[calc(var(--h)*0.42)] top-[calc(var(--h)*0.26)]" />
      <Fret className="bottom-[calc(var(--h)*0.26)] left-[calc(var(--h)*0.42)] -scale-y-100" />
      <Fret className="right-[calc(var(--h)*0.42)] top-[calc(var(--h)*0.26)] -scale-x-100" />
      <Fret className="bottom-[calc(var(--h)*0.26)] right-[calc(var(--h)*0.42)] -scale-100" />

      <span className="p-lg relative font-kanji whitespace-nowrap tracking-[0.1em] text-ink/90 mix-blend-multiply [text-shadow:0_0.1rem_0_color-mix(in_srgb,var(--cream)_35%,transparent)]">
        {children}
      </span>
    </Link>
  );
}
