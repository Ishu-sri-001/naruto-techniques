// Helpers for the technique previews: place a hand pose on a canvas in the
// normalized (0..1) coordinates the gesture and effect code expects, and
// draw it as a skeleton.
import { HAND_BONES, FINGER_TIPS } from "@/data/hand-poses";

// Theme colors come from the CSS variables in globals.css.
export function readTheme() {
  const css = getComputedStyle(document.documentElement);
  const get = (name) => css.getPropertyValue(name).trim();
  return { ink: get("--ink"), cream: get("--cream"), chakra: get("--chakra"), hanko: get("--hanko") };
}

/**
 * Map a local hand pose to normalized canvas coordinates, MediaPipe-style.
 * cx, cy: wrist position (0..1). k: landmark units → fraction of canvas
 * height. angleDeg rotates the hand (clockwise). aspect = width / height,
 * so the hand keeps its shape on a non-square canvas.
 */
export function placeHand(pose, { cx, cy, k, aspect, angleDeg = 0 }) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return pose.map(([lx, ly]) => ({
    x: cx + ((lx * cos - ly * sin) * k) / aspect,
    y: cy + (lx * sin + ly * cos) * k,
    z: 0,
  }));
}

/** Draw a placed hand as bones and joints. `w`/`h` are canvas pixels. */
export function drawHand(ctx, pts, w, h, theme, { width = 1.5, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = theme.cream;
  ctx.globalAlpha = alpha * 0.8;
  ctx.beginPath();
  for (const [a, b] of HAND_BONES) {
    ctx.moveTo(pts[a].x * w, pts[a].y * h);
    ctx.lineTo(pts[b].x * w, pts[b].y * h);
  }
  ctx.stroke();
  ctx.globalAlpha = alpha;
  pts.forEach((p, i) => {
    ctx.fillStyle = FINGER_TIPS.has(i) ? theme.cream : theme.chakra;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, FINGER_TIPS.has(i) ? width * 2 : width * 1.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/**
 * Size a canvas to its CSS box at a capped device pixel ratio.
 * Returns { w, h, dpr } in canvas pixels.
 */
export function fitCanvas(canvas, maxDpr = 2) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.max(1, Math.round(r.width * dpr));
  const h = Math.max(1, Math.round(r.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { w, h, dpr };
}

/**
 * Run `frame(now)` every animation frame while `canvas` is on screen.
 * Returns a cleanup function.
 */
export function runWhileVisible(canvas, frame) {
  let raf = 0;
  let visible = false;
  const loop = (now) => {
    frame(now);
    if (visible) raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry.isIntersecting;
    if (visible && !was) raf = requestAnimationFrame(loop);
    if (!visible) cancelAnimationFrame(raf);
  });
  io.observe(canvas);
  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
  };
}
