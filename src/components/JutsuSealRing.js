const RING_CHARACTERS = [
  { char: "螺", angle: 0 },
  { char: "旋", angle: 60 },
  { char: "丸", angle: 120 },
  { char: "影", angle: 180 },
  { char: "分", angle: 240 },
  { char: "身", angle: 300 },
];

const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

function polar(radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 200 + radius * Math.cos(rad), y: 200 + radius * Math.sin(rad) };
}

/**
 * The hero's signature element: half jutsu summoning seal, half hand-tracking
 * reticle. The six inscribed characters spell the two techniques the app can
 * actually recognize today — 螺旋丸 (Rasengan) and 影分身 (Kage Bunshin) —
 * so the ring isn't decoration, it's a legend for what's live below the fold.
 */
export default function JutsuSealRing({ className }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Rotating seal ring inscribed with the kanji for Rasengan and Kage Bunshin, the two techniques currently recognized"
    >
      <defs>
        <radialGradient id="chakraCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4f9dff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#4f9dff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4f9dff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="130" fill="url(#chakraCore)" />

      {/* outer reticle ring, tracking-style tick marks */}
      <g className="seal-ring-outer">
        <circle cx="200" cy="200" r="188" fill="none" stroke="#4f9dff" strokeOpacity="0.35" strokeWidth="1" />
        {TICKS.map((angle) => {
          const outer = polar(188, angle);
          const inner = polar(angle % 90 === 0 ? 172 : 180, angle);
          return (
            <line
              key={angle}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#4f9dff"
              strokeOpacity={angle % 90 === 0 ? 0.75 : 0.35}
              strokeWidth={angle % 90 === 0 ? 1.5 : 1}
            />
          );
        })}
      </g>

      {/* middle ring, inscribed with the technique kanji */}
      <g className="seal-ring-middle">
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="#ede8df"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
        {RING_CHARACTERS.map(({ char, angle }) => {
          const { x, y } = polar(150, angle);
          return (
            <text
              key={char}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="var(--font-display)"
              fontSize="20"
              fill="#ede8df"
              fillOpacity="0.65"
            >
              {char}
            </text>
          );
        })}
      </g>

      {/* inner ring, static */}
      <circle cx="200" cy="200" r="108" fill="none" stroke="#4f9dff" strokeOpacity="0.55" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="4" fill="#ede8df" />
    </svg>
  );
}
