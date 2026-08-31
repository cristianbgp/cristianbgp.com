import { describe, expect, test } from "bun:test";

import { getInternalToolPageIssues } from "./internal-tool-pages";

describe("getInternalToolPageIssues", () => {
  test("accepts a page with the standard header and one matching title", () => {
    const html =
      '<main><div data-page-header><h1>JSON Tree Viewer</h1></div></main>';

    expect(getInternalToolPageIssues(html, "JSON Tree Viewer")).toEqual([]);
  });

  test("reports a page without the standard header", () => {
    const html = "<main><h1>JSON Tree Viewer</h1></main>";

    expect(getInternalToolPageIssues(html, "JSON Tree Viewer")).toContain(
      "missing the standard page header",
    );
  });

  test("reports duplicate primary headings", () => {
    const html =
      "<main data-page-header><h1>Pixel Art Poster</h1><h1>Duplicate</h1></main>";

    expect(getInternalToolPageIssues(html, "Pixel Art Poster")).toContain(
      "expected one h1 but found 2",
    );
  });
});
