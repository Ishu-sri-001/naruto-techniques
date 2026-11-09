// Sumi-ink text reveal, anime-title style, rendered in WebGL.
//
// inkIn(el) inks in all the text inside `el`:
//   - every word is rasterised at its exact on-screen position, in its own
//     font and colour (so mixed-colour headings keep their colours)
//   - the shader bleeds the glyphs outward and thresholds the bleed, so ink
//     pools appear where strokes are thickest and spread into the letters,
//     top-left to bottom-right
//   - fresh ink has wet, wobbling edges, a darker rim where it pools,
//     feathered bleed into paper fibres and a dry-brush texture
//   - a few rough splatter drops spark and fade
// As it settles the ink converges on the real glyphs, the DOM text is
// revealed underneath and the ink canvas fades off.
//
// The DOM text stays in place the whole time (layout, selection, screen
// readers); it's only made invisible while the ink draws. Hiding uses
// `.ink:not(.ink-done)` in globals.css, so text with the `ink` class is
// hidden from first paint and revealed by adding `ink-done`.
//
// Every animation draws through ONE shared WebGL context and copies the
// result into its own 2D canvas, so any number of texts can ink at once
// without hitting the browser's WebGL context limit.

import { gsap, prefersReducedMotion } from "@/lib/motion";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uText;
uniform vec2 uTexel;
uniform float uRadius;
uniform float uProgress;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uAspect;
uniform float uSeed;
uniform vec4 uBox;

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
// Premultiplied glyph texture: rgb = colour * coverage, a = coverage.
vec4 tex(vec2 uv) { return texture2D(uText, uv); }

// Wide blur of the glyphs: the field the ink bleeds through.
vec4 bleed(vec2 uv) {
  vec4 s = tex(uv) * 2.0;
  float w = 2.0;
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5236;
    vec2 d = vec2(cos(a), sin(a)) * uTexel * uRadius;
    s += tex(uv + d * 0.5) * 1.2 + tex(uv + d) * 0.8;
    w += 2.0;
  }
  return s / w;
}

void main() {
  vec2 uv = vUv;
  vec2 q = uv * vec2(uAspect, 1.0);
  float n = fbm(q * 6.0 + uSeed);
  float grain = noise(q * 40.0 + uSeed * 3.0);

  // Writing order: left to right, then down the lines, a little ragged.
  float x = clamp((uv.x - uBox.x) / max(uBox.z - uBox.x, 0.001), 0.0, 1.0);
  float y = clamp((uBox.w - uv.y) / max(uBox.w - uBox.y, 0.001), 0.0, 1.0);
  float order = mix(x, y, 0.45);
  float p = clamp(uProgress * 1.7 - order * 0.7 - (n - 0.5) * 0.25, 0.0, 1.0);
  float wet = 1.0 - smoothstep(0.35, 1.0, p);
  float settle = smoothstep(0.45, 1.0, p);

  // Fresh ink wobbles at the edges.
  vec2 warp = (vec2(noise(q * 18.0 + uSeed), noise(q * 18.0 + uSeed + 7.0)) - 0.5)
            * uTexel * uRadius * 0.9 * wet;
  vec4 ta = tex(uv + warp);
  vec4 tb = bleed(uv + warp);
  float f = mix(tb.a * 1.3, ta.a, settle);

  // Ink colour: the bleed's average colour while wet, the glyph's own once set.
  vec3 wetCol = tb.a > 0.001 ? tb.rgb / tb.a : uColor;
  vec3 setCol = ta.a > 0.01 ? ta.rgb / ta.a : wetCol;
  vec3 inkCol = mix(wetCol, setCol, settle);

  // The threshold falls as the ink soaks in, so pools grow into letters.
  float th = mix(1.05, 0.62, smoothstep(0.0, 0.55, p)) + (n - 0.5) * 0.3 * wet;
  float edge = mix(0.05, 0.16, settle);
  float ink = smoothstep(th - edge, th + edge, f);
  // Hand over to the glyphs' own coverage at the end, so the settled ink
  // matches the weight of the DOM text it is about to reveal.
  ink = mix(ink, pow(ta.a, 1.8), smoothstep(0.7, 1.0, p));

  float rim = ink * (1.0 - smoothstep(th + edge, th + 0.25, f)) * wet;
  float fibres = smoothstep(0.45, 0.8, fbm(q * vec2(60.0, 14.0) + uSeed));
  float feather = smoothstep(th - 0.3, th - edge, f) * (1.0 - ink) * fibres * 0.55 * wet;
  float dry = mix(0.75 + 0.25 * grain, 1.0, settle);

  // Splatter: rough drops plus small satellite flecks.
  float drops = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i) + uSeed;
    vec2 c = vec2(mix(uBox.x, uBox.z, hash(vec2(fi, 1.3))),
                  mix(uBox.y - 0.1, uBox.w + 0.1, hash(vec2(fi, 7.1))));
    float t0 = 0.08 + hash(vec2(fi, 3.7)) * 0.4;
    float life = clamp((uProgress - t0) / 0.35, 0.0, 1.0);
    float grow = smoothstep(0.0, 0.25, life);
    float fade = 1.0 - smoothstep(0.4, 1.0, life);
    float r = (0.02 + hash(vec2(fi, 9.2)) * 0.03) * grow;
    vec2 d = (uv - c) * vec2(uAspect, 1.0);
    float rough = (noise(d * 90.0 + fi) - 0.5) * 0.015;
    drops = max(drops, smoothstep(r, r * 0.6, length(d) + rough) * fade);
    vec2 d2 = d - (vec2(hash(vec2(fi, 2.0)), hash(vec2(fi, 5.0))) - 0.5) * 0.15;
    drops = max(drops, smoothstep(r * 0.35, r * 0.15, length(d2)) * fade);
  }

  float inkA = clamp(max(ink * dry, feather), 0.0, 1.0);
  vec3 col = mix(uColor, inkCol * (1.0 - rim * 0.3), step(drops, inkA));
  float alpha = clamp(max(inkA, drops), 0.0, 1.0) * uAlpha;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

