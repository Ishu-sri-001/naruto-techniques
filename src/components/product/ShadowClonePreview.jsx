"use client";

import { useEffect, useRef } from "react";
import { ShadowCloneEffect } from "@/lib/effects/shadowCloneEffect";
import { SEAL_HAND, SEAL_PAIR } from "@/data/hand-poses";
import { drawHand, fitCanvas, placeHand, readTheme, runWhileVisible } from "@/lib/previews";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * Live Kage Bunshin preview, driven by the real ShadowCloneEffect. On the
 * camera page the effect cuts the person out of the video with a
 * segmentation mask; here the "video" is a canvas with the crossed seal
 * hands drawn on it, and the mask is built from that same drawing. The
 * effect does the rest: smoke bursts, then clones fan out, hold and fade,
 * on a loop. Runs only while `active` and on screen.
 */

const LOOP_MS = 4800; // a little longer than the effect's poof + hold + fade
const MASK_W = 96;

// The seal pair, relative to the frame's centre, in fractions of its height.
const FRONT = { dx: (SEAL_PAIR.front.x - 200) / 300, y: SEAL_PAIR.front.y / 300, angle: SEAL_PAIR.front.angle };
const BACK = { dx: (SEAL_PAIR.back.x - 200) / 300, y: SEAL_PAIR.back.y / 300, angle: SEAL_PAIR.back.angle };
const K = 1.05 / 300;

export default function ShadowClonePreview({ active = true, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    const theme = readTheme();
    const effect = new ShadowCloneEffect();

    // Stand-ins for the camera feed and the person mask.
    const source = document.createElement("canvas");
    const maskCanvas = document.createElement("canvas");
    const mask = { data: new Float32Array(0), width: 0, height: 0 };

    const pair = (aspect, bob) =>
      [BACK, FRONT].map((p) =>
        placeHand(SEAL_HAND, {
          cx: 0.5 + p.dx / aspect,
          cy: p.y - 0.06 + bob,
          k: K * 0.8,
          aspect,
          angleDeg: p.angle,
        }),
      );

    const paint = (target, w, h, hands, width) => {
      const c = target.getContext("2d");
      c.clearRect(0, 0, w, h);
      hands.forEach((hand) => drawHand(c, hand, w, h, theme, { width }));
    };

    const rebuildMask = (w, h, hands) => {
      const mw = MASK_W;
      const mh = Math.max(1, Math.round((MASK_W * h) / w));
      maskCanvas.width = mw;
      maskCanvas.height = mh;
      // Thick strokes so the cutout keeps the whole hand.
      paint(maskCanvas, mw, mh, hands, 4);
      const px = maskCanvas.getContext("2d").getImageData(0, 0, mw, mh).data;
      const data = new Float32Array(mw * mh);
      for (let i = 0; i < data.length; i++) data[i] = px[i * 4 + 3] / 255;
      mask.data = data;
      mask.width = mw;
      mask.height = mh;
    };

    let nextSpawn = 0;
    let lastW = 0;
    let lastH = 0;

    const frame = (now) => {
      const { w, h, dpr } = fitCanvas(canvas);
      const hands = pair(w / h, Math.sin(now * 0.0014) * 0.01);
      if (source.width !== w || source.height !== h) {
        source.width = w;
        source.height = h;
      }
      source.videoWidth = w;
      source.videoHeight = h;
      paint(source, w, h, hands, 1.4 * dpr);
      if (w !== lastW || h !== lastH) {
        rebuildMask(w, h, hands);
        lastW = w;
        lastH = h;
      }

      if (now >= nextSpawn) {
        effect.spawn(now + 250);
        nextSpawn = now + LOOP_MS;
      }
      effect.update(now, source, mask);

      ctx.clearRect(0, 0, w, h);
      effect.render(ctx, w, h, now);
      ctx.drawImage(source, 0, 0);
    };

    if (prefersReducedMotion()) {
      // One still frame, with the clones already out.
      const start = performance.now();
      nextSpawn = Infinity;
      effect.spawn(start - 1500);
      frame(start - 1500);
      frame(start);
      return undefined;
    }
    return runWhileVisible(canvas, frame);
  }, [active]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`h-full w-full ${className}`} />;
}
