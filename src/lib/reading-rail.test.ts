import { describe, expect, test } from "bun:test";

import {
  clamp,
  getActiveHeadingIndex,
  getNearestProgressIndex,
  getPreviewPanelOffset,
  getProximityStrength,
  getRailDragProgress,
  getRailDashScale,
  getRailDragScrollTop,
  getRailSegmentProgresses,
  getRailViewportOffset,
  getRailGestureEndAction,
  getReadingProgress,
  getScrollTopForProgress,
  hasRailDragMoved,
} from "./reading-rail";

describe("clamp", () => {
  test("keeps values inside the supplied boundaries", () => {
    expect(clamp(-0.2, 0, 1)).toBe(0);
    expect(clamp(0.35, 0, 1)).toBe(0.35);
    expect(clamp(1.8, 0, 1)).toBe(1);
  });
});

describe("reading progress", () => {
  test("maps the readable scroll span to a zero-to-one progress value", () => {
    expect(getReadingProgress(100, 200, 1_000)).toBe(0);
    expect(getReadingProgress(600, 200, 1_000)).toBe(0.5);
    expect(getReadingProgress(1_200, 200, 1_000)).toBe(1);
  });

  test("maps progress back to a clamped page scroll position", () => {
    expect(getScrollTopForProgress(-1, 200, 1_000)).toBe(200);
    expect(getScrollTopForProgress(0.25, 200, 1_000)).toBe(400);
    expect(getScrollTopForProgress(2, 200, 1_000)).toBe(1_000);
  });

  test("handles articles shorter than the viewport without invalid numbers", () => {
    expect(getReadingProgress(400, 500, 500)).toBe(0);
    expect(getScrollTopForProgress(0.8, 500, 500)).toBe(500);
  });
});

describe("getProximityStrength", () => {
  test("falls smoothly from full strength at the pointer to zero at the radius", () => {
    expect(getProximityStrength(120, 120, 80)).toBe(1);
    expect(getProximityStrength(120, 160, 80)).toBe(0.5);
    expect(getProximityStrength(120, 200, 80)).toBe(0);
    expect(getProximityStrength(120, 240, 80)).toBe(0);
  });

  test("disables proximity when the radius cannot describe an interaction", () => {
    expect(getProximityStrength(10, 10, 0)).toBe(0);
  });
});

describe("getActiveHeadingIndex", () => {
  test("selects the last heading crossed by the reading anchor", () => {
    const headingTops = [300, 720, 1_100];

    expect(getActiveHeadingIndex(headingTops, 250)).toBe(-1);
    expect(getActiveHeadingIndex(headingTops, 300)).toBe(0);
    expect(getActiveHeadingIndex(headingTops, 900)).toBe(1);
    expect(getActiveHeadingIndex(headingTops, 2_000)).toBe(2);
  });

  test("returns no active heading for an article without sections", () => {
    expect(getActiveHeadingIndex([], 600)).toBe(-1);
  });
});

describe("getRailSegmentProgresses", () => {
  test("distributes segments evenly across the complete reading range", () => {
    expect(getRailSegmentProgresses(3)).toEqual([0, 0.5, 1]);
    expect(getRailSegmentProgresses(1)).toEqual([0]);
    expect(getRailSegmentProgresses(0)).toEqual([]);
  });
});

describe("getRailDashScale", () => {
  test("creates a strong center with progressively shorter neighboring dashes", () => {
    expect(getRailDashScale(0.5, 0.5, 0.1)).toBe(4.5);
    expect(getRailDashScale(0.55, 0.5, 0.1)).toBeCloseTo(2.75);
    expect(getRailDashScale(0.6, 0.5, 0.1)).toBe(1);
    expect(getRailDashScale(0.8, 0.5, 0.1)).toBe(1);
  });
});

describe("getNearestProgressIndex", () => {
  test("selects the closest article heading to a rail position", () => {
    const headingProgresses = [0.08, 0.34, 0.72, 0.95];

    expect(getNearestProgressIndex(headingProgresses, 0)).toBe(0);
    expect(getNearestProgressIndex(headingProgresses, 0.4)).toBe(1);
    expect(getNearestProgressIndex(headingProgresses, 0.8)).toBe(2);
    expect(getNearestProgressIndex(headingProgresses, 1)).toBe(3);
  });

  test("returns no selection when an article has no headings", () => {
    expect(getNearestProgressIndex([], 0.5)).toBe(-1);
  });
});

describe("getPreviewPanelOffset", () => {
  test("centers the panel on progress while keeping it inside the track", () => {
    expect(getPreviewPanelOffset(0, 800, 84)).toBe(0);
    expect(getPreviewPanelOffset(0.5, 800, 84)).toBe(358);
    expect(getPreviewPanelOffset(1, 800, 84)).toBe(716);
  });
});

describe("rail drag interaction", () => {
  test("ends touch gestures without converting them into absolute jumps", () => {
    expect(getRailGestureEndAction("touch", false, false)).toBe("none");
    expect(getRailGestureEndAction("touch", true, false)).toBe("flush-drag");
    expect(getRailGestureEndAction("touch", true, true)).toBe("none");
  });

  test("keeps stationary mouse releases available for click navigation", () => {
    expect(getRailGestureEndAction("mouse", false, false)).toBe("tap");
    expect(getRailGestureEndAction("mouse", true, false)).toBe("flush-drag");
  });

  test("maps movement relative to the progress where dragging started", () => {
    expect(getRailDragProgress(0.1, 300, 320, 448)).toBeCloseTo(
      0.1446428571,
    );
    expect(getRailDragProgress(0.98, 300, 340, 448)).toBe(1);
    expect(getRailDragProgress(0.02, 300, 260, 448)).toBe(0);
  });

  test("maps pointer offsets to a controlled readable scroll position", () => {
    expect(getRailDragScrollTop(1_000, 100, 5, 200, 6_927)).toBe(1_500);
  });

  test("derives drag distance from stable viewport coordinates", () => {
    expect(getRailViewportOffset(260, 360)).toBe(100);
  });

  test("only treats a stationary release as a tap", () => {
    expect(hasRailDragMoved(260, 265, 6)).toBe(false);
    expect(hasRailDragMoved(260, 266, 6)).toBe(true);
  });

  test("keeps mobile drag targets inside the readable scroll range", () => {
    expect(getRailDragScrollTop(300, -140, 5, 200, 6_927)).toBe(200);
    expect(getRailDragScrollTop(6_700, 100, 5, 200, 6_927)).toBe(6_927);
  });
});