// ---------- one shared WebGL renderer ----------

let shared = null;

function renderer() {
  if (shared !== null) return shared;
  shared = false;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, preserveDrawingBuffer: true });
  if (!gl) return shared;
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return shared;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return shared;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const loc = {};
  ["uText", "uTexel", "uRadius", "uProgress", "uColor", "uAlpha", "uAspect", "uSeed", "uBox"].forEach((n) => {
    loc[n] = gl.getUniformLocation(prog, n);
  });
  gl.uniform1i(loc.uText, 0);
  shared = { canvas, gl, loc };
  return shared;
}

// Draw one frame of a job into its own 2D canvas.
function drawJob(job, progress) {
  const { canvas, gl, loc } = shared;
  const { w, h } = job;
  if (canvas.width < w || canvas.height < h) {
    canvas.width = Math.max(canvas.width, w);
    canvas.height = Math.max(canvas.height, h);
  }
  gl.viewport(0, 0, w, h);
  gl.bindTexture(gl.TEXTURE_2D, job.texture);
  gl.uniform2f(loc.uTexel, 1 / w, 1 / h);
  gl.uniform1f(loc.uRadius, job.radius);
  gl.uniform1f(loc.uProgress, progress);
  gl.uniform3f(loc.uColor, ...job.color);
  gl.uniform1f(loc.uAlpha, job.alpha);
  gl.uniform1f(loc.uAspect, w / h);
  gl.uniform1f(loc.uSeed, job.seed);
  gl.uniform4f(loc.uBox, ...job.box);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  // The viewport sits in the bottom-left of the shared canvas.
  job.ctx.clearRect(0, 0, w, h);
  job.ctx.drawImage(canvas, 0, canvas.height - h, w, h, 0, 0, w, h);
}

// ---------- rasterising the element's text ----------

const probe = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  return c.getContext("2d", { willReadFrequently: true });
};
let probeCtx = null;

// Any CSS colour (incl. color-mix / color()) → [r, g, b, a] in 0..1.
function rgba(css) {
  probeCtx ??= probe();
  probeCtx.clearRect(0, 0, 1, 1);
  probeCtx.fillStyle = css;
  probeCtx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255, a / 255];
}

const casing = (t, mode) =>
  mode === "uppercase" ? t.toUpperCase() : mode === "lowercase" ? t.toLowerCase() : t;

