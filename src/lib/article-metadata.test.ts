import { describe, expect, test } from "bun:test";

import {
  buildArticleStructuredData,
  estimateReadingMinutes,
  formatContentDate,
  toOpenGraphLocale,
} from "./article-metadata";

describe("estimateReadingMinutes", () => {
  test("returns at least one minute and rounds longer content up", () => {
    expect(estimateReadingMinutes("")).toBe(1);
    expect(estimateReadingMinutes("word ".repeat(201))).toBe(2);
  });
});

describe("buildArticleStructuredData", () => {
  test("builds complete Article metadata with a modified date", () => {
    expect(
      buildArticleStructuredData({
        title: "Building in public",
        description: "Notes from building a product in public.",
        url: "https://cristianbgp.com/articles/building-in-public/",
        imageUrl: "https://cristianbgp.com/og.jpg",
        language: "en",
        publishedAt: new Date("2026-01-02T00:00:00.000Z"),
        modifiedAt: new Date("2026-02-03T00:00:00.000Z"),
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Building in public",
      description: "Notes from building a product in public.",
      url: "https://cristianbgp.com/articles/building-in-public/",
      mainEntityOfPage: "https://cristianbgp.com/articles/building-in-public/",
      image: "https://cristianbgp.com/og.jpg",
      inLanguage: "en",
      datePublished: "2026-01-02T00:00:00.000Z",
      dateModified: "2026-02-03T00:00:00.000Z",
      author: {
        "@type": "Person",
        name: "Cristian Granda",
        url: "https://cristianbgp.com/",
      },
    });
  });
});

describe("formatContentDate", () => {
  test("preserves a UTC content date in negative-offset timezones", () => {
    expect(
      formatContentDate(new Date("2026-01-28T00:00:00.000Z"), "en-US"),
    ).toBe("Jan 28, 2026");
  });
});

describe("toOpenGraphLocale", () => {
  test("maps site languages to Open Graph locale identifiers", () => {
    expect(toOpenGraphLocale("en")).toBe("en_US");
    expect(toOpenGraphLocale("es")).toBe("es_PE");
    expect(toOpenGraphLocale("en-GB")).toBe("en_GB");
  });
});
