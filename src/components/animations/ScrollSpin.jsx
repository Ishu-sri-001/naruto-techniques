"use client";

import { useEffect, useRef } from "react";

/*
 * Ties the speed of any CSS animations inside it to scroll velocity.
 * Scrolling down speeds them up (up to `max`×), scrolling up slows them
 * (down to `min`×), and they ease back to normal speed once scrolling stops.
 * Only runs while the element is on screen. With reduced motion the CSS
 * animations are off, so there is nothing to drive.
 */
export default function ScrollSpin({ children, className = "", gain = 12, max = 24, min = 0.1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lastT = 0;
    let lastY = window.scrollY;
    let rate = 1;

    const apply = (r) => {
      el.getAnimations({ subtree: true }).forEach((a) => {
        a.playbackRate = r;
      });
    };

    const tick = (t) => {
      const dt = lastT ? Math.min(t - lastT, 50) : 16;
      lastT = t;
      const y = window.scrollY;
      const velocity = (y - lastY) / dt; // px per ms, positive when scrolling down
      lastY = y;

      const target = Math.min(max, Math.max(min, 1 + velocity * gain));
      rate += (target - rate) * (1 - Math.exp(-dt / 140));
      apply(rate);
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        lastT = 0;
        lastY = window.scrollY;
        raf = requestAnimationFrame(tick);
      } else {
        rate = 1;
        apply(1);
      }
    });
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [gain, max, min]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
