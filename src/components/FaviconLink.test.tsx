import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import FaviconLink from "./FaviconLink";

test("renders an external link with its hostname favicon", () => {
  const markup = renderToStaticMarkup(
    <FaviconLink href="https://www.typescriptlang.org/docs/">
      TypeScript
    </FaviconLink>,
  );

  expect(markup).toContain(
    'src="https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fwww.typescriptlang.org&amp;sz=32"',
  );
  expect(markup).toContain(">TypeScript</span>");
  expect(markup).not.toContain("<code");
});

test("uses the site favicon for internal links", () => {
  const markup = renderToStaticMarkup(
    <FaviconLink href="/articles/">Articles</FaviconLink>,
  );

  expect(markup).toContain('src="/favicon.png"');
  expect(markup).toContain('href="/articles/"');
});

test("omits the favicon when the link cannot have a web origin", () => {
  const markup = renderToStaticMarkup(
    <FaviconLink href="mailto:hello@cristianbgp.com">Email</FaviconLink>,
  );

  expect(markup).not.toContain("<img");
  expect(markup).toContain('href="mailto:hello@cristianbgp.com"');
});

test("opens in a new tab only when external is enabled", () => {
  const externalMarkup = renderToStaticMarkup(
    <FaviconLink href="https://react.dev/" external>
      React
    </FaviconLink>,
  );
  const defaultMarkup = renderToStaticMarkup(
    <FaviconLink href="https://react.dev/">React</FaviconLink>,
  );

  expect(externalMarkup).toContain('target="_blank"');
  expect(externalMarkup).toContain('rel="noopener noreferrer"');
  expect(defaultMarkup).not.toContain('target="_blank"');
  expect(defaultMarkup).not.toContain('rel="noopener noreferrer"');
});

test("hides the favicon without changing external link behavior", () => {
  const markup = renderToStaticMarkup(
    <FaviconLink href="https://react.dev/" external hideFavicon>
      React
    </FaviconLink>,
  );

  expect(markup).not.toContain("<img");
  expect(markup).toContain('href="https://react.dev/"');
  expect(markup).toContain('target="_blank"');
  expect(markup).toContain('rel="noopener noreferrer"');
});

test("uses an optional favicon resolver for external links", () => {
  const markup = renderToStaticMarkup(
    <FaviconLink
      href="https://react.dev/learn"
      faviconResolver={(url) =>
        `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`
      }
    >
      React
    </FaviconLink>,
  );

  expect(markup).toContain(
    'src="https://icons.duckduckgo.com/ip3/react.dev.ico"',
  );
});

test("allows a favicon resolver to omit the image", () => {
  const markup = renderToStaticMarkup(
    <FaviconLink href="https://react.dev/" faviconResolver={() => null}>
      React
    </FaviconLink>,
  );

  expect(markup).not.toContain("<img");
});

test("does not call the favicon resolver when the favicon is hidden", () => {
  let calls = 0;

  renderToStaticMarkup(
    <FaviconLink
      href="https://react.dev/"
      hideFavicon
      faviconResolver={() => {
        calls += 1;
        return "https://example.com/favicon.png";
      }}
    >
      React
    </FaviconLink>,
  );

  expect(calls).toBe(0);
});
