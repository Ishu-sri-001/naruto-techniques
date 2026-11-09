# Naruto Techniques — Homepage Redesign Brief

## Project goal

Redesign the existing Naruto Techniques homepage into an immersive, polished, anime-inspired experience. The site should feel like entering the Naruto world—not like a generic landing page or a collection of unrelated cards.

The main visual idea is **“Naruto is watching you.”** The hero character looks toward the visitor and subtly follows their cursor. As the visitor scrolls, the page should feel like one continuous journey through the shinobi world.

The experience must feel intentionally art-directed and handcrafted. Avoid generic AI-looking compositions, excessive glow, random particles, overused glassmorphism, and repetitive card grids.

## Important asset instruction

I will provide the final images and visual assets separately.

**For now, use only the two images already provided with this project/conversation as temporary assets.** Do not generate new images, search for replacement images, or invent additional character artwork. If an image needed for a section has not been provided yet, build the section with a tasteful placeholder treatment that is easy to replace later.

Keep image paths and asset references centralized and easy for me to update. Do not bake image URLs into multiple components.

## Existing project

- Website: https://naruto-techniques.vercel.app/
- This is a redesign of the homepage, not a replacement of the entire product.
- Preserve existing training functionality and route destinations.
- Before coding, inspect the current project structure, routes, installed dependencies, and existing hand-sign training flow.
- Reuse existing components and dependencies where practical. Do not introduce a new framework or unnecessary libraries.

## Design direction

### Mood
Cinematic, focused, atmospheric, and slightly mysterious. Think of a quiet moment before a shinobi begins a technique.

### Visual system
- Main background: near-black / charcoal.
- Accent colors: Naruto blue, muted warm orange, and restrained red.
- Typography: strong, condensed or bold display type for headlines; clean readable sans-serif for body copy.
- Use generous negative space and asymmetrical layouts.
- Use thin borders, small labels, and restrained details inspired by shinobi records and training interfaces.
- Avoid making every section use the same layout.
- Avoid excessive gradients, glowing borders, floating UI panels, and decorative elements that do not support the content.

### Overall motion language
Use GSAP and/or Motion (Framer Motion) for smooth, intentional animation. Prefer GSAP ScrollTrigger for scroll-linked scenes and Motion for small UI transitions where appropriate.

Motion should support the storytelling:
- Character movement should feel weighted and restrained.
- Text should enter with clean, readable timing.
- Section transitions should feel connected.
- Avoid constant movement everywhere.
- Respect `prefers-reduced-motion`.
- Do not make scroll hijacking or forced scroll snapping the default.

## Homepage structure

Build the homepage in this order:

1. Hero — The Shinobi Is Watching
2. The Will of Fire — Introduction
3. The Shinobi Archive — Explore Techniques
4. The Five Chakra Natures
5. The Hand Sign Dojo — Try It Yourself
6. The Shinobi Scroll — Featured Techniques
7. Enter the Training Grounds — Final CTA

---

# 1. Hero — The Shinobi Is Watching

## Purpose
Make the first screen immediately memorable and establish the core interaction: Naruto looks toward the visitor.

## Layout
- Full-viewport hero, with the text on the left and Naruto on the right.
- Keep the character large and visually dominant, but do not let the face overlap the headline or CTA.
- Use a dark, atmospheric background with a clear focal point.
- Header should be minimal: logo/site name on the left, a small Techniques link, and a Start Training action on the right.
- Main headline:
  - “Form the seal.”
  - “Watch the jutsu happen.”
- Highlight “the jutsu happen” in Naruto blue.
- Supporting copy: “Hold a hand sign to your webcam and the technique plays out live on your feed. Nothing leaves your device.”
- Primary CTA: “Start training →”
- Secondary CTA: “See the techniques”

## Character interaction
The eyes and head should subtly follow the cursor:
1. Eyes react first and track the cursor within a limited range.
2. Head follows with a smaller, delayed rotation.
3. If the supplied artwork supports separated layers, add very subtle secondary movement to hair or headband.
4. When the cursor leaves the hero, return smoothly to the neutral pose.
5. Keep the motion small and believable—do not make the character swivel dramatically or stare unnaturally.
6. On touch devices, use a restrained idle movement or keep the character still.

Do not simply rotate a flat image as if it were a 3D head. If the available asset is a single image, use a subtle parallax treatment and keep the tracking range very small. If a properly layered or rigged asset is provided later, adapt the implementation to it.

