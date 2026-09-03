export function getStickyPageHeaderProgress(
  scrollTop: number,
  reduceMotion: boolean,
) {
  if (reduceMotion) return 1;
  return Math.min(Math.max(scrollTop / 120, 0), 1);
}

export function getStickyPageHeaderPadding(progress: number) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  return 20 * (1 - clampedProgress);
}
