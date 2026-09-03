import { describe, expect, test } from "bun:test";

import {
  getStickyPageHeaderPadding,
  getStickyPageHeaderProgress,
} from "./page-header";

describe("getStickyPageHeaderProgress", () => {
  test("collapses a page heading across the opening scroll range", () => {
    expect(getStickyPageHeaderProgress(-20, false)).toBe(0);
    expect(getStickyPageHeaderProgress(60, false)).toBe(0.5);
    expect(getStickyPageHeaderProgress(120, false)).toBe(1);
    expect(getStickyPageHeaderProgress(300, false)).toBe(1);
  });

  test("uses the compact state when reduced motion is requested", () => {
    expect(getStickyPageHeaderProgress(0, true)).toBe(1);
  });
});

describe("getStickyPageHeaderPadding", () => {
  test("reduces the vertical padding with the heading progress", () => {
    expect(getStickyPageHeaderPadding(0)).toBe(20);
    expect(getStickyPageHeaderPadding(0.5)).toBe(10);
    expect(getStickyPageHeaderPadding(1)).toBe(0);
  });

  test("keeps the padding inside its visual range", () => {
    expect(getStickyPageHeaderPadding(-1)).toBe(20);
    expect(getStickyPageHeaderPadding(2)).toBe(0);
  });
});
