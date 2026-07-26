import { dist2D, palmCenter, handScale } from "../gestures/handGeometry";
import { isOpenPalm } from "../gestures/rasengan";
import { easeOutCubic } from "./easing";

const FORM_MS = 400;
const FADE_MS = 450;
// How long the open-palm pose can drop out before the sphere starts fading —
// short enough to feel responsive, long enough to absorb a missed frame.
const GRACE_MS = 250;
const FOLLOW_LERP = 0.35;
const SIZE_LERP = 0.3;
const THREAD_COUNT = 60;

/** A tangle of chords between random points on the sphere's rim — generated
 * once and rotated as a rigid pattern each frame, giving the woven-energy
 * look without reshuffling (and flickering) every frame. */
function buildThreads(count) {
  const threads = [];
  for (let i = 0; i < count; i++) {
    threads.push({
      a1: Math.random() * Math.PI * 2,
      a2: Math.random() * Math.PI * 2,
      r1: 0.7 + Math.random() * 0.3,
      r2: 0.7 + Math.random() * 0.3,
      alpha: 0.12 + Math.random() * 0.22,
      width: 0.6 + Math.random() * 1.1,
    });
  }
  return threads;
}

/**
 * A procedurally-drawn, rotating chakra sphere that forms above the user's
 * open palm and tracks it live every frame — sustained for as long as the
 * open-palm pose keeps being detected (i.e. you have to keep "channeling"
 * it), and fading out shortly after you close your hand or look away.
 */
export class RasenganEffect {
  constructor() {
    this.active = false;
    this.phase = "forming";
    this.phaseStart = 0;
    this.lastGoodAt = 0;
    this.pos = null;
    this.size = null;
    this.rotation = 0;
    this._lastNow = 0;
    this._threads = buildThreads(THREAD_COUNT);
  }

  trigger(now, handsLandmarks) {
    const hand = handsLandmarks?.find(isOpenPalm);
    this.active = true;
    this.phase = "forming";
    this.phaseStart = now;
    this.lastGoodAt = now;
    this.rotation = 0;
    this._lastNow = now;
    this.pos = hand ? palmCenter(hand) : { x: 0.5, y: 0.5 };
    this.size = hand ? handScale(hand) * 1.6 : 0.16;
  }

  // If more than one hand is currently open, keep following whichever one
  // we were already tracking (closest to the last known position) instead
  // of jumping to whichever hand happens to come first in the frame's
  // detection order — the sphere should stay locked to a single hand.
  _pickHand(handsLandmarks) {
    const candidates = (handsLandmarks || []).filter(isOpenPalm);
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    let best = candidates[0];
    let bestDist = dist2D(palmCenter(best), this.pos);
    for (let i = 1; i < candidates.length; i++) {
      const d = dist2D(palmCenter(candidates[i]), this.pos);
      if (d < bestDist) {
        bestDist = d;
        best = candidates[i];
      }
    }
    return best;
  }

  update(now, handsLandmarks) {
    if (!this.active) return;

    const dt = now - (this._lastNow || now);
    this._lastNow = now;
    this.rotation += dt * 0.005;

    const hand = this._pickHand(handsLandmarks);
    if (hand) {
      this.lastGoodAt = now;
      const target = palmCenter(hand);
      const targetSize = handScale(hand) * 1.6;
      this.pos.x += (target.x - this.pos.x) * FOLLOW_LERP;
      this.pos.y += (target.y - this.pos.y) * FOLLOW_LERP;
      this.size += (targetSize - this.size) * SIZE_LERP;
      if (this.phase === "fading") this.phase = "holding";
      else if (this.phase === "forming" && now - this.phaseStart > FORM_MS) this.phase = "holding";
    } else if (this.phase !== "fading" && now - this.lastGoodAt > GRACE_MS) {
      this.phase = "fading";
      this.phaseStart = now;
    }

    if (this.phase === "fading" && now - this.phaseStart > FADE_MS) {
      this.active = false;
    }
  }

  isActive() {
    return this.active;
  }

  render(ctx, canvasWidth, canvasHeight, now) {
    if (!this.active || !this.pos) return;

    let alpha = 1;
    if (this.phase === "forming") alpha = easeOutCubic((now - this.phaseStart) / FORM_MS);
    else if (this.phase === "fading") alpha = 1 - (now - this.phaseStart) / FADE_MS;
    alpha = Math.max(0, Math.min(1, alpha));
    if (alpha <= 0) return;

    const stageRef = Math.min(canvasWidth, canvasHeight);
    const r = Math.max(14, this.size * stageRef);
    const cx = this.pos.x * canvasWidth;
    const cy = this.pos.y * canvasHeight - r * 1.1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);

    // Subtle outer bloom, then a solid sphere body with a defined edge —
    // two layers so it reads as a solid ball with soft light bleed, rather
    // than one big diffuse haze.
    const bloom = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.5);
    bloom.addColorStop(0, "rgba(140,210,255,0.22)");
    bloom.addColorStop(1, "rgba(140,210,255,0)");
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    const glow = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
    glow.addColorStop(0, "rgba(220,245,255,0.9)");
    glow.addColorStop(0.45, "rgba(130,205,255,0.88)");
    glow.addColorStop(0.82, "rgba(50,140,240,0.85)");
    glow.addColorStop(0.95, "rgba(35,110,225,0.55)");
    glow.addColorStop(1, "rgba(30,100,220,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Bright core, drawn behind the threads so they read as crossing over it.
    const hotspot = ctx.createRadialGradient(-r * 0.1, r * 0.08, 0, -r * 0.1, r * 0.08, r * 0.35);
    hotspot.addColorStop(0, "rgba(255,255,255,0.8)");
    hotspot.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hotspot;
    ctx.beginPath();
    ctx.arc(-r * 0.1, r * 0.08, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // A dense tangle of chords across the sphere, rotating as one rigid
    // woven pattern — the thin crisscrossing threads that read as a
    // spinning ball of chakra, rather than a few smooth spiral arms.
    ctx.lineCap = "round";
    for (const thread of this._threads) {
      const ang1 = thread.a1 + this.rotation;
      const ang2 = thread.a2 + this.rotation;
      const x1 = Math.cos(ang1) * r * thread.r1;
      const y1 = Math.sin(ang1) * r * thread.r1;
      const x2 = Math.cos(ang2) * r * thread.r2;
      const y2 = Math.sin(ang2) * r * thread.r2;
      ctx.strokeStyle = `rgba(255,255,255,${thread.alpha})`;
      ctx.lineWidth = Math.max(0.6, thread.width * (r / 90));
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }
}
