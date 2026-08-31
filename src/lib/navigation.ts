export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function normalizePathname(pathname: string): string {
  return pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
}

export function getDestinationLabel(url: string): string {
  if (!isExternalUrl(url)) return normalizePathname(url);

  return new URL(url).hostname.replace(/^www\./, "");
}
