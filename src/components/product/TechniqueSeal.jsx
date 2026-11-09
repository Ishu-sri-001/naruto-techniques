/*
 * A technique drawn as a hanko-style seal, inked onto the scroll: a double
 * ring with tick marks, a square cartouche holding the kanji stacked
 * vertically, and a small rank stamp. When `drawn` turns true the rings and
 * cartouche draw themselves in and the kanji press in after them. A sealed
 * (unbuilt) technique is crossed by a paper strip printed with 封.
 */

const EASE = "cubic-bezier(0.6, 0.1, 0, 1)";
const TICKS = Array.from({ length: 16 }, (_, i) => i * 22.5);

function stroke(drawn, delay, width, color, extra = {}) {
  return {
    fill: "none",
    stroke: color,
    strokeWidth: width,
    strokeDashoffset: drawn ? 0 : 1,
    transition: `stroke-dashoffset 1.2s ${EASE} ${delay}s`,
    ...extra,
  };
}

export default function TechniqueSeal({ kanji, rank, sealed = false, drawn = false, className = "" }) {
  const ink = sealed ? "color-mix(in srgb, var(--ink) 55%, transparent)" : "var(--hanko)";
  const chars = [...kanji];
  const size = chars.length > 2 ? 15 : 20;
  const gap = size * 1.15;
  const top = 60 - ((chars.length - 1) * gap) / 2;

  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={`mix-blend-multiply ${className}`}>
      <g transform="rotate(-90 60 60)">
        <circle cx="60" cy="60" r="56" pathLength="1" strokeDasharray="1" style={stroke(drawn, 0, 2.6, ink)} />
        <circle cx="60" cy="60" r="50" pathLength="1" strokeDasharray="1" style={stroke(drawn, 0.15, 1, ink)} />
      </g>
      {TICKS.map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={60 + Math.cos(r) * 50}
            y1={60 + Math.sin(r) * 50}
            x2={60 + Math.cos(r) * (a % 90 === 0 ? 44 : 47)}
            y2={60 + Math.sin(r) * (a % 90 === 0 ? 44 : 47)}
            style={{
              stroke: ink,
              strokeWidth: a % 90 === 0 ? 1.6 : 0.9,
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.4s ease ${0.5 + a / 900}s`,
            }}
          />
        );
      })}
      <rect
        x="36"
        y="30"
        width="48"
        height="60"
        pathLength="1"
        strokeDasharray="1"
        style={stroke(drawn, 0.35, 1.6, ink)}
      />
      {chars.map((c, i) => (
        <text
          key={i}
          x="60"
          y={top + i * gap}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-kanji"
          style={{
            fill: ink,
            fontSize: size,
            opacity: drawn ? 1 : 0,
            transform: drawn ? "scale(1)" : "scale(1.25)",
            transformOrigin: `60px ${top + i * gap}px`,
            transition: `opacity 0.35s ease ${0.8 + i * 0.12}s, transform 0.5s ${EASE} ${0.8 + i * 0.12}s`,
          }}
        >
          {c}
        </text>
      ))}

      {/* rank stamp */}
      <g style={{ opacity: drawn ? 1 : 0, transition: `opacity 0.3s ease 1.25s` }}>
        <rect x="88" y="88" width="20" height="20" rx="1.5" style={{ fill: ink }} />
        <text
          x="98"
          y="98.5"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-mono"
          style={{ fill: "var(--cream)", fontSize: 11 }}
        >
          {rank}
        </text>
      </g>

      {/* paper seal over an unbuilt technique */}
      {sealed && (
        <g
          transform="rotate(-24 60 60)"
          style={{ opacity: drawn ? 1 : 0, transition: `opacity 0.4s ease 1s` }}
        >
          <rect x="49" y="-4" width="22" height="128" style={{ fill: "var(--parchment)", stroke: "var(--bronze)", strokeWidth: 0.6 }} />
          <line x1="60" y1="4" x2="60" y2="42" style={{ stroke: "var(--hanko)", strokeWidth: 0.8 }} />
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-kanji"
            style={{ fill: "var(--hanko)", fontSize: 15 }}
          >
            封
          </text>
          <line x1="60" y1="78" x2="60" y2="116" style={{ stroke: "var(--hanko)", strokeWidth: 0.8 }} />
        </g>
      )}
    </svg>
  );
}
