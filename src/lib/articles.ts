type PublishableArticle = {
  data: {
    published: boolean;
  };
};

export function getPublishedArticles<T extends PublishableArticle>(
  articles: T[],
): T[] {
  return articles.filter((article) => article.data.published);
}

export function getVisibleArticles<T extends PublishableArticle>(
  articles: T[],
  { includeDrafts }: { includeDrafts: boolean },
): T[] {
  return includeDrafts ? articles : getPublishedArticles(articles);
}

type ArchivableArticle = {
  data: {
    archived?: boolean;
  };
};

type FilterableArticle = {
  archived?: boolean;
  lang: string;
  tags: string[];
};

export type ArticleStatus = "current" | "archived";

export type ArticleFilters = {
  languages: string[];
  statuses: ArticleStatus[];
  tags: string[];
};

export const INITIAL_ARTICLE_FILTERS: ArticleFilters = {
  languages: [],
  statuses: ["current"],
  tags: [],
};

export const ARTICLE_FILTER_QUERY_KEYS = ["lang", "status", "tag"] as const;

export function hasArticleFilterSearch(search: string): boolean {
  const params = new URLSearchParams(search);
  return ARTICLE_FILTER_QUERY_KEYS.some((key) => params.has(key));
}

function uniqueKnownValues(values: string[], availableValues: string[]) {
  const available = new Set(availableValues);
  return [...new Set(values.filter((value) => available.has(value)))];
}

export function parseArticleFilterSearch(
  search: string,
  options: { languages: string[]; tags: string[] },
): ArticleFilters {
  const params = new URLSearchParams(search);
  const statusValues = params.getAll("status");
  const statuses = statusValues.includes("all")
    ? []
    : uniqueKnownValues(statusValues, ["current", "archived"]);

  return {
    languages: uniqueKnownValues(params.getAll("lang"), options.languages),
    statuses:
      statusValues.length === 0 || statuses.length === 0 && !statusValues.includes("all")
        ? [...INITIAL_ARTICLE_FILTERS.statuses]
        : (statuses as ArticleStatus[]),
    tags: uniqueKnownValues(params.getAll("tag"), options.tags),
  };
}

export function serializeArticleFilterSearch(
  filters: ArticleFilters,
  search = "",
): string {
  const params = new URLSearchParams(search);
  ARTICLE_FILTER_QUERY_KEYS.forEach((key) => params.delete(key));

  if (filters.statuses.length === 0) {
    params.append("status", "all");
  } else if (
    filters.statuses.length !== 1 ||
    filters.statuses[0] !== "current"
  ) {
    filters.statuses.forEach((status) => params.append("status", status));
  }

  filters.languages.forEach((language) => params.append("lang", language));
  filters.tags.forEach((tag) => params.append("tag", tag));

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function countActiveArticleFilters(filters: ArticleFilters) {
  return filters.languages.length + filters.statuses.length + filters.tags.length;
}

export function groupArticles<T extends ArchivableArticle>(articles: T[]) {
  return {
    current: articles.filter((article) => !article.data.archived),
    archived: articles.filter((article) => article.data.archived),
  };
}

export function getArticleFilterOptions<T extends { data: FilterableArticle }>(
  articles: T[],
) {
  return {
    languages: [...new Set(articles.map((article) => article.data.lang))].sort(
      (a, b) => a.localeCompare(b),
    ),
    tags: [...new Set(articles.flatMap((article) => article.data.tags))].sort(
      (a, b) => a.localeCompare(b),
    ),
  };
}

export function matchesArticleFilters(
  article: FilterableArticle,
  filters: ArticleFilters,
): boolean {
  const matchesLanguage =
    filters.languages.length === 0 || filters.languages.includes(article.lang);
  const articleStatus = article.archived ? "archived" : "current";
  const matchesStatus =
    filters.statuses.length === 0 || filters.statuses.includes(articleStatus);
  const matchesTags =
    filters.tags.length === 0 ||
    filters.tags.some((tag) => article.tags.includes(tag));

  return matchesLanguage && matchesStatus && matchesTags;
}
