/*
 * The Hidden Leaf mark: a spiral whose outer stroke breaks into a leaf tip.
 * Drawn as a single stroke in currentColor, so it takes any text colour.
 */
export default function KonohaMark({ className = "", strokeWidth = 5 }) {
  return (
    <svg
      viewBox="8 14 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M54 58a5 5 0 0 1 10 0a10 10 0 0 1-20 0a15 15 0 0 1 30 0a20 20 0 0 1-40 0L14 22l34.4 25.4" />
    </svg>
  );
}
