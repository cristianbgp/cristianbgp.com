import { describe, expect, test } from "bun:test";

import { getDocumentTitle, resolvePageMetadata } from "./seo";

describe("getDocumentTitle", () => {
  test("uses the site title when a page title is not provided", () => {
    expect(getDocumentTitle()).toBe("Cristian Granda");
  });

  test("combines a page title with the site title", () => {
    expect(getDocumentTitle("Articles")).toBe("Articles — Cristian Granda");
  });
});

describe("resolvePageMetadata", () => {
  test("does not duplicate the site title when page metadata is omitted", () => {
    expect(resolvePageMetadata({})).toEqual({
      description: "@cristianbgp",
      documentTitle: "Cristian Granda",
      ogType: "website",
    });
  });
});
