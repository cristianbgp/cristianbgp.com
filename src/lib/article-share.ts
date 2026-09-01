import { copyTextToClipboard } from "./clipboard";

export type ArticleSharePayload = {
  title: string;
  text: string;
  url: string;
};

type ArticleShareDependencies = {
  share?: (payload: ArticleSharePayload) => Promise<void>;
  clipboard?: Parameters<typeof copyTextToClipboard>[0];
};

export async function shareArticle(
  payload: ArticleSharePayload,
  { clipboard, share }: ArticleShareDependencies,
) {
  if (share) {
    try {
      await share(payload);
      return "shared" as const;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled" as const;
      }

      return "error" as const;
    }
  }

  return copyTextToClipboard(clipboard, payload.url);
}
