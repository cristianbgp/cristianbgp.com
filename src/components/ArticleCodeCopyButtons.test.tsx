import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CodeBlockCopyButton,
  getCodeCopyLabel,
} from "./ArticleCodeCopyButtons";

test("localizes code copy states for English and Spanish articles", () => {
  expect(getCodeCopyLabel("en", "idle")).toBe("Copy");
  expect(getCodeCopyLabel("es", "copied")).toBe("Copiado");
  expect(getCodeCopyLabel("es-PE", "error")).toBe("No se pudo copiar");
});

test("renders an accessible copy action", () => {
  const markup = renderToStaticMarkup(
    createElement(CodeBlockCopyButton, {
      code: "const answer = 42;",
      lang: "en",
    }),
  );

  expect(markup).toContain('type="button"');
  expect(markup).toContain('aria-label="Copy code"');
  expect(markup).toContain(
    '<span class="sr-only" aria-live="polite">Copy</span>',
  );
});