## Hero motion
- Headline enters with a short, staggered reveal.
- Supporting copy and buttons follow.
- Background can have restrained atmospheric movement (e.g. slow light drift or a few embers), but do not overload the scene.
- Keep the hero responsive and avoid layout shifts.
- CTA should navigate to the existing training route or section.

## Hero implementation notes
- Make cursor tracking a reusable component/hook.
- Use normalized pointer coordinates and clamp movement.
- Smooth the target values with GSAP or Motion rather than applying abrupt transforms.
- Keep animation performant; prefer transforms and opacity.
- Ensure the hero remains usable without JavaScript or on reduced-motion settings.

---

# 2. The Will of Fire — Introduction

## Purpose
Introduce the experience and transition the visitor from the hero into the Naruto world.

## Visual concept
A quiet, atmospheric introduction to the Hidden Leaf Village. Use one of the provided images if it fits. If the necessary image is not available, use a dark, minimal placeholder until I provide the final asset.

## Content
Eyebrow: “THE WILL OF FIRE”

Headline idea: “Every technique begins with a story.”

Short copy:
“Discover the techniques that shaped the shinobi world. Learn the hand signs, understand the chakra, and master the jutsu.”

Keep the copy concise and avoid adding long paragraphs.

## Interaction
- As the user scrolls out of the hero, the hero character can subtly move down or recede.
- The introduction’s image/background can reveal gradually.
- Use a restrained parallax effect, not a dramatic zoom.
- Make the transition feel like entering the village rather than switching to a new page section.

---

# 3. The Shinobi Archive — Explore Techniques

## Purpose
Introduce the main content: a browsable archive of Naruto techniques.

## Visual concept
Present the techniques like classified shinobi records or a curated archive. Avoid a standard ecommerce-style grid of identical cards.

## Content
Eyebrow: “THE SHINOBI ARCHIVE”

Headline: “Techniques worth mastering.”

Include:
- Technique name
- User/character
- Chakra nature
- Rank or difficulty, if available in the existing data
- Short description
- Visual preview when an appropriate supplied image exists

## Layout and interaction
- Use a distinctive editorial layout: one featured technique plus smaller supporting entries, or a horizontal archive that can be browsed.
- Include filters for character, chakra nature, rank, or technique type only if the existing data supports them.
- Keep controls clear and accessible.
- Hover/focus can reveal a short detail or visual state, but do not hide essential information behind hover.
- Selecting a technique should open its existing detail or training flow where applicable.
- Do not invent technique data or routes. Inspect the existing project and use its real data and destinations.

## Motion
- Reveal archive entries with a restrained stagger.
- Use small image or background shifts on hover.
- Keep transitions fast enough for browsing.
- Avoid animating every card independently on every scroll.

---

# 4. The Five Chakra Natures

## Purpose
Create a visually memorable way to explore the five basic chakra natures.

## Content
- Fire Release
- Water Release
- Wind Release
- Lightning Release
- Earth Release

Use only supplied images/assets. If a visual for a nature is not yet available, use a typographic or color-based placeholder rather than generating artwork.

## Visual concept
Make this section feel like five distinct elemental environments, not five identical cards:
- Fire: warm orange/red accent
- Water: deep blue
- Wind: pale, desaturated tones
- Lightning: electric blue or restrained yellow
- Earth: muted stone/olive tones

Keep these accents controlled and consistent with the overall dark theme.

## Interaction
- Visitors can select a nature to reveal a short description and related techniques.
- The active state should be obvious without relying only on color.
- Use a smooth transition between selected elements.
- Ensure the interaction works with keyboard and touch.

## Motion
Use subtle changes in texture, light, or background position when changing the selected nature. Do not add large, distracting particle systems.

---

# 5. The Hand Sign Dojo — Try It Yourself

## Purpose
Showcase the site's main interactive feature and drive visitors into training.

## Visual concept
A focused training environment. Keep the interface clean and make the webcam/hand-sign interaction the main point of attention.

## Content
Eyebrow: “TRAINING GROUNDS”

Headline: “Master the hand signs.”

Supporting copy:
“Practice the signs, follow the sequence, and bring a technique to life.”

CTA: “Start training →”

## Interaction
- Explain briefly how webcam-based hand-sign training works.
- Make it clear when camera permission is needed.
- Do not request camera access automatically on page load.
- The CTA should navigate to the existing training experience.
- Preserve the existing privacy message: “Nothing leaves your device,” only if that remains accurate in the implementation.

