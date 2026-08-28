import { SITE_TITLE } from "@/consts";

export function getDocumentTitle(title?: string): string {
  return title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
}

type PageMetadata = {
  title?: string;
  description?: string;
  ogType?: "website" | "article";
};

export function resolvePageMetadata({
  title,
  description = "@cristianbgp",
  ogType = "website",
}: PageMetadata) {
  return {
    description,
    documentTitle: getDocumentTitle(title),
    ogType,
  };
}
