const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export type ContentAnnouncement = {
  type: "article" | "tool";
  title: string;
  href: string;
  date: string;
};

export function createContentAnnouncement({
  type,
  title,
  href,
  date,
}: Omit<ContentAnnouncement, "date"> & {
  date: Date;
}): ContentAnnouncement {
  return {
    type,
    title,
    href,
    date: date.toISOString(),
  };
}

export function getRecentContentAnnouncements(
  announcements: ContentAnnouncement[],
  now = new Date(),
) {
  const newestAllowedTime = now.valueOf();
  const oldestAllowedTime = newestAllowedTime - RECENT_WINDOW_MS;

  return announcements
    .filter(({ date }) => {
      const publishedTime = new Date(date).valueOf();
      return (
        Number.isFinite(publishedTime) &&
        publishedTime >= oldestAllowedTime &&
        publishedTime <= newestAllowedTime
      );
    })
    .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
}

export function getUnreadContentAnnouncements(
  announcements: ContentAnnouncement[],
  seenPaths: string[],
) {
  const seen = new Set(seenPaths);
  return announcements.filter(({ href }) => !seen.has(href));
}

export function parseSeenContentPaths(value: string | null) {
  if (!value) return [];

  try {
    const state = JSON.parse(value) as {
      version?: unknown;
      seenPaths?: unknown;
    };

    if (state.version !== 1 || !Array.isArray(state.seenPaths)) return [];
    return state.seenPaths.filter(
      (path): path is string => typeof path === "string",
    );
  } catch {
    return [];
  }
}

export function serializeSeenContentPaths(
  previousPaths: string[],
  openedPaths: string[],
) {
  return JSON.stringify({
    version: 1,
    seenPaths: [...new Set([...previousPaths, ...openedPaths])],
  });
}

export function readSeenContentPaths(
  storage: Pick<Storage, "getItem">,
  key: string,
) {
  try {
    return parseSeenContentPaths(storage.getItem(key));
  } catch {
    return [];
  }
}
