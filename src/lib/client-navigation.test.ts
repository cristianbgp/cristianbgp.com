import { describe, expect, test } from "bun:test";

const projectRoot = new URL("../..", import.meta.url);

async function readProjectFile(path: string) {
  return Bun.file(new URL(path, projectRoot)).text();
}

describe("client navigation", () => {
  test("enables Astro client routing in the shared layout", async () => {
    const layout = await readProjectFile("src/layouts/Layout.astro");

    expect(layout).toContain('from "astro:transitions"');
    expect(layout).toContain("<ClientRouter />");
  });

  test("uses Astro navigation for command palette routes", async () => {
    const appCommand = await readProjectFile("src/components/AppCommand.tsx");

    expect(appCommand).toContain('import("astro:transitions/client")');
    expect(appCommand).not.toContain("window.location.href");
  });
});
