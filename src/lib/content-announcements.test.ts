import { describe, expect, test } from "bun:test";
import {
  createContentAnnouncement,
  getRecentContentAnnouncements,
  getUnreadContentAnnouncements,
  parseSeenContentPaths,
  readSeenContentPaths,
  serializeSeenContentPaths,
  type ContentAnnouncement,
} from "./content-announcements";

const announcements = [
  {
    type: "article",
    title: "Recent article",
    href: "/articles/recent",
    date: "2026-08-28T00:00:00.000Z",
  },
  {
    type: "tool",
    title: "Today's tool",
    href: "/tools/today",
    date: "2026-09-01T00:00:00.000Z",
  },
  {
    type: "article",
    title: "Old article",
    href: "/articles/old",
    date: "2026-07-01T00:00:00.000Z",
  },
  {
    type: "tool",
    title: "Future tool",
    href: "/tools/future",
    date: "2026-09-02T00:00:00.000Z",
  },
] satisfies ContentAnnouncement[];

describe("getRecentContentAnnouncements", () => {
  test("returns only the last 30 days in newest-first order", () => {
    expect(
      getRecentContentAnnouncements(
        announcements,
        new Date("2026-09-01T12:00:00.000Z"),
      ).map((announcement) => announcement.href),
    ).toEqual(["/tools/today", "/articles/recent"]);
  });
});

describe("getUnreadContentAnnouncements", () => {
  test("removes only announcements whose paths were seen", () => {
    expect(
      getUnreadContentAnnouncements(announcements.slice(0, 2), [
        "/articles/recent",
      ]).map((announcement) => announcement.href),
    ).toEqual(["/tools/today"]);
  });
});

describe("parseSeenContentPaths", () => {
  test("restores paths from the current storage schema", () => {
    expect(
      parseSeenContentPaths(
        '{"version":1,"seenPaths":["/articles/recent","/tools/today"]}',
      ),
    ).toEqual(["/articles/recent", "/tools/today"]);
  });

  test("treats malformed and obsolete storage as unseen", () => {
    expect(parseSeenContentPaths("not-json")).toEqual([]);
    expect(
      parseSeenContentPaths(
        '{"version":0,"seenPaths":["/articles/recent"]}',
      ),
    ).toEqual([]);
    expect(
      parseSeenContentPaths(
        '{"version":1,"seenPaths":["/articles/recent",42]}',
      ),
    ).toEqual(["/articles/recent"]);
  });
});

describe("createContentAnnouncement", () => {
  test("serializes the date without deriving another identity", () => {
    const date = new Date("2026-09-01T00:00:00.000Z");

    expect(
      createContentAnnouncement({
        type: "article",
        title: "Article",
        href: "/articles/same-slug",
        date,
      }),
    ).toEqual({
      type: "article",
      title: "Article",
      href: "/articles/same-slug",
      date: "2026-09-01T00:00:00.000Z",
    });
  });
});

describe("serializeSeenContentPaths", () => {
  test("preserves prior paths while recording newly opened announcements", () => {
    expect(
      serializeSeenContentPaths(
        ["/articles/previous", "/tools/today"],
        ["/tools/today", "/articles/recent"],
      ),
    ).toBe(
      '{"version":1,"seenPaths":["/articles/previous","/tools/today","/articles/recent"]}',
    );
  });
});

describe("readSeenContentPaths", () => {
  test("falls back to unseen when browser storage is blocked", () => {
    expect(
      readSeenContentPaths(
        {
          getItem: () => {
            throw new Error("Storage blocked");
          },
        },
        "content-announcements:v1",
      ),
    ).toEqual([]);
  });
});
