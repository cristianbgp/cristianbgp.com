import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleShareButton } from "./ArticleShareButton";

const article = {
  title: "An article",
  description: "Article description",
  url: "https://example.com/articles/an-article",
};

test("renders the English share action", () => {
  const markup = renderToStaticMarkup(
    createElement(ArticleShareButton, { ...article, lang: "en" }),
  );

  expect(markup).toContain("<button");
  expect(markup).toContain("Share");
});

test("renders the Spanish share action", () => {
  const markup = renderToStaticMarkup(
    createElement(ArticleShareButton, { ...article, lang: "es" }),
  );

  expect(markup).toContain("Compartir");
});
