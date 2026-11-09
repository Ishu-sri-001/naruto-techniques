"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/*
 * Wraps a section's contents so they lag behind as the section scrolls out
 * (moving down `shift`% of their height) and dim towards ink, while the next
 * section slides up over them. Scrubbed against the parent section, from its
 * bottom reaching the viewport bottom to its bottom leaving the top.
 */
export default function ParallaxExit({ children, className = "", shift = 55, dim = 0.6 }) {
  const stageRef = useRef(null);
  const dimRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const root = stage?.parentElement;
    if (!stage || !root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const scrollTrigger = { trigger: root, start: "bottom bottom", end: "bottom top", scrub: true };
      gsap.fromTo(stage, { yPercent: 0 }, { yPercent: shift, ease: "none", scrollTrigger });
      gsap.fromTo(dimRef.current, { opacity: 0 }, { opacity: dim, ease: "none", scrollTrigger });
    }, stage);

    return () => ctx.revert();
  }, [shift, dim]);

  return (
    <div ref={stageRef} className={`relative ${className}`}>
      {children}
      <div
        ref={dimRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 bg-ink opacity-0"
      />
    </div>
  );
}
