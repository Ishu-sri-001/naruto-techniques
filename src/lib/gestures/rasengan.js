import { isAllFingersExtended, isFingerExtended } from "./handGeometry";

// A relaxed fist — all four fingers curled toward the palm. Used as the
// "gather chakra" opening stage.
function isFist(landmarks) {
  const indexCurled = !isFingerExtended(landmarks, 8, 6);
  const middleCurled = !isFingerExtended(landmarks, 12, 10);
  const ringCurled = !isFingerExtended(landmarks, 16, 14, 0, 1.0);
  const pinkyCurled = !isFingerExtended(landmarks, 20, 18, 0, 1.0);
  return indexCurled && middleCurled && ringCurled && pinkyCurled;
}

// An open hand, all four fingers extended — held palm-up like cupping a
// ball, matching the reference pose for the finished Rasengan.
export function isOpenPalm(landmarks) {
  return isAllFingersExtended(landmarks);
}

export function isRasenganGatherPose(handsLandmarks) {
  return !!handsLandmarks && handsLandmarks.some(isFist);
}

export function isRasenganReleasePose(handsLandmarks) {
  return !!handsLandmarks && handsLandmarks.some(isOpenPalm);
}

/**
 * Single hand, two stages: clench a fist to gather chakra, then open the
 * palm face-up to let the sphere form — like Naruto training the technique
 * with Kakashi. Only one hand needs to show each shape at a time.
 */
export const rasenganGesture = {
  id: "rasengan",
  name: "Rasengan",
  subtitle: "Spiraling Sphere",
  cooldownMs: 5000,
  stageTimeoutMs: 3000,
  emojiSequence: ["✊", "🖐️"],
  stages: [
    {
      id: "gather",
      label: "Clench one fist to gather chakra",
      emoji: "✊",
      holdMs: 300,
      match: isRasenganGatherPose,
    },
    {
      id: "release",
      label: "Open that palm face-up to form the sphere",
      emoji: "🖐️",
      holdMs: 400,
      match: isRasenganReleasePose,
    },
  ],
};