## Motion
- Use a restrained focus/spotlight reveal or subtle line animation.
- Animate the CTA and supporting UI with short transitions.
- Do not simulate a working camera feed with fake content.
- Do not make this section dependent on camera permission just to view the homepage.

---

# 6. The Shinobi Scroll — Featured Techniques

## Purpose
Give visitors a cinematic preview of iconic techniques and encourage exploration.

## Visual concept
A sequence of large, editorial scenes. Each technique should feel like a moment from the anime rather than a product card.

Possible featured techniques, subject to existing project data:
- Rasengan
- Chidori
- Shadow Clone Jutsu

Use only supplied images for the visuals. If an image is not available, create a minimal placeholder with the technique name and metadata.

## Layout
- Use a full-width or wide editorial layout.
- Vary the composition between entries.
- Keep the number of featured techniques limited so the section feels curated.
- Include technique name, user, chakra nature, and a short description where available.
- Provide a clear way to explore or train with the technique.

## Motion
- Use ScrollTrigger for restrained image reveals and text transitions.
- If using a pinned sequence, keep it short and ensure it does not make the page feel stuck.
- Avoid forced scroll snapping.
- Avoid heavy zooms, flashing effects, or excessive parallax.
- Make the section work naturally on mobile without pinning.

---

# 7. Enter the Training Grounds — Final CTA

## Purpose
End the homepage with a clear next step.

## Visual concept
A quiet, dark closing scene with a single focal point. Use an available supplied image if suitable; otherwise keep the section typographic and minimal.

## Content
Headline: “Your shinobi journey starts here.”

CTA: “Begin training →”

Optional small supporting line: “Choose a technique. Learn the signs. Master the jutsu.”

## Interaction
- CTA navigates to the existing training route.
- Use a subtle entrance transition and a restrained hover/focus state.
- Do not add an unrelated newsletter or extra conversion flow.

---

# Header and navigation

- Keep the header minimal and consistent with the hero.
- Logo/site name on the left.
- Navigation links can include Techniques and Start Training.
- Use smooth scrolling only for in-page anchors.
- Ensure navigation remains accessible and does not cover content on small screens.
- Do not invent routes; use existing routes or implement valid anchors.

# Responsive behavior

- Desktop: preserve the cinematic split hero and editorial layouts.
- Tablet: reduce character scale and adjust text width so the headline remains readable.
- Mobile: stack content, keep the character visible without covering the text, and simplify or disable complex scroll effects.
- Replace cursor tracking with a subtle idle state on touch devices.
- Avoid horizontal overflow.
- Do not rely on hover for essential interactions.

# Accessibility and performance

- Use semantic sections and a logical heading hierarchy.
- Provide keyboard focus states for links, buttons, filters, and selectable elements.
- Ensure sufficient text contrast.
- Respect `prefers-reduced-motion`.
- Lazy-load below-the-fold images and heavy 3D assets.
- Avoid unnecessary dependencies and excessive client-side rendering.
- Prefer transform/opacity animation.
- Clean up GSAP timelines, ScrollTriggers, event listeners, and animation loops on unmount.
- Avoid layout shifts by reserving image dimensions/aspect ratios.
- Keep the page usable if animations fail or are disabled.

# Implementation requirements for Claude Code

1. Inspect the current app before changing it. Identify the framework, routing, styling system, current homepage, and existing training route.
2. Preserve existing functionality and data. Do not rewrite the training experience unless needed for the homepage integration.
3. Use the two images already provided as temporary assets. I will provide the remaining images later.
4. Do not generate or fetch replacement artwork.
5. Build reusable components for the header, hero, section headings, technique entries, and CTA.
6. Use GSAP/ScrollTrigger for scroll-driven storytelling and Motion for small UI transitions where appropriate. Avoid running two animation systems on the same property.
7. Keep animation values and asset paths easy to adjust.
8. Make the homepage responsive and accessible.
9. Implement the full section flow, not just the hero.
10. After implementation, summarize which files changed, how to replace the temporary images, and any assets or data still needed from me.

## Quality bar

The final result should feel like a carefully art-directed Naruto experience with a clear visual hierarchy, natural movement, and meaningful interactions. It should not look like a generic AI landing page, a template with repeated cards, or a page overloaded with effects.

Prioritize composition, typography, spacing, and purposeful motion over adding more visual effects.
