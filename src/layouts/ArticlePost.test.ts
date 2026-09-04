import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const articlePostSource = readFileSync(
  new URL("./ArticlePost.astro", import.meta.url),
  "utf8",
);

test("enhances code blocks with a browser-only copy control", () => {
  expect(articlePostSource).toContain(
    '<ArticleCodeCopyButtons client:only="react" lang={lang} />',
  );
  expect(articlePostSource).not.toContain(
    '<ArticleCodeCopyButtons client:load lang={lang} />',
  );
});
