import { describe, expect, test } from "bun:test";

describe("getCommandPaletteData", () => {
  test("keeps primary pages ahead of tools and excludes the current page", async () => {
    const commandPalette = await import("./command-palette");
    const getCommandPaletteData = (
      commandPalette as Record<string, unknown>
    ).getCommandPaletteData as
      | ((input: {
          articles: {
            id: string;
            title: string;
            archived: boolean;
            description: string;
            lang: string;
            tags: string[];
          }[];
          currentPath: string;
          tools: {
            id: string;
            title: string;
            url: string;
            description: string;
          }[];
        }) => {
          pages: { title: string }[];
          tools: { title: string }[];
          articles: { title: string }[];
        })
      | undefined;

    const result = getCommandPaletteData?.({
      currentPath: "/articles/",
      articles: [],
      tools: [
        {
          id: "poster",
          title: "Poster",
          url: "/tools/poster",
          description: "Compose pixel art posters",
        },
      ],
    });

    expect(result).toEqual({
      pages: [
        expect.objectContaining({ title: "Home" }),
        expect.objectContaining({ title: "Tools" }),
        expect.objectContaining({ title: "Resume" }),
      ],
      tools: [expect.objectContaining({ title: "Poster" })],
      articles: [],
    });
  });

  test("adds searchable paths and keywords to articles", async () => {
    const commandPalette = await import("./command-palette");
    const getCommandPaletteData = (
      commandPalette as Record<string, unknown>
    ).getCommandPaletteData as
      | ((input: {
          articles: {
            id: string;
            title: string;
            archived: boolean;
            description: string;
            lang: string;
            tags: string[];
          }[];
          currentPath: string;
          tools: {
            id: string;
            title: string;
            url: string;
            description: string;
          }[];
        }) => {
          articles: {
            path: string;
            description: string;
            keywords: string[];
          }[];
        })
      | undefined;

    const result = getCommandPaletteData?.({
      currentPath: "/",
      articles: [
        {
          id: "small-tools",
          title: "Small tools",
          archived: false,
          description: "Building useful interfaces with Astro",
          lang: "en",
          tags: ["astro", "design systems"],
        },
      ],
      tools: [],
    });

    expect(result?.articles).toEqual([
      expect.objectContaining({
        path: "/articles/small-tools",
        description: "Building useful interfaces with Astro",
        keywords: expect.arrayContaining([
          "article",
          "small-tools",
          "astro",
          "design systems",
          "interfaces",
        ]),
      }),
    ]);
  });

  test("uses real tool descriptions as search metadata", async () => {
    const commandPalette = await import("./command-palette");
    const getCommandPaletteData = (
      commandPalette as Record<string, unknown>
    ).getCommandPaletteData as
      | ((input: {
          articles: never[];
          currentPath: string;
          tools: {
            id: string;
            title: string;
            url: string;
            description: string;
          }[];
        }) => {
          tools: { description: string; keywords: string[] }[];
        })
      | undefined;

    const result = getCommandPaletteData?.({
      currentPath: "/",
      articles: [],
      tools: [
        {
          id: "runa-card",
          title: "Runa Card",
          url: "https://runacard.com",
          description: "Digital loyalty cards for Apple Wallet",
        },
      ],
    });

    expect(result?.tools).toEqual([
      expect.objectContaining({
        description: "Digital loyalty cards for Apple Wallet",
        keywords: expect.arrayContaining(["loyalty", "wallet"]),
      }),
    ]);
  });
});
