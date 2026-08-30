type PublishableArticle = {
  data: {
    published: boolean;
  };
};

export function getArticlesHeaderProgress(
  scrollTop: number,
  reduceMotion: boolean,
) {
  if (reduceMotion) return 1;
  return Math.min(Math.max(scrollTop / 120, 0), 1);
}

export function getPublishedArticles<T extends PublishableArticle>(
  articles: T[],
): T[] {
  return articles.filter((article) => article.data.published);
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

type ArticleFilters = {
  languages: string[];
  statuses: ("current" | "archived")[];
  tags: string[];
};

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
