import {
  angularDistanceDeg,
  centroid,
  countExtendedFingers,
  dist2D,
  handDirectionAngleDeg,
  handScale,
} from "./handGeometry";

// A hand with at least one finger raised but not fully open (rules out a
// closed fist and a fully flat/open palm) — forgiving of whether the user
// happens to hold up one finger or two, since that's hard to pin down
// precisely from a webcam angle.
function isPartiallyRaisedHand(landmarks) {
  const n = countExtendedFingers(landmarks);
  return n >= 1 && n <= 3;
}

function isCrossSealPose(handsLandmarks) {
  if (!handsLandmarks || handsLandmarks.length < 2) return false;
  const [a, b] = handsLandmarks;
  if (!isPartiallyRaisedHand(a) || !isPartiallyRaisedHand(b)) return false;

  const proximity = dist2D(centroid(a), centroid(b));
  const avgScale = (handScale(a) + handScale(b)) / 2;
  if (proximity > avgScale * 3) return false;

  // The two hands should cross at roughly a right angle — one vertical,
  // one horizontal — rather than sit side by side pointing the same way.
  const angleDiff = angularDistanceDeg(handDirectionAngleDeg(a), handDirectionAngleDeg(b));
  return angleDiff > 40;
}

/**
 * Gesture definition consumed by GestureEngine. Each stage's `match` is a
 * pure, per-frame check (no state) — hold-time, sequencing, and cooldown
 * bookkeeping all live in the engine so gesture modules stay this simple.
 * A single-stage gesture like this one is just a one-step "sequence".
 */
export const shadowCloneGesture = {
  id: "shadowClone",
  name: "Kage Bunshin no Jutsu",
  subtitle: "Shadow Clone Jutsu",
  cooldownMs: 4000,
  emojiSequence: ["🤞", "🤞"],
  stages: [
    {
      id: "seal",
      label: "Cross both hands at a right angle, a finger or two raised on each",
      holdMs: 350,
      match: isCrossSealPose,
    },
  ],
};
