# Homepage redesign plan (detailed)

Status: **draft for approval**. No code has been changed yet.
Scope: the homepage (`src/app/page.js`) and the components it uses. The `/train` camera page keeps its current design.

**How to read this document**
- Part A explains the overall direction and the rules every section follows.
- Part B goes through the page section by section. Each section covers: what it is today, what's wrong with it, the new design, layout at each screen size, motion with timings, how it is built, and how we know it's done.
- Part C covers engineering, build order, QA and open decisions.

---

# Part A: Direction

## A1. Design read

> A fan-made landing page for a webcam jutsu trainer, for anime fans who want to try it right now. The look is a manga panel at night: ink-black pages, bone-white type, one chakra-blue accent, a red seal stamp, and Naruto himself in the hero, watching you.

| Setting | Value | Meaning |
|---|---|---|
| Mode | Redesign, visual overhaul | New look and motion. Content, routes and brand colors stay. |
| Design variance | 8 / 10 | Asymmetric layouts, overlap, bleed off edges |
| Motion intensity | 8 / 10 | Choreographed load, scroll scenes, cursor interaction |
| Visual density | 3 / 10 | Airy. One idea per screen. |
| Theme | Dark only | The brand is ink and night, and the camera page is dark |

## A2. Why the current page looks AI-made

| # | Problem | Where it is now | What replaces it |
|---|---|---|---|
| 1 | Small mono uppercase label above every section ("VISION-TRACKED JUTSU…", "HOW TRAINING WORKS", "TECHNIQUES") | Hero, steps, techniques | Real headlines. At most one small label on the whole page. |
| 2 | Hero visual is a decorative SVG ring with a blue glow | Hero right side | **Naruto, large, following your cursor with his eyes and head** |
| 3 | Generic "how it works": three icon circles in a row with `01 02 03` | Steps section | Pinned scroll scene where the seal ring charges up |
| 4 | Three equal cards in a row | Techniques | Asymmetric grid with **live effect previews** |
| 5 | Latin headline set in Noto Serif JP (a kanji font) | `h1` | Condensed display grotesk. Noto Serif JP only for kanji. |
| 6 | Em-dashes in four visible strings | Hero sub, steps intro, techniques intro, sealed card | Rewritten copy (B7) |
| 7 | Two labels for the same action: "Begin training" and "Enter the training grounds" | Nav, hero | One label everywhere: **Start training** |
| 8 | Six hand-drawn icons | Steps, cards | Removed. Live canvases and kanji carry the meaning. |
| 9 | Decorative pulsing dot | Footer | Removed |
| 10 | No max-width container, cramped `py-14` sections | Everywhere | `max-w-[1360px]` container, `py-32 lg:py-40` between sections |
| 11 | Flat background with no texture | Body | Film grain on the whole page + manga focus lines behind Naruto |
| 12 | Almost no motion (two CSS ring spins, one pulse) | | Full motion plan (B8) |

## A3. What stays the same
- Routes `/` and `/train`, and the `#techniques` anchor (links to it keep working).
- Brand colors: `ink`, `panel`, `bone`, `muted`, `chakra`, `hanko`.
- Content: the same two live techniques, the locked Fire Style, the same three steps, the same privacy promise.
- `JutsuSealRing`, now with a real job in section B3.
- All camera, gesture and vision code.

## A4. Visual system

### Typography
| Role | Font | Settings |
|---|---|---|
| Display (h1, h2, big statements) | **Archivo** variable, loaded with `next/font/google`, `axes: ['wdth']` | Weight 800, width ~75 (condensed), sentence case, tracking `-0.01em`, line-height 0.95. Reads like a manga volume cover. |
| Body and UI | Geist (already installed) | 17px body, line-height 1.6, max width 60ch, `text-wrap: pretty` |
| Small data (ranks, status) | Geist Mono | Only real data like "A-rank". Never as a section label. |
| Kanji | Noto Serif JP (already installed) | Kanji only |

Type scale:
| Token | Size | Used for |
|---|---|---|
| `display-xl` | `clamp(2.75rem, 5vw, 4.75rem)` | Hero h1 |
| `display-l` | `clamp(2.25rem, 4vw, 3.75rem)` | Section h2, closing headline (closing goes larger, see B5) |
| `title` | 1.5rem | Tile titles, beat titles |
| `body` | 1.0625rem | Paragraphs |
| `small` | 0.875rem | Captions, footer |

### Color rules
| Token | Value | Allowed on | Never on |
|---|---|---|---|
| `ink` | `#0b0c0f` | Page background | |
| `panel` | `#141519` | Tiles, raised surfaces | |
| `bone` | `#ede8df` | Primary text, outline headline fill | |
| `muted` | `#94908a` | Secondary text | Anything that must be read quickly |
| `chakra` | `#5f9cec` (desaturated from `#4f9dff`) | Links, CTA, focus rings, live effects, the one emphasized phrase in the h1 | Large background areas |
| `hanko` | `#c1272d` | The 術 logo stamp, the 封 seal on the locked talisman | Buttons, links, text |
| Naruto orange | inside the illustration | The illustration only | Any UI |

