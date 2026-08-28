import { describe, expect, test } from "bun:test";

import { copyTextToClipboard } from "./clipboard";

describe("copyTextToClipboard", () => {
  test("reports success only after the clipboard write resolves", async () => {
    let resolveWrite: (() => void) | undefined;
    const write = new Promise<void>((resolve) => {
      resolveWrite = resolve;
    });
    const result = copyTextToClipboard(
      { writeText: () => write },
      "example",
    );

    let settled = false;
    void result.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    resolveWrite?.();
    expect(await result).toBe("copied");
  });

  test("reports an error when clipboard access is unavailable or rejected", async () => {
    expect(await copyTextToClipboard(undefined, "example")).toBe("error");
    expect(
      await copyTextToClipboard(
        { writeText: () => Promise.reject(new Error("denied")) },
        "example",
      ),
    ).toBe("error");
  });
});
