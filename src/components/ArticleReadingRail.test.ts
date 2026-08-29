import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ArticleReadingRail } from "./ArticleReadingRail";

describe("ArticleReadingRail placement", () => {
  test("defaults both mobile and desktop rails to the left", () => {
    const markup = renderToStaticMarkup(createElement(ArticleReadingRail));

    expect(markup).toContain('data-side="left"');
    expect(markup).toContain('data-desktop-side="left"');
  });

  test("exposes independent mobile and desktop sides to the layout", () => {
    const markup = renderToStaticMarkup(
      createElement(ArticleReadingRail, {
        side: "right",
        desktopSide: "left",
      }),
    );

    expect(markup).toContain('data-side="right"');
    expect(markup).toContain('data-desktop-side="left"');
  });

  test("keeps both tracks out of the sequential tab order", () => {
    const markup = renderToStaticMarkup(createElement(ArticleReadingRail));

    expect(markup).not.toContain('tabindex="0"');
    expect(markup.match(/tabindex="-1"/g)).toHaveLength(2);
  });
});
