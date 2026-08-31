import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

import {
  buildOpenGraphCatalog,
  expandOpenGraphVariants,
  type OpenGraphCardDefinition,
  type OpenGraphCardTheme,
} from "@/lib/open-graph";
import { renderOpenGraphPng } from "@/lib/open-graph-renderer";

type OpenGraphRouteProps = {
  card: OpenGraphCardDefinition;
  theme: OpenGraphCardTheme;
};

export const prerender = true;

export const getStaticPaths = (async () => {
  const [articles, tools] = await Promise.all([
    getCollection("articles"),
    getCollection("tools"),
  ]);
  const cards = buildOpenGraphCatalog({
    articles: articles.map(({ data, id }) => ({
      archived: data.archived,
      date: data.date,
      description: data.description,
      id,
      lang: data.lang,
      published: data.published,
      tags: data.tags,
      title: data.title,
    })),
    tools: tools.map(({ data, id }) => ({
      description: data.description,
      id,
      title: data.title,
      url: data.url,
    })),
  });

  return expandOpenGraphVariants(cards).map(({ card, slug, theme }) => ({
    params: { slug, theme },
    props: { card, theme } satisfies OpenGraphRouteProps,
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { card, theme } = props as OpenGraphRouteProps;
  const png = await renderOpenGraphPng(card, theme);

  return new Response(new Uint8Array(png), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/png",
    },
  });
};
