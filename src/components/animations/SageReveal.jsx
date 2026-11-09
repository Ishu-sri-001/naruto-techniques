"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/*
 * Cursor-driven reveal of a second, pixel-aligned image.
 *
 * Two WebGL passes run per frame:
 *  1. Trail: a ping-pong texture holds a mask (R) and a smear direction (GB).
 *     Each frame it fades, drifts along the stroke, and the latest pointer
 *     segment is painted in with a noise-wobbled brush.
 *  2. Composite: base and reveal are mixed through the mask. The mask's
 *     gradient bends the UVs (glassy refraction with a slight chromatic
 *     split) and lights a specular streak along the edge.
 *
 * Without WebGL, or with reduced motion requested, the base image renders on
 * its own.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const NOISE = `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}`;

const TRAIL_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev;
uniform float uAspect;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform vec2 uVel;
uniform float uRadius;
uniform float uStrength;
uniform float uDecay;
uniform float uTime;
${NOISE}
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}
void main() {
  vec2 flow = texture2D(uPrev, vUv).gb * 2.0 - 1.0;
  vec4 prev = texture2D(uPrev, vUv - flow * 0.004);
  float m = max(prev.r * uDecay - 0.002, 0.0);
  vec2 vel = (prev.gb * 2.0 - 1.0) * 0.96;

  vec2 asp = vec2(uAspect, 1.0);
  float d = segDist(vUv * asp, uFrom * asp, uTo * asp);
  float r = uRadius * (0.7 + 0.6 * fbm(vUv * asp * 6.0 + uTime * 0.4));
  float s = smoothstep(r, r * 0.2, d) * uStrength;

  m = clamp(max(m, s) + s * 0.1, 0.0, 1.0);
  vel = mix(vel, uVel, s);
  gl_FragColor = vec4(m, vel * 0.5 + 0.5, 1.0);
}`;

const COMPOSITE_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uBase;
uniform sampler2D uReveal;
uniform sampler2D uTrail;
uniform float uCanvasAspect;
uniform float uImageAspect;
uniform vec2 uAnchor;
uniform float uTime;
${NOISE}
vec2 cover(vec2 uv) {
  vec2 s = uCanvasAspect > uImageAspect
    ? vec2(1.0, uImageAspect / uCanvasAspect)
    : vec2(uCanvasAspect / uImageAspect, 1.0);
  return uAnchor * (1.0 - s) + uv * s;
}
float trail(vec2 uv) { return texture2D(uTrail, uv).r; }
void main() {
  vec2 step = vec2(0.006 / uCanvasAspect, 0.006);
  float m = trail(vUv);
  vec2 g = vec2(
    trail(vUv + vec2(step.x, 0.0)) - trail(vUv - vec2(step.x, 0.0)),
    trail(vUv + vec2(0.0, step.y)) - trail(vUv - vec2(0.0, step.y))
  );

  float n = fbm(vUv * vec2(uCanvasAspect, 1.0) * 4.0 + vec2(uTime * 0.05, -uTime * 0.03));
  float reveal = smoothstep(0.22, 0.55, m + (n - 0.5) * 0.5 * smoothstep(0.0, 0.4, m));

  vec2 off = g * 0.08;
  float edge = smoothstep(0.04, 0.2, length(g));

  vec3 base = vec3(
    texture2D(uBase, cover(vUv + off * 1.1)).r,
    texture2D(uBase, cover(vUv + off)).g,
    texture2D(uBase, cover(vUv + off * 0.9)).b
  );
  vec3 sage = texture2D(uReveal, cover(vUv - off * 0.6)).rgb;
  vec3 col = mix(base, sage, reveal);

  vec2 nrm = length(g) > 1e-4 ? normalize(g) : vec2(0.0);
  float spec = pow(max(dot(nrm, normalize(vec2(-0.5, 0.85))), 0.0), 6.0) * edge;
  col += spec * 0.4 * vec3(1.0, 0.96, 0.9);
  col += vec3(0.93, 0.42, 0.1) * reveal * (1.0 - reveal) * 0.4;

  gl_FragColor = vec4(col, 1.0);
}`;

// Where the eyes sit in the source image (0..1, y up). Used for the intro sweep.
const FACE = { x: 0.5, y: 0.57 };

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function program(gl, frag) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  const uniforms = {};
  const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const { name } = gl.getActiveUniform(p, i);
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  return { p, u: uniforms };
}

