import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { posix } from "node:path";
import { getVisibleArticles } from "@/lib/articles";
import { articleBodyToMarkdown, buildArticleMarkdown } from "@/lib/article-markdown";

const assets = import.meta.glob<string>("/src/assets/**/*.{png,jpg,jpeg,webp,gif,svg,mp4}", {
  eager: true,
  query: "?url",
  import: "default",
});

export const prerender = true;

export const getStaticPaths = (async () => {
  const articles = getVisibleArticles(await getCollection("articles"), {
    includeDrafts: import.meta.env.DEV,
  });
  return articles.map((article) => ({ params: { slug: article.id }, props: { article } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site, url }) => {
  const { article } = props;
  const articleUrl = new URL(`/articles/${article.id}`, site ?? url).href;
  const body = articleBodyToMarkdown(article.body ?? "", {
    mdx: article.filePath?.endsWith(".mdx"),
    articleUrl,
    resolveAsset(path) {
      const key = posix.resolve("/", posix.dirname(article.filePath), path);
      const asset = assets[key];
      if (!asset) throw new Error(`Missing Markdown article asset: ${key}`);
      return new URL(asset, site ?? url).href;
    },
  });
  return new Response(buildArticleMarkdown(article.data, body), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
