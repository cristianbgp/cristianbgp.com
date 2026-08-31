import { describe, expect, test } from "bun:test";

import {
  getDestinationLabel,
  isExternalUrl,
  normalizePathname,
} from "./navigation";

describe("isExternalUrl", () => {
  test("recognizes HTTP and HTTPS destinations as external", () => {
    expect(isExternalUrl("https://runacard.com")).toBe(true);
    expect(isExternalUrl("http://localhost:3000/tool")).toBe(true);
  });

  test("keeps site-relative destinations internal", () => {
    expect(isExternalUrl("/tools/pixel-art-poster")).toBe(false);
    expect(isExternalUrl("articles/codeable")).toBe(false);
  });
});

describe("normalizePathname", () => {
  test("removes trailing slashes without changing the root path", () => {
    expect(normalizePathname("/articles/")).toBe("/articles");
    expect(normalizePathname("/tools///")).toBe("/tools");
    expect(normalizePathname("/")).toBe("/");
  });
});

describe("getDestinationLabel", () => {
  test("shows local paths and external hostnames as concrete destinations", () => {
    expect(getDestinationLabel("/tools/json-tree-viewer/")).toBe(
      "/tools/json-tree-viewer",
    );
    expect(getDestinationLabel("https://www.runacard.com/pricing")).toBe(
      "runacard.com",
    );
  });
});