function texture(gl, source, w, h) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (source) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  return t;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function SageReveal({ base, reveal, alt, className = "" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    const trailProg = program(gl, TRAIL_FRAG);
    const compProg = program(gl, COMPOSITE_FRAG);
    if (!trailProg || !compProg) return;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let disposed = false;
    let raf = 0;
    let running = false;
    let visible = true;
    let lastFrame = 0;
    let lastInput = 0;
    let startTime = performance.now();
    let userMoved = false;
    let introUntil = 0;

    let width = 1;
    let height = 1;
    let aspect = 1;
    const anchor = 0.5;
    let imageAspect = 16 / 9;
    let baseTex = null;
    let revealTex = null;
    let targets = [];
    let fbos = [];
    let read = 0;

    const pointer = { x: -1, y: -1, tx: -1, ty: -1, px: -1, py: -1, inside: false };

    const clearTrail = (fbo) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.clearColor(0, 0.5, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      aspect = rect.width / Math.max(rect.height, 1);
      canvas.width = width;
      canvas.height = height;

      targets.forEach((t) => gl.deleteTexture(t));
      fbos.forEach((f) => gl.deleteFramebuffer(f));
      const tw = Math.max(64, Math.round(rect.width / 4));
      const th = Math.max(64, Math.round(rect.height / 4));
      targets = [texture(gl, null, tw, th), texture(gl, null, tw, th)];
      fbos = targets.map((t) => {
        const f = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        clearTrail(f);
        return f;
      });
      targets.size = [tw, th];
      if (baseTex) draw(performance.now(), 0);
    };

    // Map a point in the source image (0..1, y up) to canvas UV.
    const imageToCanvas = (ix, iy) => {
      const s =
        aspect > imageAspect ? [1, imageAspect / aspect] : [aspect / imageAspect, 1];
      const a = [anchor, 0.5];
      return [(ix - a[0] * (1 - s[0])) / s[0], (iy - a[1] * (1 - s[1])) / s[1]];
    };

    const draw = (now, dt) => {
      const t = (now - startTime) / 1000;

      // Intro sweep across the eyes until the visitor moves for themselves.
      if (!userMoved && now < introUntil) {
        const p = 1 - (introUntil - now) / 2200;
        const ix = FACE.x - 0.09 + p * 0.18;
        const iy = FACE.y + Math.sin(p * Math.PI * 2) * 0.04;
        const [ux, uy] = imageToCanvas(ix, iy);
        pointer.tx = ux;
        pointer.ty = uy;
        pointer.inside = true;
        if (pointer.x < 0) {
          pointer.x = ux;
          pointer.y = uy;
        }
      }

      // Ease the brush towards the pointer for a fluid, slightly lagging stroke.
      const ease = 1 - Math.pow(1 - 0.35, dt * 60);
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      if (pointer.tx >= -0.5) {
        if (pointer.x < -0.5) {
          pointer.x = pointer.tx;
          pointer.y = pointer.ty;
          pointer.px = pointer.x;
          pointer.py = pointer.y;
        }
        pointer.x += (pointer.tx - pointer.x) * ease;
        pointer.y += (pointer.ty - pointer.y) * ease;
      }

      const dx = (pointer.x - pointer.px) * aspect;
      const dy = pointer.y - pointer.py;
      const dist = Math.hypot(dx, dy);
      const moving = pointer.inside && dist > 0.0004;
      const strength = moving ? Math.min(1, Math.max(0.45, dist * 60)) : 0;
      const vx = dist > 0 ? dx / dist : 0;
      const vy = dist > 0 ? dy / dist : 0;

      // Pass 1: trail
      const write = 1 - read;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[write]);
      gl.viewport(0, 0, targets.size[0], targets.size[1]);
      gl.useProgram(trailProg.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[read]);
      gl.uniform1i(trailProg.u.uPrev, 0);
      gl.uniform1f(trailProg.u.uAspect, aspect);
      gl.uniform2f(trailProg.u.uFrom, pointer.px, pointer.py);
      gl.uniform2f(trailProg.u.uTo, pointer.x, pointer.y);
      gl.uniform2f(trailProg.u.uVel, vx, vy);
      gl.uniform1f(trailProg.u.uRadius, aspect < 1 ? 0.18 : 0.21);
      gl.uniform1f(trailProg.u.uStrength, strength);
      gl.uniform1f(trailProg.u.uDecay, Math.pow(0.982, Math.max(dt, 1 / 120) * 60));
      gl.uniform1f(trailProg.u.uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      read = write;

      // Pass 2: composite
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(compProg.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, baseTex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, revealTex);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, targets[read]);
      gl.uniform1i(compProg.u.uBase, 0);
      gl.uniform1i(compProg.u.uReveal, 1);
      gl.uniform1i(compProg.u.uTrail, 2);
      gl.uniform1f(compProg.u.uCanvasAspect, aspect);
      gl.uniform1f(compProg.u.uImageAspect, imageAspect);
      gl.uniform2f(compProg.u.uAnchor, anchor, 0.5);
      gl.uniform1f(compProg.u.uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now) => {
      if (disposed) return;
      const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 1 / 60;
      lastFrame = now;
      draw(now, dt);
      // Keep animating until the trail has fully faded after the last input.
      const idleFor = now - Math.max(lastInput, introUntil);
      if (visible && idleFor < 3500) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
        lastFrame = 0;
      }
    };

    const kick = () => {
      if (running || !visible || !baseTex) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (clientX, clientY) => {
      const rect = wrap.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (!pointer.inside) return;
      pointer.tx = x;
      pointer.ty = y;
      userMoved = true;
      lastInput = performance.now();
      kick();
    };
    const onPointer = (e) => onMove(e.clientX, e.clientY);
    const onTouch = (e) => {
      const touch = e.touches[0];
      if (touch) onMove(touch.clientX, touch.clientY);
    };

    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });

    Promise.all([loadImage(base), loadImage(reveal)])
      .then(([b, r]) => {
        if (disposed) return;
        imageAspect = b.naturalWidth / b.naturalHeight;
        baseTex = texture(gl, b);
        revealTex = texture(gl, r);
        resize();
        ro.observe(wrap);
        io.observe(wrap);
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("touchmove", onTouch, { passive: true });
        draw(performance.now(), 0);
        setReady(true);

        // Hint at the effect once, shortly after load.
        window.setTimeout(() => {
          if (disposed || userMoved) return;
          introUntil = performance.now() + 2200;
          pointer.x = -1;
          kick();
        }, 900);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      targets.forEach((t) => gl.deleteTexture(t));
      fbos.forEach((f) => gl.deleteFramebuffer(f));
      if (baseTex) gl.deleteTexture(baseTex);
      if (revealTex) gl.deleteTexture(revealTex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(trailProg.p);
      gl.deleteProgram(compProg.p);
    };
  }, [base, reveal]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <Image
        src={base}
        alt={alt}
        fill
        unoptimized
        preload
        sizes="100vw"
        className="object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
