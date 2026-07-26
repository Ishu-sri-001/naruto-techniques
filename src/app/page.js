import Link from "next/link";
import JutsuSealRing from "@/components/JutsuSealRing";

function CameraGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M8 7l1.4-2.2h5.2L16 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.2" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function SealGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="4.5" y="4.5" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SparkGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M12 2.5v4.2M12 17.3v4.2M2.5 12h4.2M17.3 12h4.2M5.4 5.4l3 3M15.6 15.6l3 3M18.6 5.4l-3 3M8.4 15.6l-3 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" fillOpacity="0.75" />
    </svg>
  );
}

const steps = [
  {
    n: "01",
    kanji: "一",
    title: "Allow the camera",
    body: "Open the training grounds and grant camera access. Nothing leaves your device.",
    glyph: CameraGlyph,
    ring: "border-bone/25",
    tone: "text-muted",
  },
  {
    n: "02",
    kanji: "二",
    title: "Form the seal",
    body: "Match the hand sign shown on screen and hold it for a moment.",
    glyph: SealGlyph,
    ring: "border-hanko/50",
    tone: "text-hanko",
  },
  {
    n: "03",
    kanji: "三",
    title: "Watch it happen",
    body: "The technique's effect plays out live over your own camera feed.",
    glyph: SparkGlyph,
    ring: "border-chakra/60",
    tone: "text-chakra",
    glow: true,
  },
];

function RasenganGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
      <path
        d="M16 4c6.6 0 12 5.4 12 12M16 4C9.4 4 4 9.4 4 16m12-8v4M4 16c0 6.6 5.4 12 12 12m-12-12h4m8 12c6.6 0 12-5.4 12-12m-12 12v-4m12-8h-4"
        fill="none"
        stroke="var(--color-chakra)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3.2" fill="var(--color-chakra)" fillOpacity="0.7" />
    </svg>
  );
}

function KageBunshinGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="16" r="8" fill="none" stroke="var(--color-bone)" strokeOpacity="0.85" strokeWidth="1.6" />
      <circle cx="20" cy="16" r="8" fill="none" stroke="var(--color-bone)" strokeOpacity="0.4" strokeWidth="1.6" />
    </svg>
  );
}

function FireGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
      <path
        d="M16 4c1 4-3 5-3 9a5 5 0 0 0 10 0c0-2-1-3-1-3 1 3-1 4-1 4 1-5-4-6-3-10-3 1-6 5-6 9a6 6 0 0 0 12 0c0-5-4-7-8-9Z"
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const techniques = [
  {
    name: "Kage Bunshin no Jutsu",
    kanji: "影分身の術",
    rank: "B",
    glyph: KageBunshinGlyph,
    body: "Cross both hands at a right angle, a finger or two raised on each. Hold it, and clones of you fan out on screen.",
    status: null,
  },
  {
    name: "Rasengan",
    kanji: "螺旋丸",
    rank: "A",
    glyph: RasenganGlyph,
    body: "Clench one fist, then open that palm face-up. A sphere forms above your hand and follows it live.",
    status: null,
  },
  {
    name: "Fire Style",
    kanji: "火遁",
    rank: "?",
    glyph: FireGlyph,
    body: "Not built yet.",
    status: "soon",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-ink text-bone">
      <header className="flex items-center justify-between px-6 py-8 sm:px-12 lg:px-20">
        <span className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 items-center justify-center bg-hanko font-display text-[13px] leading-none text-bone"
            aria-hidden="true"
          >
            術
          </span>
          <span className="font-medium tracking-tight">Naruto Techniques</span>
        </span>
        <Link
          href="/train"
          className="group text-sm text-chakra outline-none transition hover:text-bone focus-visible:ring-2 focus-visible:ring-chakra focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Begin training{" "}
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-6 sm:px-12 lg:px-20 lg:pt-10">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-8">
          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Vision-tracked jutsu, run entirely on-device
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Form the seal.
              <br />
              The camera reads it.
              <br />
              <span className="text-chakra">The jutsu happens.</span>
            </h1>
            <p className="mt-8 max-w-md text-lg text-muted">
              Hold the hand sign in front of your camera and its technique plays
              out live over your own feed — tracked on-device, nothing uploaded
              anywhere.
            </p>
            <div className="mt-9 flex items-center gap-6">
              <Link
                href="/train"
                className="group relative inline-flex items-center gap-2 bg-chakra px-6 py-3 text-sm font-medium text-ink outline-none transition hover:bg-bone focus-visible:ring-2 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Enter the training grounds
                <span
                  className="flex h-5 w-5 items-center justify-center bg-hanko text-[10px] font-display text-bone transition-transform duration-150 group-hover:translate-y-0.5"
                  aria-hidden="true"
                >
                  術
                </span>
              </Link>
              <a
                href="#techniques"
                className="text-sm text-muted outline-none transition hover:text-bone focus-visible:ring-2 focus-visible:ring-chakra focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                See the techniques
              </a>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <JutsuSealRing className="h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96" />
          </div>
        </div>
      </section>

      <section className="border-t border-bone/10 px-6 py-14 sm:px-12 lg:px-20">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-chakra">
          How training works
        </h2>
        <p className="mt-3 max-w-sm text-sm text-muted">
          Three motions, same order every time — chakra builds through the
          seal and releases on the last step.
        </p>

        <ol className="mt-10 flex flex-col sm:flex-row sm:gap-10 lg:gap-16">
          {steps.map((s, i) => {
            const Glyph = s.glyph;
            const isLast = i === steps.length - 1;
            return (
              <li key={s.n} className="flex gap-5 sm:flex-1 sm:flex-col sm:gap-0">
                <div className="flex flex-col items-center sm:flex-row">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-panel ${s.ring} ${s.tone} ${
                      s.glow ? "step-badge-glow" : ""
                    }`}
                  >
                    <Glyph />
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="mt-1 w-px flex-1 bg-gradient-to-b from-bone/20 to-bone/0 sm:mt-0 sm:ml-3 sm:h-px sm:w-auto sm:bg-gradient-to-r sm:from-bone/25 sm:to-bone/0"
                    />
                  )}
                </div>
                <div className="pb-8 sm:pb-0 sm:pt-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-muted">{s.n}</span>
                    <span className="font-display text-sm text-bone/50">{s.kanji}</span>
                  </div>
                  <h3 className="mt-2 font-medium">{s.title}</h3>
                  <p className="mt-2 max-w-[22rem] text-sm text-muted">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="techniques" className="border-t border-bone/10 px-6 py-14 sm:px-12 lg:px-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-chakra">
            Techniques
          </h2>
          <p className="font-mono text-[11px] text-muted">
            2 of 3 stamped and trainable
          </p>
        </div>
        <p className="mt-3 max-w-sm text-sm text-muted">
          Ranked as they'd appear in a ninja registry — sealed entries are
          on the way.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {techniques.map((t) => {
            const Glyph = t.glyph;
            const locked = Boolean(t.status);
            return (
              <div
                key={t.name}
                className={`group relative border p-6 transition ${
                  locked
                    ? "border-bone/10 bg-panel/30"
                    : "border-bone/10 bg-panel/50 hover:-translate-y-0.5 hover:border-chakra/40"
                }`}
              >
                {locked && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, rgba(237,232,223,0.035) 0px, rgba(237,232,223,0.035) 1px, transparent 1px, transparent 10px)",
                    }}
                  />
                )}

                <div className="relative flex items-start justify-between gap-4">
                  <span
                    className={`font-mono text-[11px] tracking-[0.15em] ${
                      locked ? "text-hanko/70" : "text-chakra"
                    }`}
                  >
                    {locked ? "SEALED" : `${t.rank}-RANK`}
                  </span>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
                      locked
                        ? "border-bone/15 text-bone/30"
                        : "border-bone/25 text-bone/80 group-hover:border-chakra/50"
                    }`}
                  >
                    <Glyph />
                  </span>
                </div>

                <p className={`relative mt-4 ${locked ? "text-bone/40" : "text-lg font-medium"}`}>
                  {t.name}
                </p>
                <p className="relative mt-1 font-display text-sm text-muted">{t.kanji}</p>
                <p className="relative mt-3 text-sm text-muted">{t.body}</p>

                {locked && (
                  <p className="relative mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-hanko/80">
                    Seal unstamped — coming soon
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-auto flex items-center gap-2 border-t border-bone/10 px-6 py-8 font-mono text-xs text-muted sm:px-12 lg:px-20">
        <span
          className="h-1.5 w-1.5 rounded-full bg-chakra motion-safe:animate-pulse"
          aria-hidden="true"
        />
        Hand tracking and segmentation run on-device via MediaPipe. Nothing is uploaded.
      </footer>
    </div>
  );
}
