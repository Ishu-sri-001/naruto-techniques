"use client";

import { useId } from "react";

/*
 * A lacquered wooden scroll rod with turned bronze ends, lit as a cylinder.
 * Drawn 26 units wide; `length` sets the drawn height so one design serves
 * a short button (≈100) or a tall library scroll. Every cap and band shows
 * its curved front edge (an elliptical arc), which is what makes the ends
 * read as round. Render it with h-full w-auto (or a fixed size) to keep
 * its natural proportions.
 */

const r1 = (n) => Math.round(n * 10) / 10;

const stop = (offset, color, opacity) => (
  <stop
    offset={offset}
    style={{
      stopColor: color.startsWith("--") ? `var(${color})` : color,
      ...(opacity !== undefined && { stopOpacity: opacity }),
    }}
  />
);

// Lacquer reds, dulled towards bronze so they read as aged wood, not plastic.
const LACQUER = "color-mix(in srgb, var(--hanko) 72%, var(--bronze-deep))";
const LACQUER_LIT = "color-mix(in srgb, var(--hanko-soft) 65%, var(--bronze))";

export default function ScrollRoller({ length = 100, className = "" }) {
  const id = useId().replace(/:/g, "");
  const L = r1(Math.max(60, length));
  const mid = r1(L / 2);
  const end = r1(L - 20);
  const wood = `${id}-wood`;
  const metal = `${id}-metal`;
  const shine = `${id}-shine`;
  const fillMetal = { fill: `url(#${metal})` };
  const lip = { fill: "var(--bronze-light)" };
  const seam = { fill: "none", stroke: "var(--bronze-deep)", strokeWidth: 0.5 };
  const grain = { fill: "none", stroke: "var(--ink)", strokeOpacity: 0.12, strokeWidth: 0.35 };

  // One turned end (knob, collar, ferrule), drawn for the top. The bottom
  // reuses it flipped about the rod's middle.
  const turnedEnd = (
    <>
      <path d="M10.2 8.4 C9.2 6 9.8 2.6 13 1.2 C16.2 2.6 16.8 6 15.8 8.4 Z" style={fillMetal} />
      <ellipse cx="11.9" cy="4.2" rx="0.9" ry="1.6" style={{ fill: "var(--cream)", opacity: 0.55 }} />
      <path d="M7 9.2 L7 12.2 A6 1.4 0 0 0 19 12.2 L19 9.2 Z" style={fillMetal} />
      <ellipse cx="13" cy="9.2" rx="6" ry="1.4" style={lip} />
      <path d="M4 14.8 L4 20.6 A9 1.9 0 0 0 22 20.6 L22 14.8 Z" style={fillMetal} />
      <ellipse cx="13" cy="14.8" rx="9" ry="1.9" style={lip} />
      <path d="M4 17.6 A9 1.9 0 0 0 22 17.6" style={seam} />
    </>
  );

  return (
    <svg viewBox={`0 0 26 ${L}`} aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={wood} x1="0" x2="1" y1="0" y2="0">
          {stop(0, "--hanko-deep")}
          {stop(0.18, LACQUER)}
          {stop(0.36, LACQUER_LIT)}
          {stop(0.6, LACQUER)}
          {stop(0.88, "--hanko-deep")}
          {stop(1, "color-mix(in srgb, var(--hanko-deep) 60%, var(--ink))")}
        </linearGradient>
        <linearGradient id={metal} x1="0" x2="1" y1="0" y2="0">
          {stop(0, "--bronze-deep")}
          {stop(0.25, "--bronze")}
          {stop(0.38, "--bronze-light")}
          {stop(0.48, "--cream")}
          {stop(0.6, "--bronze")}
          {stop(1, "--bronze-deep")}
        </linearGradient>
        <linearGradient id={shine} x1="0" x2="1" y1="0" y2="0">
          {stop(0, "--cream", 0)}
          {stop(0.5, "--cream", 0.5)}
          {stop(1, "--cream", 0)}
        </linearGradient>
      </defs>

      {/* lacquered rod, rounded where it meets each ferrule */}
      <path d={`M4.6 20 A8.4 1.8 0 0 0 21.4 20 L21.4 ${end} A8.4 1.8 0 0 1 4.6 ${end} Z`} style={{ fill: `url(#${wood})` }} />
      <path d={`M8 21.5 C9 ${r1(L * 0.35)} 7.2 ${r1(L * 0.55)} 8.4 ${r1(end - 1.5)}`} style={grain} />
      <path d={`M18.4 21.5 C17.6 ${r1(L * 0.4)} 19.6 ${r1(L * 0.6)} 18.6 ${r1(end - 1.5)}`} style={grain} />
      <rect x="9" y="21" width="2.6" height={r1(L - 42)} style={{ fill: `url(#${shine})` }} />
      <path d="M4.6 20 A8.4 1.8 0 0 0 21.4 20 L21.4 22.6 A8.4 1.8 0 0 1 4.6 22.6 Z" style={{ fill: "var(--ink)", opacity: 0.3 }} />
      <path
        d={`M4.6 ${r1(end - 2.6)} A8.4 1.8 0 0 0 21.4 ${r1(end - 2.6)} L21.4 ${end} A8.4 1.8 0 0 1 4.6 ${end} Z`}
        style={{ fill: "var(--ink)", opacity: 0.3 }}
      />

      {/* emblem */}
      <path d={`M13 ${r1(mid - 5.5)} L16.6 ${mid} L13 ${r1(mid + 5.5)} L9.4 ${mid} Z`} style={fillMetal} />
      <path d={`M13 ${r1(mid - 2.6)} L14.8 ${mid} L13 ${r1(mid + 2.6)} L11.2 ${mid} Z`} style={{ fill: "var(--bronze-deep)" }} />

      {turnedEnd}
      <g transform={`matrix(1 0 0 -1 0 ${L})`}>{turnedEnd}</g>
    </svg>
  );
}
