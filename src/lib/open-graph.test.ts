import { describe, expect, test } from "bun:test";

import {
  buildOpenGraphCatalog,
  expandOpenGraphVariants,
  getOpenGraphImagePath,
  getOpenGraphTitleSize,
  getPublishedOpenGraphImagePath,
} from "./open-graph";

const articles = [
  {
    archived: false,
    date: new Date("2026-08-30T00:00:00Z"),
    description: "Published article",
    id: "published",
    lang: "en",
    published: true,
    tags: ["astro"],
    title: "Published",
  },
  {
    archived: true,
    date: new Date("2020-05-28T00:00:00Z"),
    description: "Archived article",
    id: "archived",
    lang: "es",
    published: true,
    tags: ["archive"],
    title: "Archived",
  },
  {
    archived: false,
    date: new Date("2026-08-30T00:00:00Z"),
    description: "Draft article",
    id: "draft",
    lang: "en",
    published: false,
    tags: [],
    title: "Draft",
  },
];

const tools = [
  {
    description: "Internal tool",
    id: "poster",
    title: "Poster",
    url: "/tools/poster",
  },
  {
    description: "External tool",
    id: "external",
    title: "External",
    url: "https://example.com",
  },
];

describe("buildOpenGraphCatalog", () => {
  test("includes indexable pages and excludes drafts and external-only tools", () => {
    const catalog = buildOpenGraphCatalog({ articles, tools });

    expect(catalog.map(({ path }) => path)).toEqual([
      "/",
      "/articles",
      "/tools",
      "/resume",
      "/articles/published",
      "/articles/archived",
      "/tools/poster",
    ]);
    expect(catalog.find(({ path }) => path === "/articles/archived")).toEqual(
      expect.objectContaining({
        article: expect.objectContaining({ language: "es" }),
        kind: "article",
      }),
    );
  });

  test("rejects duplicate output paths", () => {
    expect(() =>
      buildOpenGraphCatalog({
        articles: [],
        tools: [
          ...tools,
          {
            description: "Duplicate internal tool",
            id: "poster-duplicate",
            title: "Poster duplicate",
            url: "/tools/poster",
          },
        ],
      }),
    ).toThrow("Duplicate Open Graph card path: /tools/poster");
  });
});

describe("Open Graph variants", () => {
  test("creates light and dark variants with stable public paths", () => {
    const catalog = buildOpenGraphCatalog({ articles, tools });
    const variants = expandOpenGraphVariants(catalog);

    expect(variants).toHaveLength(catalog.length * 2);
    expect(variants.slice(0, 2)).toEqual([
      expect.objectContaining({
        publicPath: "/og/light/home.png",
        slug: "home",
        theme: "light",
      }),
      expect.objectContaining({
        publicPath: "/og/dark/home.png",
        slug: "home",
        theme: "dark",
      }),
    ]);
    expect(getOpenGraphImagePath("/", "dark")).toBe("/og/dark/home.png");
    expect(getOpenGraphImagePath("/articles/example", "light")).toBe(
      "/og/light/articles/example.png",
    );
  });

  test("uses deterministic title tiers", () => {
    expect(getOpenGraphTitleSize("Short title")).toBe(72);
    expect(getOpenGraphTitleSize("A".repeat(45))).toBe(64);
    expect(getOpenGraphTitleSize("A".repeat(70))).toBe(56);
  });

  test("selects light cards for home and detail pages while keeping indexes dark", () => {
    expect([
      getPublishedOpenGraphImagePath("/"),
      getPublishedOpenGraphImagePath("/articles"),
      getPublishedOpenGraphImagePath("/articles/example"),
      getPublishedOpenGraphImagePath("/tools"),
      getPublishedOpenGraphImagePath("/tools/example"),
      getPublishedOpenGraphImagePath("/resume"),
    ]).toEqual([
      "/og/light/home.png",
      "/og/dark/articles.png",
      "/og/light/articles/example.png",
      "/og/dark/tools.png",
      "/og/light/tools/example.png",
      "/og/dark/resume.png",
    ]);
  });
});
