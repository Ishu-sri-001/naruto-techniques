import { easeOutCubic } from "./easing";

const POOF_MS = 650;
const HOLD_MS = 3200;
const FADE_MS = 500;
const CLONE_ALPHA = 0.86;
const SPRITE_MAX_WIDTH = 360;

// Fan-out layout for the clone copies, as fractions of the stage size,
// relative to center (0.5, 0.5). Symmetric left/right so it looks the same
// whether or not the view is mirrored.
const OFFSETS = [
  { dx: -0.3, dy: -0.05, scale: 0.8, delay: 0 },
  { dx: 0.3, dy: -0.05, scale: 0.8, delay: 90 },
  { dx: -0.2, dy: 0.22, scale: 0.68, delay: 180 },
  { dx: 0.2, dy: 0.22, scale: 0.68, delay: 270 },
];

/**
 * Redraws the small grayscale mask buffer (mask-native resolution, so this
 * loop stays cheap) with the segmentation confidence baked into alpha, ready
 * to be used as a `destination-in` matte.
 */
function paintMaskCanvas(canvas, personMask) {
  const { data, width: mw, height: mh } = personMask;
  if (canvas.width !== mw || canvas.height !== mh) {
    canvas.width = mw;
    canvas.height = mh;
  }
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(mw, mh);
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    const o = i * 4;
    imgData.data[o] = 255;
    imgData.data[o + 1] = 255;
    imgData.data[o + 2] = 255;
    // Cut soft low-confidence background noise instead of leaving a haze.
    imgData.data[o + 3] = p < 0.3 ? 0 : Math.round(p * 255);
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Owns the lifecycle of one gesture's "clone" visual: a burst of smoke
 * particles followed by translucent silhouette copies that fan out, hold,
 * then fade. The copies share one live cutout of the person that is
 * rebuilt every frame from the current video + segmentation mask (via a
 * `destination-in` composite, so the per-pixel JS work stays limited to the
 * small mask buffer, not the full cutout canvas), so clones move with you
 * in real time instead of freezing the pose at the moment they spawned.
 * Call `spawn` once per trigger, `update`/`render` every frame.
 */
export class ShadowCloneEffect {
  constructor() {
    this.clones = [];
    this.particles = [];
    this._maskCanvas = document.createElement("canvas");
    this._cutoutCanvas = document.createElement("canvas");
    this._liveSprite = null;
  }

  spawn(now) {
    for (const o of OFFSETS) {
      const spawnAt = now + o.delay;
      this.clones.push({
        dx: o.dx,
        dy: o.dy,
        scale: o.scale,
        spawnAt,
        fadeUntil: spawnAt + POOF_MS + HOLD_MS + FADE_MS,
        burstDone: false,
      });
    }
  }

  update(now, videoEl, personMask) {
    for (const clone of this.clones) {
      if (!clone.burstDone && now >= clone.spawnAt) {
        this._burst(clone);
        clone.burstDone = true;
      }
    }
    this.clones = this.clones.filter((c) => now < c.fadeUntil);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.00035;
      p.alpha -= p.decay;
    }
    this.particles = this.particles.filter((p) => p.alpha > 0.02);

    if (this.clones.length > 0 && personMask && videoEl?.videoWidth) {
      this._liveSprite = this._buildLiveCutout(videoEl, personMask);
    }
  }

  _buildLiveCutout(videoEl, personMask) {
    const vw = videoEl.videoWidth;
    const vh = videoEl.videoHeight;
    const scale = Math.min(1, SPRITE_MAX_WIDTH / vw);
    const w = Math.max(1, Math.round(vw * scale));
    const h = Math.max(1, Math.round(vh * scale));

    const canvas = this._cutoutCanvas;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(videoEl, 0, 0, w, h);

    paintMaskCanvas(this._maskCanvas, personMask);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(this._maskCanvas, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    return canvas;
  }

  _burst(clone) {
    const cx = 0.5 + clone.dx;
    const cy = 0.5 + clone.dy;
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
      const speed = 0.0015 + Math.random() * 0.0035;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 5 + Math.random() * 9,
        alpha: 0.85,
        decay: 0.011 + Math.random() * 0.01,
      });
    }
  }

  isActive() {
    return this.clones.length > 0 || this.particles.length > 0;
  }

  render(ctx, canvasWidth, canvasHeight, now) {
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(226, 230, 238, ${Math.max(p.alpha, 0)})`;
      ctx.arc(p.x * canvasWidth, p.y * canvasHeight, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!this._liveSprite) return;

    for (const clone of this.clones) {
      const t = now - clone.spawnAt;
      if (t < 0) continue;

      let alpha;
      let scaleMul;
      if (t < POOF_MS) {
        const p = easeOutCubic(t / POOF_MS);
        alpha = CLONE_ALPHA * p;
        scaleMul = 0.35 + 0.65 * p;
      } else if (t < POOF_MS + HOLD_MS) {
        alpha = CLONE_ALPHA;
        scaleMul = 1;
      } else {
        const p = (t - POOF_MS - HOLD_MS) / FADE_MS;
        alpha = CLONE_ALPHA * (1 - p);
        scaleMul = 1;
      }

      const drawW = canvasWidth * clone.scale * scaleMul;
      const drawH = canvasHeight * clone.scale * scaleMul;
      const centerX = canvasWidth * (0.5 + clone.dx);
      const centerY = canvasHeight * (0.5 + clone.dy);

      ctx.save();
      ctx.globalAlpha = Math.max(alpha, 0);
      ctx.drawImage(this._liveSprite, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
      ctx.restore();
    }
  }
}