### Surfaces, shape and spacing
- **Grain:** one fixed, `pointer-events-none` overlay with SVG noise at ~4% opacity over the whole page. Fixed so it never repaints on scroll.
- **Corners:** all sharp (radius 0), matching the square stamp and current CTA.
- **Container:** `max-w-[1360px] mx-auto`, side padding `px-6 sm:px-10 lg:px-16`.
- **Section spacing:** `py-32 lg:py-40`, with bottom padding slightly larger than top.
- **Breakpoints:** mobile below 768px, tablet 768 to 1024px, desktop from 1025px.

## A5. Rules every section follows
- One button label per action. Only "Start training" goes to `/train`.
- No em-dashes in visible text.
- Every animation has a reason (draws attention, tells a story, gives feedback, or shows a change). Decoration-only motion is cut.
- Everything honors `prefers-reduced-motion`. The page must look complete with zero motion.
- Only `transform`, `opacity` and `clip-path` are animated.
- No `scroll` event listeners. Scroll motion uses GSAP ScrollTrigger.

---

# Part B: Section by section

Page order:

| # | Section | Layout family | Signature motion |
|---|---|---|---|
| B1 | Nav | Split bar, 64px | Stamp-in logo, blur after scroll |
| B2 | **Hero** | Asymmetric split, Naruto bleeds off the right and bottom | **Naruto watches the cursor** |
| B3 | How a jutsu fires | Pinned scroll scene | Seal ring charges in three beats |
| B4 | Techniques | Asymmetric 3-tile grid | Live Rasengan and Shadow Clone |
| B5 | Closing call | Full-width poster | Outline headline fills, Naruto peeks up |
| B6 | Footer | One row | None |

Each section uses a different layout family, so the page never repeats itself.

---

## B1. Navigation

### Today
Logo text on the left and a "Begin training →" text link on the right. No sticky behavior, no background.

### Problems
- The label "Begin training" doesn't match the hero's "Enter the training grounds" (same action, two names).
- The bar disappears on scroll, so the only CTA is gone after the hero.

### New design
```
┌──────────────────────────────────────────────────────────────────┐
│ [術] Naruto Techniques                  Techniques   [Start training] │
└──────────────────────────────────────────────────────────────────┘
```
- **Left:** the 術 stamp (hanko red square, bone kanji) + "Naruto Techniques" in Geist medium.
- **Right:** "Techniques" text link (scrolls to `#techniques`) + **Start training** button (chakra outline, fills on hover).
- **Sticky:** the bar sticks to the top. Over the hero it's transparent. After 40px of scroll it gets an `ink/80` background, backdrop blur and a 1px bone/10 bottom border.
- Height 64px on all screens.

### Layout by screen
| Screen | Change |
|---|---|
| Desktop | As drawn |
| Tablet | Same |
| Mobile | "Techniques" link hidden. Stamp + wordmark + smaller Start training button. |

### Motion
| What | Timing | Reduced motion |
|---|---|---|
| Stamp "stamps" in on load: scale 1.3 to 1, rotate -6° to 0, opacity 0 to 1 | 0.35s, `back.out(2)`, starts at 0s | Shown immediately |
| Background + blur appear after 40px scroll | 0.25s fade | Instant switch |
| Start training: magnetic pull toward cursor (max 6px), press scale 0.98 | Spring, stiffness 300, damping 20 | Color change only |

### Done when
- The nav is on one line at every width.
- The text is readable over every section after scrolling.
- Keyboard focus shows a chakra focus ring on both links.

---

## B2. Hero: Naruto who watches you

This is the centerpiece of the redesign. Naruto is the main visual, large and close, with his face and eyes following the visitor's cursor so it feels like he's looking at you.

> **Update (implemented):** the hero now uses the supplied painting (`public/images/naruto/hero.webp`) full-bleed instead of the layered vector illustration described below. The irises are redrawn on a small canvas over the painting so they follow the cursor; the whole painting drifts slightly toward the cursor, and animated embers float in front. Blinking, head turning and mouth changes from the vector version are not possible with a flat painting and were dropped. Tablets use the phone layout (face centered, text at the bottom); side-by-side starts at 1024px.

### Today
Three-line serif headline on the left, the rotating seal ring with a blue glow on the right, an eyebrow label above, and two CTAs with different wording from the nav.

### Problems
- Nothing to look at: a decorative ring isn't a hero visual.
- The headline is three lines in a kanji font.
- Eyebrow + headline + paragraph + two CTAs is the standard AI template layout.
- Nothing reacts to the visitor, even though the product is about being watched by a camera.

