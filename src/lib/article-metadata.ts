type ArticleStructuredDataInput = {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  language: string;
  publishedAt: Date;
  modifiedAt?: Date;
};

const SITE_OPEN_GRAPH_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_PE",
};

export function toOpenGraphLocale(language: string): string {
  return SITE_OPEN_GRAPH_LOCALES[language] ?? language.replace("-", "_");
}

export function estimateReadingMinutes(
  body: string,
  wordsPerMinute = 200,
): number {
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function formatContentDate(date: Date, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function buildArticleStructuredData({
  title,
  description,
  url,
  imageUrl,
  language,
  publishedAt,
  modifiedAt,
}: ArticleStructuredDataInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    ...(imageUrl ? { image: imageUrl } : {}),
    inLanguage: language,
    datePublished: publishedAt.toISOString(),
    dateModified: (modifiedAt ?? publishedAt).toISOString(),
    author: {
      "@type": "Person",
      name: "Cristian Granda",
      url: "https://cristianbgp.com/",
    },
  };
}
