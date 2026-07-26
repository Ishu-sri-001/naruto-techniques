/**
 * Schematic reference icon for the Kage Bunshin seal: both hands make the
 * same shape — index + middle finger extended together, ring + pinky
 * curled — but held at right angles to each other, crossing like a "+".
 * Stylized, not photorealistic — a quick visual reminder of the pose.
 */
export default function HandSealDiagram({ className, glow = true }) {
  return (
    <svg
      viewBox="0 0 240 220"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Kage Bunshin hand seal: both hands with index and middle fingers extended together, crossed like a plus sign"
    >
      {glow && (
        <>
          <defs>
            <radialGradient id="handSealGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="120" cy="120" r="100" fill="url(#handSealGlow)" />
        </>
      )}

      {/* Horizontal hand, drawn behind, fingers pointing sideways */}
      <g transform="translate(122,142) rotate(88)" fill="#e8ad84">
        <rect x="-24" y="0" width="48" height="44" rx="16" />
        <rect x="-14" y="-92" width="13" height="95" rx="6.5" />
        <rect x="1" y="-98" width="13" height="101" rx="6.5" />
        <rect x="16" y="6" width="22" height="13" rx="6.5" />
        <rect x="16" y="22" width="20" height="12" rx="6" />
        <rect x="-40" y="8" width="18" height="13" rx="6.5" />
      </g>

      {/* Vertical hand, drawn on top, fingers pointing up */}
      <g transform="translate(118,138) rotate(-6)" fill="#f8c497">
        <rect x="-24" y="0" width="48" height="44" rx="16" />
        <rect x="-14" y="-92" width="13" height="95" rx="6.5" />
        <rect x="1" y="-98" width="13" height="101" rx="6.5" />
        <rect x="16" y="6" width="22" height="13" rx="6.5" />
        <rect x="16" y="22" width="20" height="12" rx="6" />
        <rect x="-40" y="8" width="18" height="13" rx="6.5" />
      </g>
    </svg>
  );
}
