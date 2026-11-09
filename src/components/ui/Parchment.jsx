/*
 * Aged parchment in a bronze-edged mount: fine grain and mottling, a gentle
 * bow (lit along the top, shaded at the bottom), darker aged edges, and
 * shading where it curls into a roller on each side. Children sit above the
 * shading layers. `className` sizes and places the mount; `paperClassName`
 * lays out the paper's contents.
 */
export default function Parchment({ as: Tag = "span", className = "", paperClassName = "", style, children }) {
  // Callers may place the mount absolutely; only default to `relative`.
  const position = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className) ? "" : "relative";
  return (
    <Tag
      style={style}
      className={`${position} flex bg-linear-to-b from-bronze via-bronze-deep to-bronze-deep p-[0.2rem] ${className}`}
    >
      <span
        className={`paper-grain relative flex min-w-0 flex-1 bg-parchment bg-blend-multiply ring-1 ring-bronze/50 ring-inset ${paperClassName}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-cream/35 via-transparent to-bronze-deep/25"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at center, transparent 50%, color-mix(in srgb, var(--bronze) 35%, transparent) 100%)",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-linear-to-r from-bronze-deep/55 via-bronze-deep/15 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-linear-to-l from-bronze-deep/55 via-bronze-deep/15 to-transparent"
        />
        {children}
      </span>
    </Tag>
  );
}
