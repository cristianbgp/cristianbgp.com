import { describe, expect, test } from "bun:test";
import { articleBodyToMarkdown, buildArticleMarkdown } from "./article-markdown";

const options = { articleUrl: "https://cristianbgp.com/articles/example" };

describe("article Markdown export", () => {
  test("converts live links but preserves imports and JSX inside code examples", () => {
    const example = '```tsx\nimport FaviconLink from "./FaviconLink";\n<FaviconLink href="https://react.dev/">React</FaviconLink>\n```';
    const source = 'import FaviconLink from "./FaviconLink";\n\n- <FaviconLink href="https://react.dev/" external>React</FaviconLink>\n\n' + example;
    expect(articleBodyToMarkdown(source, options)).toBe('- [React](https://react.dev/)\n\n' + example);
  });

  test("exports nested file trees without evaluating expressions", () => {
    const source = '<FileTree data={[{type: "folder", name: "apps", children: [{type: "file", name: "index.ts"}]}]} />';
    expect(articleBodyToMarkdown(source, options)).toContain('```text\n└── apps/\n    └── index.ts\n```');
    expect(() => articleBodyToMarkdown('<FileTree data={getFiles()} />', options)).toThrow();
  });

  test("resolves imported images and videos to public URLs", () => {
    const source = 'import photo from "../../assets/photo.png";\nimport clip from "../../assets/clip.mp4?url";\n\n<Image src={photo} alt="Preview" />\n\n<video controls><source src={clip} /></video>';
    expect(articleBodyToMarkdown(source, {
      ...options,
      resolveAsset: (path) => `https://example.com/${path.split("/").pop()}`,
    })).toBe('![Preview](https://example.com/photo.png)\n\n[Video](https://example.com/clip.mp4)');
  });

  test("preserves ordinary Markdown and adds publication metadata", () => {
    const body = "## Heading\n\n`<Component />`\n\n> Quote\n\n- One\n- Two";
    expect(articleBodyToMarkdown(body, { ...options, mdx: false })).toBe(body);
    expect(buildArticleMarkdown({ title: "Post", description: "Description", date: new Date("2026-09-13T00:00:00Z"), lang: "es" }, body))
      .toStartWith("# Post\n\nDescription\n\nPublicado: 2026-09-13\nIdioma: es\n");
  });
});
