@AGENTS.md

# Project rules

## Units and type

- Use `vw`, `vh`, `%`, or Tailwind's defined classes (`h-10`, `text-24`, `gap-8`) for
  text sizes, heights, widths — everything. Prefer these over raw `px`.
- Never exceed **one decimal place** in any value. `2.5vw` is fine; `2.55vw` is not.
- Font sizes come from the type scale in `globals.css` (`--fs-*` tokens). Text uses only
  the six type classes: `h1`, `h2`, `h3`, `p-lg`, `p-md`, `p-sm`. Never hand-write a
  font-size or use Tailwind's `text-sm`/`text-lg`/`text-[..]` — change a step in globals instead.
- Type classes set face, size and line-height only. Colour is always a separate class.
- **No bold.** Weight is always 400. Never add `font-medium`, `font-semibold`, `font-bold`,
  `font-black` (or bold canvas fonts) without asking first.
- Colours are CSS vars in `globals.css`. Theme: `ink` (#11110d) and `cream` (#f1e7cf);
  accents `chakra` and `hanko`; derived roles `muted`, `surface`, `rule`, `hanko-soft`.
  Never write a raw hex/rgb value in a component — use the classes or `var(--…)`.

## Responsive

- Use **`max-md:`** for tablet and **`max-sm:`** for mobile.
- Never use `md:`, `sm:`, or `lg:`. The project is desktop-first, narrowing down.
- Never use arbitrary pixel breakpoints like `max-[1025px]:`.

## Scroll animation

- **Never use GSAP `pin`** (`ScrollTrigger: { pin: true }`).
- Instead: a tall outer container (`h-[Nsvh]`) supplies the scroll distance, and an
  inner `sticky top-0 h-screen` container holds what stays on screen. Drive the
  animation with a scrubbed timeline against the outer container.
- Lenis drives scrolling — `components/layout/SmoothScroll.jsx` bridges it to `ScrollTrigger.update()`.
  Any new ScrollTrigger relies on that bridge; don't add a second one.

## Code organization

- Component files are PascalCase and match their component (`Header.jsx` → `export default function Header()`).
  Folders, hooks, `lib/` and `data/` files stay lowercase (`use-media-query.js`).
- Import through the `@/` alias, never relative `./` paths.
- Components live by role: `layout/`, `sections/`, `product/`, `three/`, `ui/`, `animations/`.
- `app/` pages stay server components; interactivity lives in `"use client"` components.
- Import GSAP only from `@/lib/motion` — plugins are registered there once.
- `npm run lint` (ESLint CLI) and `npm run format` (Prettier) before committing.
