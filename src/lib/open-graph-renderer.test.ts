import { describe, expect, test } from "bun:test";
import sharp from "sharp";

import { renderOpenGraphPng } from "./open-graph-renderer";

describe("renderOpenGraphPng", () => {
  test("renders a deterministic 1200 by 630 PNG", async () => {
    const png = await renderOpenGraphPng(
      {
        article: {
          date: new Date("2026-08-30T00:00:00Z"),
          language: "en",
          tags: ["astro", "design"],
        },
        description: "A deterministic social card",
        kind: "article",
        path: "/articles/example",
        section: "Article",
        title: "An article with a useful title",
      },
      "dark",
    );
    const metadata = await sharp(png).metadata();

    expect(metadata).toMatchObject({
      format: "png",
      height: 630,
      width: 1200,
    });
  });
});
