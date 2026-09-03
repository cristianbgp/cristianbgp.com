import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const articlePostSource = readFileSync(
  new URL("./ArticlePost.astro", import.meta.url),
  "utf8",
);

test("enhances every rendered article code block with copy controls", () => {
  expect(articlePostSource).toContain(
    '<ArticleCodeCopyButtons client:load lang={lang} />',
  );
});
