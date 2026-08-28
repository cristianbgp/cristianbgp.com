import { describe, expect, test } from "bun:test";

import {
  clientPointToCanvas,
  fitRectToCanvas,
  getArrowKeyDelta,
  getScaleOptions,
  moveRect,
  resizeRect,
} from "./poster-geometry";

describe("clientPointToCanvas", () => {
  test("maps a responsive display point into the 800 by 600 canvas", () => {
    expect(
      clientPointToCanvas(
        { x: 210, y: 170 },
        { left: 10, top: 20, width: 400, height: 300 },
      ),
    ).toEqual({ x: 400, y: 300 });
  });
});

describe("moveRect", () => {
  test("clamps movement to every canvas edge", () => {
    const rect = { x: 100, y: 100, width: 100, height: 100 };

    expect(moveRect(rect, { x: -50, y: -20 })).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    expect(moveRect(rect, { x: 900, y: 700 })).toEqual({
      x: 700,
      y: 500,
      width: 100,
      height: 100,
    });
  });
});

describe("fitRectToCanvas", () => {
  test("scales oversized images proportionally and keeps them in bounds", () => {
    expect(
      fitRectToCanvas({ x: 750, y: 550, width: 1600, height: 1200 }),
    ).toEqual({ x: 0, y: 0, width: 800, height: 600 });
  });
});

describe("resizeRect", () => {
  test("resizes proportionally from the south-east corner", () => {
    expect(
      resizeRect(
        { x: 100, y: 100, width: 200, height: 100 },
        "se",
        100,
        2,
      ),
    ).toEqual({ x: 100, y: 100, width: 300, height: 150 });
  });

  test("keeps the opposite corner anchored while clamping north-west resize", () => {
    expect(
      resizeRect(
        { x: 100, y: 100, width: 200, height: 100 },
        "nw",
        -1000,
        2,
      ),
    ).toEqual({ x: 0, y: 50, width: 300, height: 150 });
  });
});

describe("getArrowKeyDelta", () => {
  test("uses one-pixel nudges and ten-pixel nudges with Shift", () => {
    expect(getArrowKeyDelta("ArrowLeft", false)).toEqual({ x: -1, y: 0 });
    expect(getArrowKeyDelta("ArrowDown", true)).toEqual({ x: 0, y: 10 });
    expect(getArrowKeyDelta("Enter", false)).toBeNull();
  });
});

describe("getScaleOptions", () => {
  test("collapses capped duplicate presets into one Fit option", () => {
    expect(getScaleOptions(960, 480)).toEqual([
      { scale: 0.5, width: 480, height: 240, label: "0.5×" },
      { scale: 1, width: 800, height: 400, label: "Fit" },
    ]);
  });

  test("keeps every distinct preset for small images", () => {
    expect(getScaleOptions(100, 50)).toEqual([
      { scale: 0.5, width: 50, height: 25, label: "0.5×" },
      { scale: 1, width: 100, height: 50, label: "1×" },
      { scale: 2, width: 200, height: 100, label: "2×" },
      { scale: 4, width: 400, height: 200, label: "4×" },
    ]);
  });
});
