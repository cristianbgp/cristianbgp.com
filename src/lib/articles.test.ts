import { describe, expect, test } from "bun:test";

import {
  countActiveArticleFilters,
  getArticleFilterOptions,
  getPublishedArticles,
  getVisibleArticles,
  groupArticles,
  matchesArticleFilters,
} from "./articles";

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

describe("getVisibleArticles", () => {
  const articles = [
    { id: "published", data: { published: true } },
    { id: "draft", data: { published: false } },
  ];

  test("keeps drafts hidden outside development", () => {
    expect(
      getVisibleArticles(articles, { includeDrafts: false }).map(
        (article) => article.id,
      ),
    ).toEqual(["published"]);
  });

  test("includes drafts during local development", () => {
    expect(
      getVisibleArticles(articles, { includeDrafts: true }).map(
        (article) => article.id,
      ),
    ).toEqual(["published", "draft"]);
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

describe("article filter URLs", () => {
  const options = {
    languages: ["en", "es"],
    tags: ["astro", "react", "typescript"],
  };

  test("uses Current when the URL has no article filters", async () => {
    const articles = await import("./articles");
    const parseArticleFilterSearch = (
      articles as Record<string, unknown>
    ).parseArticleFilterSearch as
      | ((search: string, filterOptions: typeof options) => unknown)
      | undefined;

    expect(parseArticleFilterSearch?.("", options)).toEqual({
      languages: [],
      statuses: ["current"],
      tags: [],
    });
  });

  test("detects when the initial page needs URL filter hydration", async () => {
    const articles = await import("./articles");
    const hasArticleFilterSearch = (
      articles as Record<string, unknown>
    ).hasArticleFilterSearch as ((search: string) => boolean) | undefined;

    expect(hasArticleFilterSearch?.("?ref=home")).toBe(false);
    expect(hasArticleFilterSearch?.("?ref=home&status=archived")).toBe(true);
    expect(hasArticleFilterSearch?.("?lang=es&tag=react")).toBe(true);
  });

  test("restores repeated language, status, and tag selections", async () => {
    const articles = await import("./articles");
    const parseArticleFilterSearch = (
      articles as Record<string, unknown>
    ).parseArticleFilterSearch as
      | ((search: string, filterOptions: typeof options) => unknown)
      | undefined;

    expect(
      parseArticleFilterSearch?.(
        "?status=current&status=archived&lang=es&lang=en&tag=react&tag=astro",
        options,
      ),
    ).toEqual({
      languages: ["es", "en"],
      statuses: ["current", "archived"],
      tags: ["react", "astro"],
    });
  });

  test("keeps a cleared status explicit while preserving unrelated parameters", async () => {
    const articles = await import("./articles");
    const serializeArticleFilterSearch = (
      articles as Record<string, unknown>
    ).serializeArticleFilterSearch as
      | ((filters: {
          languages: string[];
          statuses: string[];
          tags: string[];
        }, search?: string) => string)
      | undefined;

    expect(
      serializeArticleFilterSearch?.(
        { languages: [], statuses: [], tags: [] },
        "?ref=home&status=current&tag=astro",
      ),
    ).toBe("?ref=home&status=all");
  });

  test("omits the default Current status from a shareable URL", async () => {
    const articles = await import("./articles");
    const serializeArticleFilterSearch = (
      articles as Record<string, unknown>
    ).serializeArticleFilterSearch as
      | ((filters: {
          languages: string[];
          statuses: string[];
          tags: string[];
        }) => string)
      | undefined;

    expect(
      serializeArticleFilterSearch?.({
        languages: ["es"],
        statuses: ["current"],
        tags: ["react"],
      }),
    ).toBe("?lang=es&tag=react");
  });
});