### Concept
The product watches your hands through the camera. The hero shows that idea before you even open the camera: **Naruto watches your cursor.** Move the mouse and his eyes follow it, his head turns toward it, his hair and headband shift with depth. He blinks. If you go idle, he glances around. When you hover **Start training**, he looks straight at the button.

### Composition (desktop)
```
┌──────────────────────────────────────────────────────────────────────┐
│ [術] Naruto Techniques                    Techniques  [Start training] │
├──────────────────────────────────────────────────────────────────────┤
│                                    \    \     |     /    /             │
│                                  -- focus lines radiate from head --  │
│                                      ┌──────────────────────┐         │
│  Form the seal.                      │   spiky hair (back)  │         │
│  Watch the jutsu happen.             │  ┌──[ leaf headband ]─┐│         │
│                                      │  │   (o)      (o)    ││  <- eyes follow
│  Hold a hand sign to your webcam     │  │   ≡   \__/   ≡    ││     the cursor
│  and the technique plays out live    │  └────────────────────┘│         │
│  on your feed. Nothing leaves your   │      neck + collar     │         │
│  device.                             │   orange jacket, cut   │         │
│                                      │   off by the bottom    │         │
│  [Start training →]  See the techniques   edge of the screen   │         │
└──────────────────────────────────────┴──────────────────────────────────┘
```

| Element | Placement | Size |
|---|---|---|
| Naruto bust | Columns 6 to 12, overflows off the right edge and the bottom edge | Height ~92% of the hero; his eye line sits at ~38% from the top of the screen |
| Focus lines | Behind Naruto, centered on his head, covering the right 65% of the hero | Full hero height |
| Chakra light | Soft radial blue glow behind his head, 12% opacity | ~50vh circle |
| Headline | Columns 1 to 7, vertically centered slightly above the middle | `display-xl`, exactly 2 lines |
| Subtext | Under the headline | Max 20 words, max 46ch wide |
| CTAs | Under the subtext | Start training (filled chakra) + "See the techniques" (text link) |

- The text column sits above Naruto (higher z-index). The headline may overlap his shoulder, **never his face**.
- Hero height `min-h-[100dvh]`. Everything including the CTA fits in the first screen at 1280×720.
- No eyebrow label. No badge. Nothing under the CTAs.

### The Naruto illustration
Style: **flat cel-shaded poster art**. Heavy ink outlines (3 to 4px at desktop size), two-tone shading (base + one shadow tone), no gradients on the character. Facing three-quarters toward the viewer, slightly turned toward the text, so it looks like he's reading the headline with you until the cursor moves.

Details that make him read as Naruto:
- Spiky blond hair, back spikes and front bangs on separate layers
- Leaf-village forehead protector: dark blue cloth, metal plate with the leaf symbol
- Blue eyes
- Three whisker marks on each cheek
- Orange and black jacket collar, cut off by the bottom edge
- Default expression: confident half-grin

### Layer anatomy
The illustration is one inline SVG (`viewBox="0 0 600 720"`) built from named groups. Each layer moves by a different amount. Parts closer to the viewer move more, and that difference is what makes a flat drawing look like a head turning in 3D.

| z | Layer id | Contains | Moves toward cursor? | Range (SVG units) | Smoothing |
|---|---|---|---|---|---|
| 1 | `hair-back` | Spikes behind the head | **Opposite** direction | x ±6, y ±3 | 0.9s |
| 2 | `body` | Neck, collar, jacket | Barely | x ±2 | 1.0s |
| 3 | `head` | Face shape, ears, whiskers, nose, mouth | Yes + tilt | x ±10, y ±6, rotate ±4° | 0.6s |
| 4 | `eye-whites` | Both eye whites (also the clip mask for the irises) | With head | (inherits head) | |
| 5 | `irises` | Blue irises, pupils, highlight dots | Yes, clipped inside the whites | x ±11, y ±7 | 0.25s |
| 6 | `eyelids` | Upper lids, skin-colored | Blink only | scaleY 0 to 1 | 0.07s each way |
| 7 | `brows` | Eyebrows | Up when cursor is high | y ±3 | 0.4s |
| 8 | `mouth-alt` | Alternate mouths: grin, surprised "o" | Swapped by state | n/a | instant |
| 9 | `headband` | Cloth band and metal plate | Most | x ±14, y ±8, rotate ±3° | 0.5s |
| 10 | `bangs-front` | Front hair spikes over the headband | Most, with slight lag | x ±16, y ±9 | 0.7s |

Highlights in the irises stay still while the iris moves. This small detail stops the eyes from looking painted on.

