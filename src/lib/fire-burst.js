import { gsap } from "@/lib/motion";

/*
 * Katon burst for the footer's Back to top seal.
 *
 * Builds a fixed overlay on <body> (so it stays on screen while the page
 * scrolls away beneath it) and plays, from the seal's centre:
 *   heat flash → shockwave rings → flame tongues + sparks → billowing smoke,
 * then a fireball that climbs to the top of the viewport over `rise` seconds,
 * shedding smoke and embers, and bursts into a last puff as it leaves.
 *
 * Particle looks live in globals.css (.fx-*); sizes scale from `size`, the
 * seal's diameter, so the effect reads the same on every screen.
 * Returns { kill } to tear everything down early.
 */

const rand = gsap.utils.random;
const TAU = Math.PI * 2;

export function fireBurst({ x, y, size, rise = 2 }) {
  const layer = document.createElement("div");
  layer.className = "fx-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.style.setProperty("--fx-x", `${x}px`);
  layer.style.setProperty("--fx-y", `${y}px`);
  document.body.appendChild(layer);

  const spawn = (cls, w, h = w) => {
    const el = document.createElement("span");
    el.className = cls;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    layer.appendChild(el);
    return el;
  };
  const at = (px, py) => ({ xPercent: -50, yPercent: -50, x: px, y: py });

  const strays = new Set();
  const stray = (tween) => {
    strays.add(tween);
    tween.eventCallback("onComplete", () => {
      tween.targets().forEach((el) => el.remove());
      strays.delete(tween);
    });
  };

  const launchAt = 0.35;
  const exitAt = launchAt + rise;
  const tl = gsap.timeline({ onComplete: () => layer.remove() });

  // 1 — heat flash washes over the screen
  const heat = spawn("fx-heat", 0);
  heat.style.width = "";
  heat.style.height = "";
  tl.to(heat, { opacity: 0.6, duration: 0.15, ease: "power2.out" }, 0).to(
    heat,
    { opacity: 0, duration: 1.3, ease: "power2.inOut" },
    0.15,
  );

  // 2 — shockwave rings
  for (let i = 0; i < 2; i++) {
    const ring = spawn("fx-ring", size);
    tl.fromTo(
      ring,
      { ...at(x, y), scale: 0.4, opacity: 1 },
      { scale: 3.2 + i * 1.6, opacity: 0, duration: 0.8 + i * 0.25, ease: "expo.out" },
      i * 0.08,
    );
  }

  // 3 — core flare
  const core = spawn("fx-flame", size * 1.4, size * 1.8);
  tl.fromTo(
    core,
    { ...at(x, y), scale: 0.2, opacity: 1 },
    { scale: 2.2, duration: 0.3, ease: "power3.out" },
    0,
  ).to(core, { y: y - size, scale: 0.4, opacity: 0, duration: 0.6, ease: "power2.in" }, 0.3);

  // 4 — flame tongues, flung out then licking upwards
  for (let i = 0; i < 26; i++) {
    const angle = rand(0, TAU);
    const dist = size * rand(0.8, 2.4);
    const w = size * rand(0.35, 0.8);
    const flame = spawn("fx-flame", w, w * 1.5);
    const tx = x + Math.cos(angle) * dist;
    const ty = y + Math.sin(angle) * dist * 0.8 - size * rand(0.4, 1.4);
    tl.fromTo(
      flame,
      { ...at(x, y), scale: 0.3, opacity: 1, rotation: (angle * 180) / Math.PI + 90 },
      { x: tx, y: ty, scale: rand(0.9, 1.5), duration: rand(0.45, 0.8), ease: "power3.out" },
      rand(0, 0.08),
    ).to(
      flame,
      {
        y: ty - size * rand(0.6, 1.4),
        rotation: 0,
        scale: 0,
        opacity: 0,
        duration: rand(0.4, 0.7),
        ease: "power1.in",
      },
      ">-0.1",
    );
  }

  // 5 — sparks arc out and drop
  for (let i = 0; i < 34; i++) {
    const angle = rand(-Math.PI * 1.1, Math.PI * 0.1);
    const dist = size * rand(1.5, 4.5);
    const spark = spawn("fx-spark", size * rand(0.04, 0.09));
    const sy = y + Math.sin(angle) * dist;
    tl.fromTo(
      spark,
      { ...at(x, y), opacity: 1 },
      { x: x + Math.cos(angle) * dist, y: sy, duration: rand(0.6, 1.2), ease: "power3.out" },
      rand(0, 0.1),
    ).to(
      spark,
      { y: sy + size * rand(0.3, 0.9), opacity: 0, duration: rand(0.4, 0.8), ease: "power1.in" },
      ">-0.15",
    );
  }

  // 6 — smoke billows up behind the fire
  for (let i = 0; i < 18; i++) {
    const angle = rand(0, TAU);
    const dist = size * rand(0.3, 1.6);
    const puff = spawn("fx-smoke", size * rand(1, 2));
    const start = rand(0.1, 0.45);
    const life = rand(1.8, 2.8);
    tl.fromTo(
      puff,
      {
        ...at(x + Math.cos(angle) * dist * 0.5, y + Math.sin(angle) * dist * 0.5),
        scale: 0.3,
        rotation: rand(0, 360),
      },
      {
        x: x + Math.cos(angle) * dist * 1.4 + size * rand(-0.3, 0.3),
        y: y + Math.sin(angle) * dist - size * rand(1.2, 3),
        scale: rand(1.8, 3),
        rotation: `+=${rand(-90, 90)}`,
        duration: life,
        ease: "power2.out",
      },
      start,
    )
      .to(puff, { opacity: rand(0.5, 0.85), duration: 0.4, ease: "power1.out" }, start)
      .to(puff, { opacity: 0, duration: life * 0.6, ease: "power1.in" }, start + life * 0.4);
  }

  // 7 — fireball climbs the screen with the scroll, trailing smoke and embers
  const orb = spawn("fx-orb", size * 1.1);
  const exitX = x - size * rand(0.5, 1.5);
  const exitY = -size * 1.5;
  let lastTrail = 0;
  const trail = function () {
    const now = this.time();
    if (now - lastTrail < 0.045) return;
    lastTrail = now;
    const ox = gsap.getProperty(orb, "x");
    const oy = gsap.getProperty(orb, "y");

    const puff = spawn("fx-smoke", size * rand(0.7, 1.3));
    gsap.set(puff, { ...at(ox + size * rand(-0.2, 0.2), oy), scale: 0.4, opacity: 0.7 });
    stray(
      gsap.to(puff, {
        x: `+=${size * rand(-0.6, 0.6)}`,
        y: `+=${size * rand(0.2, 0.8)}`,
        scale: rand(1.6, 2.6),
        opacity: 0,
        duration: rand(1.2, 1.8),
        ease: "power2.out",
      }),
    );

    const ember = spawn("fx-flame", size * 0.5, size * 0.75);
    gsap.set(ember, { ...at(ox, oy), scale: rand(0.6, 1), opacity: 0.9 });
    stray(
      gsap.to(ember, {
        x: `+=${size * rand(-0.4, 0.4)}`,
        y: `+=${size * rand(0.2, 0.6)}`,
        scale: 0,
        opacity: 0,
        duration: rand(0.4, 0.7),
        ease: "power1.out",
      }),
    );
  };

  tl.fromTo(
    orb,
    { ...at(x, y), scale: 0, opacity: 1 },
    { scale: 1, duration: 0.3, ease: "back.out(2)" },
    0.1,
  ).to(orb, { x: exitX, y: exitY, duration: rise, ease: "power2.in", onUpdate: trail }, launchAt);

  // 8 — a last puff as it leaves the top of the screen
  for (let i = 0; i < 12; i++) {
    const puff = spawn("fx-smoke", size * rand(1.4, 2.6));
    const angle = rand(0, Math.PI);
    const dist = size * rand(0.5, 2.4);
    tl.fromTo(
      puff,
      { ...at(exitX, 0), scale: 0.3, opacity: 0.8 },
      {
        x: exitX + Math.cos(angle) * dist * 1.4,
        y: Math.sin(angle) * dist,
        scale: rand(1.6, 2.8),
        opacity: 0,
        duration: rand(1.2, 1.9),
        ease: "power2.out",
      },
      exitAt - 0.15 + rand(0, 0.1),
    );
  }

  // Keep the layer until the last trail puffs have faded.
  tl.set({}, {}, exitAt + 2);

  return {
    kill() {
      tl.kill();
      strays.forEach((t) => t.kill());
      strays.clear();
      layer.remove();
    },
  };
}