function rasterise(el, w, h, dpr, margin, rootRect) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.textBaseline = "alphabetic";
  const range = document.createRange();
  const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  let color = null;
  let fontSize = 16;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent.closest("svg, canvas, [data-ink-skip]")) continue;
    const cs = getComputedStyle(parent);
    const size = parseFloat(cs.fontSize);
    const [r, g, b, a] = rgba(cs.color);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${size * dpr}px ${cs.fontFamily}`;
    ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : `${parseFloat(cs.letterSpacing) * dpr}px`;
    ctx.fillStyle = `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

    const re = /\S+/g;
    const raw = node.textContent;
    let m;
    while ((m = re.exec(raw))) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      if (!color) {
        color = [r, g, b, a];
        fontSize = size;
      }
      const word = casing(m[0], cs.textTransform);
      const metrics = ctx.measureText(word);
      const asc = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
      const desc = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
      const left = (rect.left - rootRect.left + margin) * dpr;
      const top = (rect.top - rootRect.top + margin) * dpr;
      ctx.fillText(word, left, top + (rect.height * dpr - (asc + desc)) / 2 + asc);
      box.x0 = Math.min(box.x0, left);
      box.x1 = Math.max(box.x1, left + rect.width * dpr);
      box.y0 = Math.min(box.y0, top);
      box.y1 = Math.max(box.y1, top + rect.height * dpr);
    }
  }
  return color ? { image: c, box, color, fontSize } : null;
}

// ---------- public API ----------

const done = (el) => el.classList.add("ink-done");

/** Hide `el`'s text again, ready to ink in. */
export function inkReset(el) {
  el.classList.add("ink");
  el.classList.remove("ink-done");
}

/**
 * Ink in the text inside `el`. Returns a function that cancels the
 * animation (leaving the text hidden unless it had already finished).
 */
export function inkIn(el, { delay = 0 } = {}) {
  el.classList.add("ink");
  const r = !prefersReducedMotion() && renderer();
  if (!r) {
    done(el);
    return () => {};
  }

  const rootRect = el.getBoundingClientRect();
  if (!rootRect.width || !rootRect.height) {
    done(el);
    return () => {};
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const sizeGuess = parseFloat(getComputedStyle(el).fontSize) || 16;
  const margin = sizeGuess * 0.6;
  const cssW = rootRect.width + margin * 2;
  const cssH = rootRect.height + margin * 2;
  const w = Math.max(1, Math.round(cssW * dpr));
  const h = Math.max(1, Math.round(cssH * dpr));

  const raster = rasterise(el, w, h, dpr, margin, rootRect);
  if (!raster) {
    done(el);
    return () => {};
  }

  const { gl } = r;
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster.image);

  // The ink canvas sits over the element, a margin wider for the bleed.
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.setAttribute("aria-hidden", "true");
  out.dataset.inkCanvas = "";
  const style = getComputedStyle(el);
  const restorePosition = style.position === "static";
  if (restorePosition) el.style.position = "relative";
  Object.assign(out.style, {
    position: "absolute",
    left: `${-margin - el.clientLeft}px`,
    top: `${-margin - el.clientTop}px`,
    width: `${cssW}px`,
    height: `${cssH}px`,
    pointerEvents: "none",
    maxWidth: "none",
  });
  el.appendChild(out);

  const { box } = raster;
  const text = el.textContent || "";
  const job = {
    w,
    h,
    texture,
    ctx: out.getContext("2d"),
    radius: raster.fontSize * dpr * 0.18,
    color: raster.color.slice(0, 3),
    alpha: raster.color[3],
    seed: (text.length * 7.3) % 10,
    box: [box.x0 / w, 1 - box.y1 / h, box.x1 / w, 1 - box.y0 / h],
  };

  let finished = false;
  const cleanup = () => {
    out.remove();
    if (restorePosition) el.style.position = "";
    gl.deleteTexture(texture);
  };

  const state = { p: 0 };
  drawJob(job, 0);
  const duration = 2 + Math.min(text.length, 40) * 0.03;
  const handoff = duration * 0.7;
  const tl = gsap
    .timeline({ delay })
    .to(state, { p: 1.25, duration, ease: "power1.out", onUpdate: () => drawJob(job, state.p) }, 0)
    .call(() => done(el), null, handoff)
    .to(out, { opacity: 0, duration: duration * 0.4, ease: "power1.inOut" }, handoff)
    .call(() => {
      finished = true;
      cleanup();
    });

  return () => {
    if (finished) return;
    tl.kill();
    cleanup();
  };
}