### How the tracking works
1. **Find the face.** On mount and on resize, measure the center point between the eyes in screen pixels and cache it.
2. **Read the cursor.** On `pointermove`, take the cursor's distance from that center.
3. **Normalize.** Divide by a "reach" distance (60% of the viewport width horizontally, 50% of the height vertically) to get `dx` and `dy` between -1 and 1.
4. **Soften.** Apply an ease curve (`Math.tanh(value * 1.6)`). The eyes respond strongly near his face and slow down near the edges instead of slamming into the corners.
5. **Move each layer.** Multiply `dx` and `dy` by each layer's range from the table and send it to that layer's `gsap.quickTo`. Pupils are quick, hair is slow. That lag is what gives the head weight.

Code sketch:
```js
// NarutoWatcher.jsx (client). Sketch only, not final code.
const setters = LAYERS.map((l) => ({
  x: gsap.quickTo(l.el, "x", { duration: l.dur, ease: "power3.out" }),
  y: gsap.quickTo(l.el, "y", { duration: l.dur, ease: "power3.out" }),
  r: l.rotate ? gsap.quickTo(l.el, "rotation", { duration: l.dur, ease: "power3.out" }) : null,
  l,
}));

function look(dx, dy) {
  for (const s of setters) {
    s.x(dx * s.l.rangeX * s.l.dir); // dir = -1 for hair-back
    s.y(dy * s.l.rangeY);
    s.r?.(dx * s.l.rotate);
  }
}

function onPointerMove(e) {
  const dx = Math.tanh(((e.clientX - face.x) / reachX) * 1.6);
  const dy = Math.tanh(((e.clientY - face.y) / reachY) * 1.6);
  look(dx, dy);
  resetIdleTimer();
}
```

### Behavior states
| State | Trigger | What Naruto does |
|---|---|---|
| **Intro** | Page load | Rises into frame, blinks once, then tracking starts |
| **Tracking** | Cursor moving anywhere on the page while the hero is visible | Eyes, head, hair and headband follow the cursor |
| **CTA lock** | Hover or keyboard focus on any Start training button in view | Looks straight at the button center and ignores the cursor until it leaves |
| **Close up** | Cursor over his face | Eyes go slightly cross-eyed toward the cursor and his grin widens (`mouth-alt` grin). Small comic touch. |
| **Click on him** | Click or tap on his face | Surprised "o" mouth + brows up for 600ms, quick double blink |
| **Idle** | No movement for 4s | Glances to a random spot, holds 1.2s, then looks back at the CTA. Repeats every 4 to 7s. |
| **Cursor left** | Pointer leaves the window | Drifts back to center over 1.2s |
| **Off screen** | Hero scrolled out of view | Listener detached, no work done |
| **Touch device** | No hover available | Follows each tap or drag point, idles otherwise. No gyroscope (iOS asks for permission, too heavy for a hero). |
| **Reduced motion** | `prefers-reduced-motion: reduce` | Static. Looking slightly toward the headline. No blinking. |

**Blinking:** random interval of 2.5 to 6s. 15% of blinks are doubles. One blink = eyelids scaleY 0 to 1 to 0 in 140ms, with the irises nudged 1 unit down at the same time (real eyes dip when blinking).

### Focus lines
- About 90 thin dark wedges radiating from Naruto's head, like the speed lines manga uses to put focus on a character.
- Generated in code from a seed (random angles, widths and lengths within limits), drawn as one SVG.
- They "boil" at 8fps: every 125ms each line gets a tiny random offset. That mimics hand-drawn animation. Reduced motion: static.
- Lines are bone at 6% opacity, so they add texture without competing with the text.

### Load timeline
| Time | What happens |
|---|---|
| 0.00s | Nav stamp stamps in |
| 0.10s | Headline line 1 rises out of a mask (SplitText lines, yPercent 110 to 0, `expo.out`, 0.9s) |
| 0.18s | Headline line 2 rises the same way |
| 0.35s | Focus lines draw outward from the head (scale 0.6 to 1, opacity 0 to 1, 1.0s) |
| 0.45s | Naruto rises 60px and fades in (0.9s, `power3.out`) |
| 0.60s | Subtext and CTAs fade up 12px (0.6s, stagger 0.08s) |
| 1.30s | Naruto blinks once |
| 1.45s | Cursor tracking turns on |

Total under 1.5s. Reduced motion: everything visible at 0s with no movement.

### Layout by screen
| Screen | Layout |
|---|---|
| Desktop (1025px and up) | As drawn. Text left, Naruto right, bleeding off the right and bottom edges. |
| Tablet (768 to 1024px) | Stacked like mobile (Naruto on top, text below), centered vertically. Overlapping him behind the text covered his face at this width. |
| Mobile (below 768px) | Stacked. Naruto on top at ~46vh, cropped at the collar, eyes at ~22% from the top. Headline, subtext and CTAs below. Still fits in one screen at 390×844. Tracking follows taps. |

### Copy
- **h1:** Form the seal. / Watch *the jutsu happen.* (the second half of line 2 in chakra blue)
- **Sub:** Hold a hand sign to your webcam and the technique plays out live on your feed. Nothing leaves your device.
- **CTAs:** Start training · See the techniques

