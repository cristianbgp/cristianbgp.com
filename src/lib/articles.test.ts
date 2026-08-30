import { describe, expect, test } from "bun:test";

import {
  countActiveArticleFilters,
  getArticleFilterOptions,
  getArticlesHeaderProgress,
  getPublishedArticles,
  groupArticles,
  matchesArticleFilters,
} from "./articles";

describe("getArticlesHeaderProgress", () => {
  test("collapses the heading across the opening scroll range", () => {
    expect(getArticlesHeaderProgress(-20, false)).toBe(0);
    expect(getArticlesHeaderProgress(60, false)).toBe(0.5);
    expect(getArticlesHeaderProgress(120, false)).toBe(1);
    expect(getArticlesHeaderProgress(300, false)).toBe(1);
  });

  test("uses the compact state when reduced motion is requested", () => {
    expect(getArticlesHeaderProgress(0, true)).toBe(1);
  });
});

describe("countActiveArticleFilters", () => {
  test("counts every selected filter value", () => {
    expect(
      countActiveArticleFilters({ languages: [], statuses: [], tags: [] }),
    ).toBe(0);
    expect(
      countActiveArticleFilters({
        languages: ["en"],
        statuses: [],
        tags: [],
      }),
    ).toBe(1);
    expect(
      countActiveArticleFilters({
        languages: ["en", "es"],
        statuses: ["archived"],
        tags: ["astro", "typescript"],
      }),
    ).toBe(5);
  });
});

describe("getPublishedArticles", () => {
  test("removes drafts while preserving published and archived articles", () => {
    const articles = [
      { id: "published", data: { published: true } },
      { id: "draft", data: { published: false } },
      { id: "archived", data: { published: true, archived: true } },
    ];

    expect(getPublishedArticles(articles).map((article) => article.id)).toEqual([
      "published",
      "archived",
    ]);
  });
});

describe("groupArticles", () => {
  test("separates current and archived articles without changing their order", () => {
    const articles = [
      { id: "current-one", data: { archived: false } },
      { id: "archived", data: { archived: true } },
      { id: "current-two", data: {} },
    ];

    const groups = groupArticles(articles);

    expect(groups.current.map((article) => article.id)).toEqual([
      "current-one",
      "current-two",
    ]);
    expect(groups.archived.map((article) => article.id)).toEqual(["archived"]);
  });
});

describe("getArticleFilterOptions", () => {
  test("returns unique sorted languages and tags", () => {
    const articles = [
      { data: { lang: "es", tags: ["typescript", "astro"] } },
      { data: { lang: "en", tags: ["react", "astro"] } },
      { data: { lang: "es", tags: ["react"] } },
    ];

    expect(getArticleFilterOptions(articles)).toEqual({
      languages: ["en", "es"],
      tags: ["astro", "react", "typescript"],
    });
  });
});

describe("matchesArticleFilters", () => {
  const article = {
    archived: false,
    lang: "es",
    tags: ["astro", "typescript"],
  };

  test("matches when every active filter matches", () => {
    expect(
      matchesArticleFilters(article, {
        languages: ["es"],
        statuses: ["current"],
        tags: ["astro"],
      }),
    ).toBe(true);
    expect(
      matchesArticleFilters(article, {
        languages: [],
        statuses: [],
        tags: [],
      }),
    ).toBe(true);
  });

  test("rejects an article when either active filter does not match", () => {
    expect(
      matchesArticleFilters(article, {
        languages: ["en"],
        statuses: [],
        tags: ["astro"],
      }),
    ).toBe(false);
    expect(
      matchesArticleFilters(article, {
        languages: ["es"],
        statuses: [],
        tags: ["react"],
      }),
    ).toBe(false);
  });

  test("matches any selected language", () => {
    expect(
      matchesArticleFilters(article, {
        languages: ["en", "es"],
        statuses: [],
        tags: [],
      }),
    ).toBe(true);
    expect(
      matchesArticleFilters(article, {
        languages: ["en", "fr"],
        statuses: [],
        tags: [],
      }),
    ).toBe(false);
  });

  test("matches any selected tag", () => {
    expect(
      matchesArticleFilters(article, {
        languages: ["es"],
        statuses: [],
        tags: ["react", "typescript"],
      }),
    ).toBe(true);
    expect(
      matchesArticleFilters(article, {
        languages: ["es"],
        statuses: [],
        tags: ["react", "next.js"],
      }),
    ).toBe(false);
  });

  test("matches selected article statuses", () => {
    expect(
      matchesArticleFilters(article, {
        languages: [],
        statuses: ["current"],
        tags: [],
      }),
    ).toBe(true);
    expect(
      matchesArticleFilters(article, {
        languages: [],
        statuses: ["archived"],
        tags: [],
      }),
    ).toBe(false);
    expect(
      matchesArticleFilters(
        { ...article, archived: true },
        { languages: [], statuses: ["archived"], tags: [] },
      ),
    ).toBe(true);
  });
});
