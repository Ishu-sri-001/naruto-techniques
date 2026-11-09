"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/motion";
import { inkIn } from "@/lib/ink";

/*
 * Global text-reveal driver, mounted once in the root layout (like noma's
 * FadeUp). Two classes, each revealed once as it scrolls into view, in
 * batches so neighbours stagger:
 *   .ink       headings: sumi ink soaks in (lib/ink, WebGL)
 *   .lines-up  paragraphs: each line rises from behind a mask (SplitText)
 * Their hidden start states live in globals.css. Elements marked
 * data-ink="manual" are driven by their own component (InkText with `play`).
 */

function revealLines(el, delay) {
  const split = SplitText.create(el, { type: "lines", mask: "lines" });
  el.classList.add("lines-done");
  if (!split.lines.length) {
    split.revert();
    return;
  }
  gsap.from(split.lines, {
    yPercent: 110,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
    delay,
    // Put the paragraph back to plain text so it reflows normally.
    onComplete: () => split.revert(),
  });
}

export default function TextReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let ctx = null;
    let cancelled = false;
    const cancels = [];

    // Measure lines and glyphs with the real fonts, not fallbacks.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        ScrollTrigger.batch(".ink:not([data-ink='manual'])", {
          start: "top 88%",
          once: true,
          onEnter: (batch) => batch.forEach((el, i) => cancels.push(inkIn(el, { delay: i * 0.12 }))),
        });
        ScrollTrigger.batch(".lines-up", {
          start: "top 88%",
          once: true,
          onEnter: (batch) => batch.forEach((el, i) => revealLines(el, 0.15 + i * 0.12)),
        });
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      cancels.forEach((c) => c());
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