### Accessibility
- The SVG has `role="img"` and the label: "Illustration of Naruto Uzumaki. His eyes follow your cursor."
- All motion is decorative. Nothing in the hero needs the cursor to work.
- Keyboard focus on the CTA triggers CTA lock, so keyboard users get the same moment.

### Done when
- At 1280×720, the headline is 2 lines and the CTA is visible without scrolling.
- Moving the cursor in a full circle around Naruto makes his eyes and head follow smoothly, with no jitter and no snapping.
- Hovering Start training makes him look at it within 0.3s.
- He blinks at irregular intervals.
- With reduced motion on, nothing moves and the hero still looks finished.
- Performance panel shows no long tasks during cursor movement.

---

## B3. How a jutsu fires (pinned scroll scene)

### Today
A small mono heading "HOW TRAINING WORKS", a short paragraph, and three steps in a row, each with an icon in a circle, a number (`01 02 03`) and a kanji numeral.

### Problems
- The "three icons in a row" step layout appears on almost every AI-generated landing page.
- The numbered labels repeat what the order already shows.
- The copy says "chakra builds through the seal and releases on the last step", but nothing on screen shows that.

### Concept
Show that sentence. The seal ring from the old hero moves here and charges up as you scroll: first the camera locks on, then the seal forms, then the jutsu releases. The ring's six kanji already spell 螺旋丸 (Rasengan) and 影分身 (Kage Bunshin), the two techniques the app recognizes, so the ring lighting up shows what the app does.

### Composition (desktop)
```
The section pins to the screen for about 2.5 screen-heights of scrolling.

┌──────────────────────────────────┬─────────────────────────────────┐
│ How a jutsu fires                │                                 │
│                                  │        ╭───── 螺 ─────╮          │
│ Allow the camera.                │      身 ·   reticle   · 旋       │
│ Grant access once. Tracking runs │      │     ( core )     │        │
│ in your browser, so your video   │      分 ·             · 丸       │
│ never leaves the device.         │        ╰───── 影 ─────╯          │
│                                  │                                 │
│ (beats 2 and 3 replace this text │   ring ~ 70% of screen height   │
│  as you scroll)                  │                                 │
└──────────────────────────────────┴─────────────────────────────────┘
```

### The three beats
| Scroll progress | Ring | Text (left) |
|---|---|---|
| 0 to 33% | **Camera locks on.** The outer reticle circle draws itself around (DrawSVG 0 to 100%). The 24 tick marks appear in sequence like a lens focusing. A faint viewfinder frame tightens around the ring. | **Allow the camera.** Grant access once. Tracking runs in your browser, so your video never leaves the device. |
| 33 to 66% | **The seal forms.** The six kanji light up one at a time (bone at 20% to full chakra blue). The middle ring clicks 60° per kanji, like a dial locking into place. | **Form the seal.** Match the hand sign and hold it steady for a moment. |
| 66 to 100% | **Release.** The core swells (scale 0.6 to 1.25) and brightens. At the very end a thin shockwave ring bursts outward (scale 1 to 3, opacity to 0) and the pin releases. | **Watch it land.** The technique plays out over your own camera feed, live. |

Text swaps: the current beat slides up 24px and fades out while the next slides in from 24px below (0.4s). A thin vertical bar on the left edge of the text fills as you scroll, which shows progress without numbers.

### Layout by screen
| Screen | Layout |
|---|---|
| Desktop | Pinned. Text left (columns 1 to 5), ring right (columns 6 to 12). |
| Tablet | Pinned, ring smaller and centered behind the text with a dark scrim. |
| Mobile | **Not pinned** (pinning on phones feels stuck). The ring sits sticky at the top at ~38vh, and the three beats scroll underneath as normal blocks. The ring still charges with scroll progress. |
| Reduced motion | No pin, no scrub. Three beats stacked, ring shown fully charged. |

### How it's built
- `SealSequence.jsx` (client). One GSAP timeline with `scrollTrigger: { trigger, start: "top top", end: "+=250%", pin: true, scrub: 0.6 }`.
- `JutsuSealRing` gets `data-part` attributes (`outer`, `ticks`, `middle`, `kanji`, `core`) so GSAP can target pieces. Its CSS spin turns off here via a `spin={false}` prop, so CSS and GSAP never rotate the same element.
- `gsap.matchMedia()` switches between the desktop pin and the mobile sticky version.

### Done when
- Scrolling down and back up plays the scene forward and backward without jumps.
- The pin starts exactly when the section's top hits the top of the screen.
- No layout shift when the pin releases into the techniques section.

---

## B4. Techniques (`#techniques`)

### Today
A small mono "TECHNIQUES" label, "2 of 3 stamped and trainable", an intro line with an em-dash, then three equal cards with hand-drawn icons: Kage Bunshin, Rasengan, and a hatched "SEALED" Fire Style card.

