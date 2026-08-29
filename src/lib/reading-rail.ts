export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getReadingProgress(
  scrollTop: number,
  start: number,
  end: number,
) {
  const distance = end - start;

  if (distance <= 0) return 0;

  return clamp((scrollTop - start) / distance, 0, 1);
}

export function getScrollTopForProgress(
  progress: number,
  start: number,
  end: number,
) {
  const distance = end - start;

  if (distance <= 0) return start;

  return start + clamp(progress, 0, 1) * distance;
}

export function getProximityStrength(
  pointerPosition: number,
  markerPosition: number,
  radius: number,
) {
  if (radius <= 0) return 0;

  const distance = Math.abs(pointerPosition - markerPosition);
  const boundaryTolerance =
    Number.EPSILON *
    Math.max(1, Math.abs(pointerPosition), Math.abs(markerPosition), radius) *
    4;
  if (distance >= radius - boundaryTolerance) return 0;

  return clamp(1 - distance / radius, 0, 1);
}

export function getActiveHeadingIndex(
  headingTops: number[],
  readingAnchor: number,
) {
  let activeIndex = -1;

  for (let index = 0; index < headingTops.length; index += 1) {
    if (headingTops[index] > readingAnchor) break;
    activeIndex = index;
  }

  return activeIndex;
}

export function getRailSegmentProgresses(count: number) {
  if (count <= 0) return [];
  if (count === 1) return [0];

  return Array.from({ length: count }, (_, index) => index / (count - 1));
}

export function getRailDashScale(
  segmentProgress: number,
  focusProgress: number,
  radius: number,
) {
  return (
    1 + getProximityStrength(segmentProgress, focusProgress, radius) * 3.5
  );
}

export function getNearestProgressIndex(
  progresses: number[],
  targetProgress: number,
) {
  if (progresses.length === 0) return -1;

  let closestIndex = 0;
  let closestDistance = Math.abs(progresses[0] - targetProgress);

  for (let index = 1; index < progresses.length; index += 1) {
    const distance = Math.abs(progresses[index] - targetProgress);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}

export function getPreviewPanelOffset(
  progress: number,
  trackLength: number,
  panelLength: number,
) {
  return clamp(
    clamp(progress, 0, 1) * trackLength - panelLength / 2,
    0,
    Math.max(trackLength - panelLength, 0),
  );
}

export function hasRailDragMoved(
  startPosition: number,
  currentPosition: number,
  threshold: number,
) {
  return Math.abs(currentPosition - startPosition) >= Math.max(threshold, 0);
}

export function getRailDragProgress(
  startProgress: number,
  startPosition: number,
  currentPosition: number,
  trackLength: number,
) {
  if (trackLength <= 0) return clamp(startProgress, 0, 1);

  return clamp(
    startProgress + (currentPosition - startPosition) / trackLength,
    0,
    1,
  );
}

export function getRailDragScrollTop(
  startScrollTop: number,
  startPosition: number,
  currentPosition: number,
  gain: number,
  minimum: number,
  maximum: number,
) {
  return clamp(
    startScrollTop + (currentPosition - startPosition) * Math.max(gain, 0),
    minimum,
    maximum,
  );
}

export function getSmoothedRailScrollTop(
  currentScrollTop: number,
  targetScrollTop: number,
  strength: number,
  snapDistance: number,
) {
  if (
    Math.abs(targetScrollTop - currentScrollTop) <= Math.max(snapDistance, 0)
  ) {
    return targetScrollTop;
  }

  return (
    currentScrollTop +
    (targetScrollTop - currentScrollTop) * clamp(strength, 0, 1)
  );
}

export function getRailPointerTransition(
  dragging: boolean,
  phase: "move" | "press" | "release" | "cancel" | "leave",
) {
  if (phase === "press") {
    return { dragging: true, shouldScroll: false };
  }

  if (phase === "move") {
    return { dragging, shouldScroll: dragging };
  }

  return { dragging: false, shouldScroll: false };
}
