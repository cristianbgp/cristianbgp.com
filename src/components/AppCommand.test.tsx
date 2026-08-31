import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CommandKeyTrigger } from "./AppCommand";

test("keeps the command key stable between server and initial client renders", () => {
  const originalNavigator = globalThis.navigator;

  try {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { userAgent: "Linux" },
    });
    const serverMarkup = renderToStaticMarkup(
      createElement(CommandKeyTrigger),
    );

    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { userAgent: "Macintosh" },
    });
    const initialClientMarkup = renderToStaticMarkup(
      createElement(CommandKeyTrigger),
    );

    expect(initialClientMarkup).toBe(serverMarkup);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});