### Problems
- Three equal cards in a row is the most common AI layout.
- The icons are drawings of the effects when the real effects already exist in the code.
- The two working techniques and the locked one get the same visual weight.

### Concept
A ninja registry where the entries are alive. The tiles run **the actual effect code from the camera page**, so visitors see exactly what they'll get, driven by the cursor instead of a hand.

### Composition (desktop)
```
Techniques
Two are ready to train. One is still sealed.

┌─────────────────────────────────────┬──────────────────────────┐
│                                     │  KAGE BUNSHIN            │
│          ( live Rasengan )          │  [ clones of Naruto puff │
│         sphere drifts toward        │    out in smoke on hover ]│
│          your cursor here           │                          │
│                                     │  Kage Bunshin  影分身  B  │
│                                     │  Cross both hands...     │
│                                     ├──────────────────────────┤
│  Rasengan  螺旋丸            A-rank  │ ▨▨▨▨ ┌──────┐ ▨▨▨▨▨▨▨▨ │
│  Clench one fist, then open that    │ ▨▨▨▨ │  封  │ talisman ▨ │
│  palm face-up. A sphere forms...    │  Fire Style 火遁          │
│                                     │  Not trainable yet.       │
└─────────────────────────────────────┴──────────────────────────┘
12 columns: Rasengan 7 (spans 2 rows), right column 5. 3 items, 3 tiles, no gaps.
```

### Tile details
**Rasengan (large tile)**
- Full-tile canvas running the real `RasenganEffect`.
- The sphere sits in the upper middle and drifts toward the cursor while it's inside the tile (smoothed, so it trails like it has mass). When the cursor leaves, it floats back.
- Pressing the mouse button makes it swell 15% while held.
- Text at the bottom: name, kanji, "A-rank" in Geist Mono, how to perform it.

**Kage Bunshin**
- Canvas running the real `ShadowCloneEffect`, with the Naruto illustration as the clone image instead of the webcam cutout.
- Idle: one faint Naruto silhouette.
- Hover (desktop) or tap (touch): smoke burst, then four clones fan out, hold, and fade, exactly like on the camera page. Can be triggered again after it finishes.
- Small hint: "Hover or tap to summon."

**Fire Style (locked)**
- Diagonal hatch pattern background (the current one, kept).
- A paper talisman (ofuda) strip across the tile, stamped 封 ("seal") in hanko red.
- Hover: the talisman flutters (rotate ±2°, three quick cycles) but stays shut. The tile says "locked" through motion, not a badge.
- Text: Fire Style 火遁. Not trainable yet.

### Motion
| What | Timing | Reduced motion |
|---|---|---|
| Tiles enter: clip-path wipe from bottom (`inset(100% 0 0 0)` to `inset(0)`) | 0.9s, `expo.out`, stagger 0.1s, starts when the grid is 75% down the screen | Visible |
| Rasengan follows the cursor | Continuous, canvas | One still frame |
| Clone summon | On hover or tap, ~4.3s cycle | Still frame with clones visible |
| Talisman flutter | 0.5s on hover | None |

### Layout by screen
| Screen | Layout |
|---|---|
| Desktop | As drawn |
| Tablet | Rasengan full width on top, the other two side by side below |
| Mobile | Single column: Rasengan, Kage Bunshin, Fire Style. Canvases at 4:3. |

### How it's built
- `TechniqueGrid.jsx` (server) for the layout and text, with three client islands: `RasenganPreview`, `ShadowClonePreview`, `SealedTalisman`.
- Two small **additive** changes to the effect classes. Neither changes how `/train` behaves:
  - `RasenganEffect.hold(now, pos, size)`: keeps the sphere alive at a given position without a detected hand.
  - `ShadowCloneEffect.useStaticSprite(source)`: uses an image instead of the live webcam cutout.
- Each canvas runs its animation loop only while visible (IntersectionObserver) and matches the device pixel ratio for sharpness.

### Done when
- Both previews look identical to the effects on `/train`.
- Scrolling past the grid stops both canvas loops (checked in the Performance panel).
- `/train` still triggers both techniques correctly.

---

## B5. Closing call

### Today
None. The page ends with the cards and then the footer.

### Problems
After reading about the techniques, there's no clear final push to try it.

