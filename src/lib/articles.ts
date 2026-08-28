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
