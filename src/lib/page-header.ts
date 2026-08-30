export function getStickyPageHeaderProgress(
  scrollTop: number,
  reduceMotion: boolean,
) {
  if (reduceMotion) return 1;
  return Math.min(Math.max(scrollTop / 120, 0), 1);
}
