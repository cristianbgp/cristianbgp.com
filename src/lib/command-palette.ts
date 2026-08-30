import { isExternalUrl, normalizePathname } from "./navigation";

type CommandArticle = {
  id: string;
  title: string;
  archived: boolean;
  description: string;
  lang: string;
  tags: string[];
};

type CommandTool = {
  id: string;
  title: string;
  url: string;
  description: string;
};

function toSearchKeywords(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}.#-]+/u)
    .filter((keyword) => keyword.length > 2);
}

function uniqueKeywords(keywords: string[]) {
  return [...new Set(keywords)];
}

const pages = [
  {
    id: "home",
    title: "Home",
    description: "Return to the homepage",
    path: "/",
    keywords: ["home", "start"],
  },
  {
    id: "articles",
    title: "Articles",
    description: "Browse writing and notes",
    path: "/articles",
    keywords: ["articles", "blog", "posts", "writing"],
  },
  {
    id: "tools",
    title: "Tools",
    description: "Explore projects and experiments",
    path: "/tools",
    keywords: ["tools", "projects", "experiments"],
  },
  {
    id: "resume",
    title: "Resume",
    description: "View experience and skills",
    path: "/resume",
    keywords: ["resume", "experience", "work", "skills"],
  },
] as const;

export function getCommandPaletteData({
  articles,
  currentPath,
  tools,
}: {
  articles: CommandArticle[];
  currentPath: string;
  tools: CommandTool[];
}) {
  const normalizedCurrentPath = normalizePathname(currentPath);

  return {
    pages: pages.filter((page) => page.path !== normalizedCurrentPath),
    tools: tools.map((tool) => ({
      ...tool,
      description: tool.description,
      keywords: uniqueKeywords([
        "tool",
        "project",
        tool.id,
        isExternalUrl(tool.url) ? "external" : "interactive",
        ...toSearchKeywords(tool.title),
        ...toSearchKeywords(tool.description),
      ]),
    })),
    articles: articles.map((article) => ({
      ...article,
      keywords: uniqueKeywords([
        "article",
        "post",
        "writing",
        article.id,
        article.lang,
        ...article.tags,
        ...toSearchKeywords(article.title),
        ...toSearchKeywords(article.description),
      ]),
      path: `/articles/${article.id}`,
    })),
  };
}
