import HandSkeleton from "@/components/ui/HandSkeleton";
import { FIST, OPEN_PALM, SEAL_HAND, SEAL_PAIR, pairTransform } from "@/data/hand-poses";

/*
 * A technique's hand-sign sequence, drawn as small ink hand skeletons on
 * parchment with a caption under each and arrows between them.
 */

function SignPose({ pose }) {
  if (pose === "seal") {
    return (
      <svg viewBox={SEAL_PAIR.viewBox} className="h-14 w-14 max-sm:h-11 max-sm:w-11" aria-hidden="true">
        <HandSkeleton landmarks={SEAL_HAND} transform={pairTransform(SEAL_PAIR.back)} tone="ink" strokeWidth={2.4} />
        <HandSkeleton landmarks={SEAL_HAND} transform={pairTransform(SEAL_PAIR.front)} tone="ink" strokeWidth={2.4} />
      </svg>
    );
  }
  return (
    <svg viewBox="-55 -112 110 120" className="h-14 w-14 max-sm:h-11 max-sm:w-11" aria-hidden="true">
      <HandSkeleton landmarks={pose === "fist" ? FIST : OPEN_PALM} tone="ink" strokeWidth={2.4} />
    </svg>
  );
}

export default function TechniqueSigns({ signs }) {
  return (
    <div className="mt-4 flex items-end gap-3">
      {signs.map((s, i) => (
        <div key={s.label} className="flex items-end gap-3">
          {i > 0 && <span className="p-sm pb-6 text-ink/45" aria-hidden="true">→</span>}
          <figure className="flex flex-col items-center gap-1">
            <SignPose pose={s.pose} />
            <figcaption className="p-sm font-mono uppercase tracking-[0.2em] text-ink/60">{s.label}</figcaption>
          </figure>
        </div>
      ))}
    </div>
  );
}
