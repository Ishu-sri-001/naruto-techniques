// Hand poses as 21 landmarks in MediaPipe order (0 wrist, 1-4 thumb,
// 5-8 index, 9-12 middle, 13-16 ring, 17-20 pinky). Local units: wrist at
// the origin, fingers pointing up (−y), roughly 100 units wrist to tip.
// Used to draw hand skeletons and to drive effect previews.

export const HAND_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

export const FINGER_TIPS = new Set([4, 8, 12, 16, 20]);

// Kage Bunshin hand: index and middle extended, ring and pinky curled,
// thumb folded across.
export const SEAL_HAND = [
  [0, 0], [-14, -8], [-22, -20], [-18, -34], [-6, -40],
  [-12, -48], [-13, -70], [-13, -86], [-13, -100],
  [0, -50], [1, -74], [1, -91], [1, -106],
  [11, -47], [15, -60], [11, -53], [7, -45],
  [20, -41], [24, -51], [20, -46], [16, -40],
];

// Rasengan, stage one: a relaxed fist.
export const FIST = [
  [0, 0], [-16, -10], [-26, -22], [-22, -36], [-10, -42],
  [-14, -48], [-16, -64], [-10, -56], [-8, -48],
  [0, -50], [0, -66], [3, -57], [3, -49],
  [12, -47], [14, -61], [15, -53], [13, -46],
  [21, -41], [24, -53], [23, -46], [20, -41],
];

// Rasengan, stage two: an open palm, fingers spread.
export const OPEN_PALM = [
  [0, 0], [-16, -10], [-30, -20], [-40, -30], [-48, -38],
  [-14, -46], [-18, -64], [-20, -76], [-22, -87],
  [0, -48], [0, -68], [0, -81], [0, -93],
  [13, -45], [16, -63], [18, -74], [19, -84],
  [24, -38], [31, -52], [35, -61], [38, -69],
];

// The Kage Bunshin cross in a 400 × 300 frame: a vertical hand in front
// and a horizontal one behind it. `center` is where the fingers cross.
export const SEAL_PAIR = {
  front: { x: 203, y: 250, angle: 0, scale: 1.05 },
  back: { x: 118, y: 182, angle: 88, scale: 1.05 },
  center: { x: 200, y: 158 },
  viewBox: "95 118 150 150",
};

export const pairTransform = ({ x, y, angle, scale }) =>
  `translate(${x} ${y}) rotate(${angle}) scale(${scale})`;
