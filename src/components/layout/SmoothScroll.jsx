"use client";

import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

// Same-page link glides: long enough to read as travel, eased at both ends.
const SCROLL_TO_DURATION = 1.6;
const easeInOutExpo = (t) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;

export default function SmoothScroll() {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);

    // Lenis drives the scroll, so ScrollTrigger needs telling when it moves.
    // This is the one bridge for every ScrollTrigger in the app. The Lenis
    // instance is created on mount, so poll briefly for it.
    let lenis = null;
    const onLenisScroll = () => ScrollTrigger.update();
    const attach = () => {
      const instance = lenisRef.current?.lenis;
      if (!instance || lenis) return;
      lenis = instance;
      lenis.on("scroll", onLenisScroll);
      ScrollTrigger.refresh();
    };
    attach();
    const attachTimer = window.setInterval(attach, 100);
    const stopPolling = window.setTimeout(() => window.clearInterval(attachTimer), 2000);

    // Same-page hash links (e.g. "How it works" → #about) glide through Lenis
    // instead of jumping natively mid-scroll. Capture phase runs before Next's
    // own link handler.
    const onAnchorClick = (e) => {
      if (!lenis || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.getAttribute("href") === "#") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : 0;
      if (target === null) return;
      e.preventDefault();
      e.stopPropagation();
      lenis.scrollTo(target, {
        duration: SCROLL_TO_DURATION,
        easing: easeInOutExpo,
        immediate: prefersReducedMotion(),
      });
      window.history.replaceState(null, "", url.hash || url.pathname);
    };
    document.addEventListener("click", onAnchorClick, true);

    return () => {
      window.clearInterval(attachTimer);
      window.clearTimeout(stopPolling);
      document.removeEventListener("click", onAnchorClick, true);
      lenis?.off("scroll", onLenisScroll);
      gsap.ticker.remove(update);
    };
  }, []);

  return <ReactLenis root options={{ autoRaf: false, duration: 1.2 }} ref={lenisRef} />;
}
