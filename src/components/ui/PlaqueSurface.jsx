"use client";

import { useEffect, useRef } from "react";

/*
 * The plaque's physical surface, rendered in WebGL so it reads as a real
 * object. The outline is a polygon (straight top and bottom; each end steps
 * in with a small concave scoop, then angles out to a point), evaluated as
 * a signed distance field. From that distance:
 *   - a raised wooden frame with a double-stepped bevel, grain and wear
 *   - aged parchment sitting lower, with fibres, stains, fine cracks and
 *     the frame's shadow falling onto it
 *   - a red ink rule inset along the whole outline
 *   - a domed brass rivet at each end
 * Lighting comes from a height field (normals by finite differences), lit
 * from the top-left; on hover the light follows the pointer and cracks
 * spread across the paper from where it came in. Fills its
 * parent; calls onReady(true) once it has drawn.
 */

const N = 20; // polygon vertices

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
#define N ${N}
varying vec2 vUv;
uniform vec2 uVerts[N];
uniform vec2 uSize;
uniform float uPoint;
uniform vec2 uLight;
uniform float uHover;
uniform vec2 uCrackOrigin;
uniform float uCrackReach;
uniform vec3 uPaper;
uniform vec3 uWood;
uniform vec3 uWoodLight;
uniform vec3 uWoodDeep;
uniform vec3 uRed;
uniform float uSeed;

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
}

// Signed distance to the outline polygon (negative inside).
float sdPoly(vec2 p) {
  float d = dot(p - uVerts[0], p - uVerts[0]);
  float s = 1.0;
  vec2 prev = uVerts[N - 1];
  for (int i = 0; i < N; i++) {
    vec2 v = uVerts[i];
    vec2 e = prev - v;
    vec2 w = p - v;
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= v.y, p.y < prev.y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s *= -1.0;
    prev = v;
  }
  return s * sqrt(d);
}
// Worn edge: the silhouette wanders by under a pixel.
float wornSd(vec2 p) {
  return sdPoly(p) + (fbm(p * 0.35 + uSeed) - 0.5) * 0.8;
}

// Fine meandering cracks in the parchment. A few are always there; on
// hover more split open, spreading out from where the pointer came in
// (uCrackOrigin) with a ragged front, until they cover the whole plaque.
float crackLine(vec2 p, float freq, float seed, float w) {
  return 1.0 - smoothstep(0.0, w, abs(fbm(p * freq + uSeed * seed) - 0.5));
}
float cracks(vec2 p) {
  float a = crackLine(p, 0.016, 7.0, 0.006);
  float b = crackLine(p, 0.022, 13.0, 0.006);
  float maskA = smoothstep(0.52, 0.62, fbm(p * 0.008 + uSeed * 11.0));
  float maskB = smoothstep(0.55, 0.65, fbm(p * 0.009 + uSeed * 17.0));
  float base = max(a * maskA, b * maskB);

  // Hover cracks: the same lines unmasked, plus finer hairline branches.
  float c = crackLine(p, 0.035, 19.0, 0.005) * smoothstep(0.4, 0.55, fbm(p * 0.02 + uSeed * 23.0));
  float spread = max(max(a, b) * 0.95, c * 0.7);
  float front = uCrackReach * (0.7 + 0.6 * fbm(p * 0.04 + uSeed * 29.0));
  float reached = 1.0 - smoothstep(front - 8.0, front, length(p - uCrackOrigin));
  return max(base, spread * reached);
}

vec2 rivetCenter(vec2 p) {
  return vec2(sign(p.x) * (uSize.x * 0.5 - uPoint * 0.58), 0.0);
}

