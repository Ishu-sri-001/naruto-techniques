// Small geometry helpers shared by gesture pose detectors.
// Landmark indices follow the MediaPipe Hand Landmarker convention:
// 0 wrist, 1-4 thumb, 5-8 index, 9-12 middle, 13-16 ring, 17-20 pinky
// (each finger: MCP, PIP, DIP, TIP order except thumb which is CMC, MCP, IP, TIP).

export function dist2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function centroid(landmarks) {
  let x = 0;
  let y = 0;
  for (const p of landmarks) {
    x += p.x;
    y += p.y;
  }
  return { x: x / landmarks.length, y: y / landmarks.length };
}

/**
 * A finger is considered "extended" when its tip sits meaningfully farther
 * from the wrist than its PIP joint does. This is orientation-tolerant
 * (works whether the hand is upright, sideways, or tilted toward camera)
 * unlike a plain y-coordinate comparison.
 */
export function isFingerExtended(landmarks, tipIdx, pipIdx, wristIdx = 0, ratio = 1.15) {
  const wrist = landmarks[wristIdx];
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  return dist2D(tip, wrist) > dist2D(pip, wrist) * ratio;
}

export function handScale(landmarks) {
  // Wrist-to-middle-MCP distance as a stable proxy for "how big is this
  // hand in the frame", used to scale proximity thresholds by hand size
  // (i.e. distance from camera) instead of a fixed pixel/normalized value.
  return dist2D(landmarks[0], landmarks[9]);
}

/** Average of the wrist and the four finger MCP joints — a stable "center of the palm" point. */
export function palmCenter(landmarks) {
  const idxs = [0, 5, 9, 13, 17];
  let x = 0;
  let y = 0;
  for (const i of idxs) {
    x += landmarks[i].x;
    y += landmarks[i].y;
  }
  return { x: x / idxs.length, y: y / idxs.length };
}

/** A flat/open hand: index, middle, ring, and pinky all extended. */
export function isAllFingersExtended(landmarks) {
  return (
    isFingerExtended(landmarks, 8, 6) &&
    isFingerExtended(landmarks, 12, 10) &&
    isFingerExtended(landmarks, 16, 14, 0, 1.0) &&
    isFingerExtended(landmarks, 20, 18, 0, 1.0)
  );
}

/**
 * Which way a hand's fingers point, as an angle in degrees folded into
 * [0, 180) — a line has no inherent direction, so 0 and 180 are the same
 * orientation. Used to tell a vertical hand apart from a horizontal one
 * regardless of which way it happens to be facing.
 */
export function handDirectionAngleDeg(landmarks) {
  const wrist = landmarks[0];
  const tip = landmarks[12];
  const dx = tip.x - wrist.x;
  const dy = tip.y - wrist.y;
  const deg = Math.atan2(-dy, dx) * (180 / Math.PI);
  return ((deg % 180) + 180) % 180;
}

/** Smallest angle between two [0,180)-folded orientations — 0 = parallel, 90 = perpendicular. */
export function angularDistanceDeg(a, b) {
  const d = Math.abs(a - b) % 180;
  return d > 90 ? 180 - d : d;
}

/** How many of the four fingers (index, middle, ring, pinky) are extended, 0-4. */
export function countExtendedFingers(landmarks) {
  let n = 0;
  if (isFingerExtended(landmarks, 8, 6)) n++;
  if (isFingerExtended(landmarks, 12, 10)) n++;
  if (isFingerExtended(landmarks, 16, 14, 0, 1.0)) n++;
  if (isFingerExtended(landmarks, 20, 18, 0, 1.0)) n++;
  return n;
}
