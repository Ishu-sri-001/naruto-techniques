import { HAND_BONES, FINGER_TIPS } from "@/data/hand-poses";

/*
 * One hand drawn as tracked landmarks: bones as lines, joints as dots.
 * `tone="light"` is for dark grounds (cream bones, chakra joints);
 * `tone="ink"` is for parchment (ink bones, hanko tips).
 * Bones carry pathLength/dasharray and data attributes so a parent
 * timeline can draw them in.
 */
const TONES = {
  light: { bone: "var(--cream)", boneOpacity: 0.85, joint: "var(--chakra)", tip: "var(--cream)" },
  ink: { bone: "var(--ink)", boneOpacity: 0.75, joint: "var(--bronze-deep)", tip: "var(--hanko)" },
};

export default function HandSkeleton({ landmarks, transform, tone = "light", strokeWidth = 1.8 }) {
  const c = TONES[tone];
  return (
    <g transform={transform}>
      {HAND_BONES.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          data-bone
          x1={landmarks[a][0]}
          y1={landmarks[a][1]}
          x2={landmarks[b][0]}
          y2={landmarks[b][1]}
          pathLength="1"
          strokeDasharray="1"
          style={{ stroke: c.bone, strokeOpacity: c.boneOpacity, strokeWidth, strokeLinecap: "round" }}
        />
      ))}
      {landmarks.map(([x, y], i) => (
        <circle
          key={i}
          data-joint
          cx={x}
          cy={y}
          r={FINGER_TIPS.has(i) ? strokeWidth * 2 : strokeWidth * 1.4}
          style={{ fill: FINGER_TIPS.has(i) ? c.tip : c.joint }}
        />
      ))}
    </g>
  );
}
