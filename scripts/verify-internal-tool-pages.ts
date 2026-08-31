import { getInternalToolPageIssues } from "../src/lib/internal-tool-pages";

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

const failures: string[] = [];

for (const page of toolPages) {
  const html = await Bun.file(page.path).text();
  const issues = getInternalToolPageIssues(html, page.title);

  failures.push(...issues.map((issue) => `${page.path}: ${issue}`));
}

if (failures.length > 0) {
  throw new Error(`Internal tool page verification failed:\n${failures.join("\n")}`);
}

console.log(`Verified ${toolPages.length} internal tool pages.`);
