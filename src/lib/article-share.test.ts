import { expect, test } from "bun:test";
import { shareArticle } from "./article-share";

test("uses the native share sheet when it is available", async () => {
  let sharedPayload: unknown;

  const result = await shareArticle(
    {
      title: "An article",
      text: "Article description",
      url: "https://example.com/articles/an-article",
    },
    {
      share: async (payload) => {
        sharedPayload = payload;
      },
    },
  );

  expect(result).toBe("shared");
  expect(sharedPayload).toEqual({
    title: "An article",
    text: "Article description",
    url: "https://example.com/articles/an-article",
  });
});

test("copies the article URL when native sharing is unavailable", async () => {
  let copiedText = "";

  const result = await shareArticle(
    {
      title: "An article",
      text: "Article description",
      url: "https://example.com/articles/an-article",
    },
    {
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        },
      },
    },
  );

  expect(result).toBe("copied");
  expect(copiedText).toBe("https://example.com/articles/an-article");
});

test("treats closing the native share sheet as a cancellation", async () => {
  const abortError = new Error("Share cancelled");
  abortError.name = "AbortError";

  const result = await shareArticle(
    {
      title: "An article",
      text: "Article description",
      url: "https://example.com/articles/an-article",
    },
    {
      share: async () => {
        throw abortError;
      },
    },
  );

  expect(result).toBe("cancelled");
});

test("reports a native sharing failure", async () => {
  const result = await shareArticle(
    {
      title: "An article",
      text: "Article description",
      url: "https://example.com/articles/an-article",
    },
    {
      share: async () => {
        throw new Error("Share failed");
      },
    },
  );

  expect(result).toBe("error");
});
