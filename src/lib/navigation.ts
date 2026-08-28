export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function normalizePathname(pathname: string): string {
  return pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
}