### New design
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Clear some space.                                              │
│   Raise your hands.            (outline text fills as you scroll)│
│                                                                  │
│   [ Start training → ]                                           │
│                                                       ( o  o )   │
│                                               Naruto peeks up ───┘
└──────────────────────────────────────────────────────────────────┘
```
- Headline in Archivo at `clamp(3rem, 8vw, 7.5rem)`, left-aligned, two lines.
- It starts as an outline (1.5px bone stroke, transparent fill) and fills with solid bone from left to right as the section scrolls into view (scrubbed). The fill reaches 100% when the headline is in the middle of the screen.
- One Start training button.
- **Naruto peeks:** the same rig as the hero, smaller, only the top of his head and his eyes above the bottom-right edge. He slides up when the section is 60% visible and watches the cursor. Hover the button and he looks at it. This bookends the hero.

### Layout by screen
| Screen | Layout |
|---|---|
| Desktop | As drawn |
| Tablet | Same, Naruto smaller |
| Mobile | Headline 2 to 3 lines at a smaller size, Naruto peek at ~30vw wide |
| Reduced motion | Headline filled, Naruto static |

### Done when
- The outline fill is smooth both scrolling down and up.
- Only one Naruto rig is active at a time (the hero rig is off screen by then).

---

## B6. Footer

### Today
A pulsing blue dot and one privacy line.

### New design
One quiet row, `small` text, muted color, bone/10 top border:
- Left: "Hand tracking runs on your device with MediaPipe. Nothing is uploaded."
- Right: "Unofficial fan project. Naruto belongs to Masashi Kishimoto and Shueisha."

On mobile the two lines stack. No dot, no motion.

---

## B7. Complete copy

| Spot | Text |
|---|---|
| Nav | Naruto Techniques · Techniques · **Start training** |
| Hero h1 | Form the seal. / Watch the jutsu happen. |
| Hero sub | Hold a hand sign to your webcam and the technique plays out live on your feed. Nothing leaves your device. |
| Hero links | **Start training** · See the techniques |
| B3 heading | How a jutsu fires |
| Beat 1 | **Allow the camera.** Grant access once. Tracking runs in your browser, so your video never leaves the device. |
| Beat 2 | **Form the seal.** Match the hand sign and hold it steady for a moment. |
| Beat 3 | **Watch it land.** The technique plays out over your own camera feed, live. |
| B4 heading | Techniques |
| B4 sub | Two are ready to train. One is still sealed. |
| Rasengan | Rasengan 螺旋丸 · A-rank · Clench one fist, then open that palm face-up. A sphere forms above your hand and follows it. |
| Kage Bunshin | Kage Bunshin 影分身 · B-rank · Cross both hands at a right angle, a finger or two raised on each. Hold it and clones fan out around you. · Hover or tap to summon. |
| Fire Style | Fire Style 火遁 · Not trainable yet. |
| Closing | Clear some space. Raise your hands. · **Start training** |
| Footer | Hand tracking runs on your device with MediaPipe. Nothing is uploaded. · Unofficial fan project. Naruto belongs to Masashi Kishimoto and Shueisha. |
| Naruto alt text | Illustration of Naruto Uzumaki. His eyes follow your cursor. |

## B8. Motion overview

**Which library does what**
- **GSAP** (with ScrollTrigger, SplitText, DrawSVG): load timeline, Naruto rig, focus lines, pinned seal scene, tile reveals, talisman, closing fill, Naruto peek.
- **Motion:** only `MagneticButton` (the Start training button's magnetic pull and press spring).
- No element is ever animated by both.

| # | Moment | Library | Purpose |
|---|---|---|---|
| 1 | Load timeline | GSAP | Reading order: brand, message, character |
| 2 | Naruto follows cursor | GSAP `quickTo` | Shows the product idea (being watched) in one gesture |
| 3 | Focus lines boil | GSAP ticker at 8fps | Hand-drawn manga texture |
| 4 | Button magnet + press | Motion | Feedback on the one action that matters |
| 5 | Nav background on scroll | GSAP ScrollTrigger | Readability |
| 6 | Seal ring charges | GSAP pin + scrub | Tells the three-step story |
| 7 | Tile wipes | GSAP batch | Reveal in reading order |
| 8 | Live Rasengan / clones | Canvas (existing effect code) | Real product preview |
| 9 | Talisman flutter | GSAP | Shows "locked" physically |
| 10 | Closing outline fill | GSAP scrub | Pulls the eye to the last CTA |
| 11 | Naruto peek | GSAP | Bookends the page |

---

# Part C: Engineering, build order, decisions

## C1. Dependencies
```bash
npm install gsap@^3.15.0 @gsap/react@^2.1.2 motion@^14.7.1
```
SplitText and DrawSVG are included in the `gsap` package (all plugins are free since 3.13). No smooth-scroll library: native scroll is simpler and more accessible.

## C2. Files

**New** (under `src/components/home/` unless noted)
| File | Type | Job |
|---|---|---|
| `src/lib/gsap.js` | client module | Registers GSAP plugins once |
| `SiteNav.jsx` | client | Nav and its scroll state |
| `Hero.jsx` | client | Hero layout and load timeline |
| `NarutoWatcher.jsx` | client | The tracking rig: states, blinking, idle, CTA lock. `mode="hero"` or `"peek"`. |
| `naruto/NarutoArt.jsx` | markup only | The layered SVG. No logic, so the art can be swapped. |
| `naruto/layers.js` | data | Layer ranges and smoothing from the B2 table, tunable in one place |
| `FocusLines.jsx` | client | Manga focus lines |
| `SealSequence.jsx` | client | Pinned ring scene |
| `TechniqueGrid.jsx` | server | Grid layout and text |
| `RasenganPreview.jsx` | client | Live Rasengan canvas |
| `ShadowClonePreview.jsx` | client | Live Shadow Clone canvas |
| `SealedTalisman.jsx` | client | Locked Fire Style tile |
| `ClosingCall.jsx` | client | Closing section |
| `MagneticButton.jsx` | client (Motion) | The Start training button |
| `Footer.jsx` | server | Footer |

**Changed**
| File | Change |
|---|---|
| `src/app/page.js` | Composes the sections. Inline icons and data removed. Stays a server component. |
| `src/app/layout.js` | Adds Archivo, a skip-to-content link, Open Graph metadata |
| `src/app/globals.css` | New tokens, type scale, grain overlay. Old step-badge CSS removed. |
| `src/components/JutsuSealRing.js` | `data-part` hooks and a `spin` prop |
| `src/lib/effects/rasenganEffect.js` | Adds `hold()` (additive) |
| `src/lib/effects/shadowCloneEffect.js` | Adds `useStaticSprite()` (additive) |

**Unchanged:** `/train`, `CameraStage`, all gesture and vision code.

## C3. Engineering rules
- Every animated piece is its own `"use client"` component. GSAP runs through `useGSAP` with a scope, so all tweens and ScrollTriggers are cleaned up on unmount.
- `gsap.matchMedia()` handles desktop, mobile and reduced motion in one place per component.
- `ScrollTrigger.refresh()` runs after `document.fonts.ready`, so pins are measured with the final font.
- Before writing code, check the relevant Next 16 guides in `node_modules/next/dist/docs/` (per `AGENTS.md`).
- Performance targets: LCP under 2.5s (the server-rendered headline is the LCP element), CLS under 0.1 (Naruto's box has a fixed aspect ratio), no long tasks during cursor movement.

## C4. Build order
Each phase is a separate step you can review.

| Phase | Work | You can check |
|---|---|---|
| 1. Foundation | Dependencies, fonts, tokens, grain, container, copy cleanup, nav, single CTA label | New type and nav, no em-dashes |
| 2. Hero + Naruto | Illustration layers, tracking, blinking, idle, CTA lock, close-up and click reactions, touch, reduced motion, load timeline | The cursor-following Naruto |
| 3. Seal scene | Pinned desktop version, sticky mobile version | Scroll the three beats |
| 4. Techniques | Grid, live previews, talisman | Play with both previews |
| 5. Closing + footer | Outline fill, Naruto peek, footer | End of page |
| 6. QA | Checklist below | Final pass |

## C5. QA checklist
- [ ] Widths 1440, 1280×720 (hero fits without scrolling), 1024, 768, 390
- [ ] Reduced motion on: no movement anywhere and the page still looks finished
- [ ] Keyboard only: logical tab order, visible focus rings, Naruto looks at the focused CTA
- [ ] Touch device: Naruto follows taps, the clone tile summons on tap
- [ ] `/train` still triggers both Rasengan and Kage Bunshin
- [ ] `npm run lint` and `npm run build` pass
- [ ] Lighthouse: LCP under 2.5s, CLS under 0.1
- [ ] Canvas loops and the Naruto listener stop when off screen
- [ ] Zero em-dashes in visible text

## C6. Naruto artwork

The rig needs the illustration split into the layers listed in B2.

**Option A (default unless you say otherwise): I build the layered SVG.**
Flat cel-shaded poster style with heavy ink outlines, built directly to the layer list. Fast and fully animatable.
Trade-off: it's a stylized vector version, not illustrator quality. Because the layer names are fixed, real art can replace it later without code changes.

**Option B: you provide the art.**
Either an SVG with groups named as in the B2 layer table, or one transparent PNG per layer, all on the same canvas size (for example 1200×1440). The eye whites must be a separate shape so the irises can be clipped inside them. Include the alternate grin and "o" mouths if you want the close-up and click reactions.

Either way, use original fan art (yours, commissioned, or licensed), not cut-up frames from the anime or manga. The site shows it publicly, and the footer credits the original creator.

## C7. Out of scope
- Redesigning the `/train` camera page
- Light mode
- Smooth-scroll libraries
- New techniques

## C8. Decisions to confirm when approving
1. **Naruto art:** Option A (I build it) or Option B (you provide it)? Default: A.
2. **Headline font:** Archivo condensed, or keep Geist everywhere? Default: Archivo.
3. **Hero extras:** keep the close-up grin and the click "surprised" reaction? Default: keep.
4. Anything in Part B you want cut or changed?
