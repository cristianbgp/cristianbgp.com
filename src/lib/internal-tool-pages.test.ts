import { beforeAll, describe, expect, test } from "bun:test";

const toolPages = [
  {
    path: "dist/tools/json-tree-viewer/index.html",
    title: "JSON Tree Viewer",
  },
  {
    path: "dist/tools/pixel-art-poster/index.html",
    title: "Pixel Art Poster",
  },
];

beforeAll(async () => {
  const build = Bun.spawn(["bun", "run", "build"], {
    cwd: process.cwd(),
    stderr: "pipe",
    stdout: "ignore",
  });
  const exitCode = await build.exited;

  if (exitCode !== 0) {
    const stderr = await new Response(build.stderr).text();
    throw new Error(`Astro build failed:\n${stderr}`);
  }
}, 15_000);

describe("internal tool page headers", () => {
  test.each(toolPages)("renders $title with the standard page header", async ({
    path,
    title,
  }) => {
    const html = await Bun.file(path).text();

    expect(html).toContain("data-page-header");
    expect(html).toContain("<h1");
    expect(html).toContain(title);
    expect(html.match(/<h1/g)).toHaveLength(1);
  });
});
