import type { ReactNode } from "react";

const SITE_ORIGIN = "https://cristianbgp.com";

function getFaviconUrl(href: string): string | null {
  let url: URL;

  try {
    url = new URL(href, SITE_ORIGIN);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  if (url.origin === SITE_ORIGIN) {
    return "/favicon.png";
  }

  const params = new URLSearchParams({
    domain_url: url.origin,
    sz: "32",
  });

  // Google S2 is undocumented. If it becomes unreliable, use:
  // https://icons.duckduckgo.com/ip3/${url.hostname}.ico
  return `https://www.google.com/s2/favicons?${params.toString()}`;
}

export default function FaviconLink({
  href,
  children,
  external = false,
  hideFavicon = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  hideFavicon?: boolean;
}) {
  const faviconUrl = getFaviconUrl(href);

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group inline-flex max-w-full items-center gap-[0.3em] whitespace-nowrap rounded-[0.3rem] align-baseline text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {!hideFavicon && faviconUrl ? (
        <img
          src={faviconUrl}
          alt=""
          aria-hidden="true"
          width="16"
          height="16"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="!m-0 size-[0.875em] shrink-0 rounded-[0.125rem]"
        />
      ) : null}
      <span className="rounded-[0.3rem] border border-foreground/25 bg-muted/80 px-[0.34em] py-[0.12em] font-mono text-[0.875em] font-medium text-foreground [font-variant-ligatures:none] transition-colors duration-150 group-hover:border-foreground/40 group-hover:bg-accent">
        {children}
      </span>
    </a>
  );
}
