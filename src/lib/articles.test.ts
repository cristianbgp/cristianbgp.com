import { describe, expect, test } from "bun:test";

import { getPublishedArticles } from "./articles";

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
