import { isExternalUrl, normalizePathname } from "./navigation";

export type OpenGraphCardTheme = "light" | "dark";

export type OpenGraphCardDefinition = {
  article?: {
    date: Date;
    language: string;
    tags: string[];
  };
  description: string;
  kind: "page" | "article" | "tool";
  path: string;
  section: string;
  title: string;
  tool?: {
    label: "Interactive tool";
  };
};

export type OpenGraphCardVariant = {
  card: OpenGraphCardDefinition;
  publicPath: string;
  slug: string;
  theme: OpenGraphCardTheme;
};

type OpenGraphArticleInput = {
  archived?: boolean;
  date: Date;
  description: string;
  id: string;
  lang: string;
  published: boolean;
  tags: string[];
  title: string;
};

type OpenGraphToolInput = {
  description: string;
  id: string;
  title: string;
  url: string;
};

const CORE_PAGE_CARDS: OpenGraphCardDefinition[] = [
  {
    description: "Personal website of software engineer Cristian Granda.",
    kind: "page",
    path: "/",
    section: "Home",
    title: "Cristian Granda",
  },
  {
    description:
      "Articles about software development, product building, and game design.",
    kind: "page",
    path: "/articles",
    section: "Index",
    title: "Articles",
  },
  {
    description: "Web tools and experiments built by Cristian Granda.",
    kind: "page",
    path: "/tools",
    section: "Index",
    title: "Tools",
  },
  {
    description: "Software engineering experience, skills, and background.",
    kind: "page",
    path: "/resume",
    section: "Profile",
    title: "Resume",
  },
];

function normalizeCardPath(path: string) {
  const normalized = normalizePathname(path);
  return normalized === "/" ? normalized : `/${normalized.replace(/^\/+/, "")}`;
}

function assertUniquePaths(cards: OpenGraphCardDefinition[]) {
  const paths = new Set<string>();

  for (const card of cards) {
    if (paths.has(card.path)) {
      throw new Error(`Duplicate Open Graph card path: ${card.path}`);
    }
    paths.add(card.path);
  }
}

export function buildOpenGraphCatalog({
  articles,
  tools,
}: {
  articles: OpenGraphArticleInput[];
  tools: OpenGraphToolInput[];
}): OpenGraphCardDefinition[] {
  const articleCards: OpenGraphCardDefinition[] = articles
    .filter((article) => article.published)
    .map((article) => ({
      article: {
        date: article.date,
        language: article.lang,
        tags: article.tags,
      },
      description: article.description,
      kind: "article",
      path: `/articles/${article.id}`,
      section: "Article",
      title: article.title,
    }));

  const toolCards: OpenGraphCardDefinition[] = tools
    .filter((tool) => !isExternalUrl(tool.url))
    .map((tool) => ({
      description: tool.description,
      kind: "tool",
      path: normalizeCardPath(tool.url),
      section: "Tool",
      title: tool.title,
      tool: { label: "Interactive tool" },
    }));

  const cards = [...CORE_PAGE_CARDS, ...articleCards, ...toolCards];
  assertUniquePaths(cards);
  return cards;
}

function getOpenGraphSlug(path: string) {
  const normalized = normalizeCardPath(path);
  return normalized === "/" ? "home" : normalized.slice(1);
}

export function getOpenGraphImagePath(
  path: string,
  theme: OpenGraphCardTheme,
) {
  return `/og/${theme}/${getOpenGraphSlug(path)}.png`;
}

export function getPublishedOpenGraphImagePath(path: string) {
  const normalized = normalizeCardPath(path);
  const usesLightTheme =
    normalized === "/" ||
    normalized.startsWith("/articles/") ||
    normalized.startsWith("/tools/");

  return getOpenGraphImagePath(normalized, usesLightTheme ? "light" : "dark");
}

export function expandOpenGraphVariants(
  cards: OpenGraphCardDefinition[],
): OpenGraphCardVariant[] {
  return cards.flatMap((card) =>
    (["light", "dark"] as const).map((theme) => ({
      card,
      publicPath: getOpenGraphImagePath(card.path, theme),
      slug: getOpenGraphSlug(card.path),
      theme,
    })),
  );
}

export function getOpenGraphTitleSize(title: string) {
  if (title.length <= 32) return 72;
  if (title.length <= 55) return 64;
  return 56;
}
