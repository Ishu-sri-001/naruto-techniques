"use client";

import { useEffect, useRef } from "react";
import { RasenganEffect } from "@/lib/effects/rasenganEffect";
import { OPEN_PALM } from "@/data/hand-poses";
import { drawHand, fitCanvas, placeHand, readTheme, runWhileVisible } from "@/lib/previews";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * Live Rasengan preview, driven by the real RasenganEffect from the camera
 * page. A pretend open palm sways gently and is fed to the effect as hand
 * landmarks each frame, so the sphere forms, spins and follows exactly as
 * it does over a real camera feed. Runs only while `active` and on screen.
 */
export default function RasenganPreview({ active = true, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    const theme = readTheme();
    const effect = new RasenganEffect();

    const handAt = (t, aspect) =>
      placeHand(OPEN_PALM, {
        cx: 0.5 + Math.sin(t * 0.0009) * 0.04,
        cy: 0.95 + Math.sin(t * 0.0016) * 0.015,
        k: 0.0034,
        aspect,
        angleDeg: Math.sin(t * 0.0011) * 5,
      });

    const frame = (now) => {
      const { w, h, dpr } = fitCanvas(canvas);
      const hand = handAt(now, w / h);
      effect.update(now, [hand]);
      ctx.clearRect(0, 0, w, h);
      drawHand(ctx, hand, w, h, theme, { width: 1.4 * dpr, alpha: 0.85 });
      effect.render(ctx, w, h, now);
    };

    const start = performance.now();
    const { w, h } = fitCanvas(canvas);
    if (prefersReducedMotion()) {
      // One still frame, a second into the hold.
      effect.trigger(start - 1000, [handAt(start, w / h)]);
      frame(start);
      return undefined;
    }
    effect.trigger(start, [handAt(start, w / h)]);
    return runWhileVisible(canvas, frame);
  }, [active]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`h-full w-full ${className}`} />;
}
