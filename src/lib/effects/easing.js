export function easeOutCubic(p) {
  return 1 - Math.pow(1 - p, 3);
}