float heightAt(vec2 p, float F) {
  float e = -wornSd(p);
  // Double-stepped frame: outer rim, a small step down, then the paper.
  float frame = smoothstep(0.0, 0.3 * F, e) - smoothstep(0.45 * F, 0.6 * F, e) * 0.22;
  float frameMask = 1.0 - smoothstep(F - 0.5, F + 0.5, e);
  float h = mix(0.32, frame, frameMask);
  float onPaper = 1.0 - frameMask;
  h += (fbm(p * 0.45 + uSeed * 2.0) - 0.5) * 0.05 * onPaper;
  h -= cracks(p) * 0.14 * onPaper;
  h += (noise(p * vec2(0.15, 1.6) + uSeed) - 0.5) * 0.1 * frameMask;
  // Domed rivet.
  float r = uSize.y * 0.075;
  float d = length(p - rivetCenter(p));
  h += sqrt(max(r * r - d * d, 0.0)) / r * 0.7;
  return h;
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float H = uSize.y;
  float F = 0.1 * H;
  float dd = wornSd(p);
  float alpha = smoothstep(0.6, -0.6, dd);
  if (alpha <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float e = -dd;

  float s = 0.6;
  float h0 = heightAt(p, F);
  float hx = heightAt(p + vec2(s, 0.0), F);
  float hy = heightAt(p + vec2(0.0, s), F);
  vec3 N3 = normalize(vec3((h0 - hx) * 5.0 / s, (h0 - hy) * 5.0 / s, 1.0));
  vec3 L = normalize(vec3(uLight, 0.9));
  vec3 Hv = normalize(L + vec3(0.0, 0.0, 1.0));
  float diff = clamp(dot(N3, L), 0.0, 1.0);

  float frameMask = 1.0 - smoothstep(F - 0.5, F + 0.5, e);
  float r = H * 0.075;
  float dr = length(p - rivetCenter(p));
  float rivet = smoothstep(r, r - 0.8, dr);

  // Frame: warm wood with grain, darker in the step, lighter where worn.
  float woodN = noise(p * vec2(0.08, 1.2) + uSeed) * 0.6 + noise(p * vec2(0.3, 3.0) + uSeed) * 0.4;
  vec3 wood = mix(mix(uWood, uWoodDeep, 0.35), uWood, woodN * 0.7);
  wood = mix(wood, uWoodDeep, smoothstep(0.4 * F, 0.55 * F, e) * 0.35);
  float wear = smoothstep(0.6, 0.85, fbm(p * 0.12 + uSeed + 3.0)) * (1.0 - smoothstep(0.5, 2.5, e));
  wood = mix(wood, uWoodLight, wear * 0.35);
  // A little red in the wood, like the reference's warm stained frame.
  wood = mix(wood, uRed, 0.18);

  // Paper: fibres, stains, cracks, the frame's shadow and darker edges.
  float fib = fbm(p * 0.35 + uSeed) * 0.6 + noise(p * 1.4 + uSeed) * 0.4;
  float stain = smoothstep(0.4, 0.8, fbm(p * 0.03 + uSeed * 5.0));
  vec3 paper = mix(uPaper, uWood, 0.28) * (0.94 + 0.14 * fib);
  paper = mix(paper, paper * vec3(0.8, 0.72, 0.62), stain * 0.5);
  paper *= mix(0.72, 1.0, smoothstep(F, F + 0.3 * H, e));
  paper = mix(paper, uWoodDeep * 0.75, cracks(p) * 0.45);

  // Red ink rule inset along the outline.
  float ec = -sdPoly(p);
  float rule = smoothstep(0.17 * H - 0.5, 0.17 * H, ec) * (1.0 - smoothstep(0.19 * H, 0.19 * H + 0.5, ec));
  paper = mix(paper, paper * uRed * 1.6, rule * 0.9);

  vec3 albedo = mix(paper, wood, frameMask);
  albedo = mix(albedo, mix(uWood, uWoodDeep, 0.3), rivet);

  float shine = mix(mix(0.05, 0.3, frameMask), 0.9, rivet);
  float spec = pow(max(dot(N3, Hv), 0.0), mix(mix(10.0, 28.0, frameMask), 40.0, rivet)) * shine;
  vec3 col = albedo * (0.5 + 0.65 * diff) + spec * vec3(1.0, 0.93, 0.8);
  col *= 1.0 + 0.06 * uHover;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

// Outline in CSS px, centred, y up. Straight top and bottom; each end has a
// concave scoop at the corner, then angles out to a blunt point.
function outline(w, h) {
  const hw = w / 2;
  const hh = h / 2;
  const P = 0.42 * h; // depth of each pointed end
  const r = 0.13 * h; // scoop radius
  const tip = 0.06 * h;
  const x0 = hw - P;
  const arc = (from, to, cy) =>
    Array.from({ length: 4 }, (_, i) => {
      const t = from + ((to - from) * i) / 3;
      return [x0 + r + r * Math.cos(t), cy + r * Math.sin(t)];
    });
  const right = [
    ...arc(Math.PI, Math.PI * 1.5, hh),
    [hw, tip],
    [hw, -tip],
    ...arc(Math.PI * 0.5, Math.PI, -hh),
  ];
  const left = right.map(([x, y]) => [-x, y]).reverse();
  return { verts: [...right, ...left], point: P };
}

// Resolve a CSS custom property (including color-mix values) to 0..1 RGB.
function resolveVar(host, name) {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  host.appendChild(probe);
  const css = getComputedStyle(probe).color;
  probe.remove();
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d");
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

const REST_LIGHT = [-0.45, 0.55];

export default function PlaqueSurface({ onReady }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const u = (n) => gl.getUniformLocation(prog, n);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.uniform3fv(u("uPaper"), resolveVar(host, "--parchment"));
    gl.uniform3fv(u("uWood"), resolveVar(host, "--bronze"));
    gl.uniform3fv(u("uWoodLight"), resolveVar(host, "--bronze-light"));
    gl.uniform3fv(u("uWoodDeep"), resolveVar(host, "--bronze-deep"));
    gl.uniform3fv(u("uRed"), resolveVar(host, "--hanko-deep"));
    gl.uniform1f(u("uSeed"), 3.7);

    const light = { x: REST_LIGHT[0], y: REST_LIGHT[1], hover: 0 };
    const target = { x: REST_LIGHT[0], y: REST_LIGHT[1], hover: 0 };
    // How far the hover cracks have spread (px), and where they start.
    const crack = { reach: 0, target: 0, x: 0, y: 0 };
    let size = { w: 1, h: 1 };
    let raf = 0;

    const draw = () => {
      gl.uniform2f(u("uLight"), light.x, light.y);
      gl.uniform1f(u("uHover"), light.hover);
      gl.uniform2f(u("uCrackOrigin"), crack.x, crack.y);
      gl.uniform1f(u("uCrackReach"), crack.reach);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("uSize"), r.width, r.height);
      size = { w: r.width, h: r.height };
      const { verts, point } = outline(r.width, r.height);
      gl.uniform2fv(u("uVerts"), new Float32Array(verts.flat()));
      gl.uniform1f(u("uPoint"), point);
      draw();
    };

    // Ease the light towards its target, then stop.
    const tick = () => {
      const k = 0.15;
      light.x += (target.x - light.x) * k;
      light.y += (target.y - light.y) * k;
      light.hover += (target.hover - light.hover) * k;
      // Cracks split open quickly and heal back a little slower.
      crack.reach += (crack.target - crack.reach) * (crack.target > crack.reach ? 0.05 : 0.07);
      draw();
      const moving =
        Math.abs(target.x - light.x) +
          Math.abs(target.y - light.y) +
          Math.abs(target.hover - light.hover) +
          Math.abs(crack.target - crack.reach) * 0.01 >
        0.002;
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Start the cracks where the pointer comes in; long enough to reach the
    // far end of the plaque from anywhere.
    const startCracks = (x, y) => {
      if (crack.reach < 4) {
        crack.x = x;
        crack.y = y;
      }
      crack.target = size.w * 1.3;
      kick();
    };
    const onEnter = (e) => {
      const r = host.getBoundingClientRect();
      startCracks(e.clientX - r.left - r.width / 2, r.height / 2 - (e.clientY - r.top));
    };
    const onFocus = () => startCracks(0, 0);

    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 1.4 - 0.2;
      target.y = (0.5 - (e.clientY - r.top) / r.height) * 1.4 + 0.3;
      target.hover = 1;
      kick();
    };
    const onLeave = () => {
      target.x = REST_LIGHT[0];
      target.y = REST_LIGHT[1];
      target.hover = 0;
      crack.target = 0;
      kick();
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("focus", onFocus);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("blur", onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    onReady?.(true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("focus", onFocus);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("blur", onLeave);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      onReady?.(false);
    };
  }, [onReady]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
