import { useState } from "react";
import { CheckIcon, Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareArticle } from "@/lib/article-share";

type ArticleShareButtonProps = {
  title: string;
  description: string;
  url: string;
  lang: string;
};

type ShareStatus = "idle" | "sharing" | "shared" | "copied" | "error";

const labels = {
  en: {
    idle: "Share",
    sharing: "Share",
    shared: "Shared",
    copied: "Link copied",
    error: "Could not share",
  },
  es: {
    idle: "Compartir",
    sharing: "Compartir",
    shared: "Compartido",
    copied: "Enlace copiado",
    error: "No se pudo compartir",
  },
} satisfies Record<"en" | "es", Record<ShareStatus, string>>;

export function ArticleShareButton({
  title,
  description,
  url,
  lang,
}: ArticleShareButtonProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const language = lang.toLowerCase().startsWith("es") ? "es" : "en";
  const label = labels[language][status];
  const showConfirmation = status === "shared" || status === "copied";

  const handleShare = async () => {
    setStatus("sharing");

    const result = await shareArticle(
      { title, text: description, url },
      {
        share: navigator.share?.bind(navigator),
        clipboard: navigator.clipboard,
      },
    );

    if (result === "cancelled") {
      setStatus("idle");
      return;
    }

    setStatus(result);
    window.setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div className="not-prose mt-12 border-t border-border pt-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground hover:text-foreground active:scale-[0.98]"
        disabled={status === "sharing"}
        onClick={handleShare}
      >
        {showConfirmation ? (
          <CheckIcon aria-hidden="true" strokeWidth={1.75} />
        ) : (
          <Share2Icon aria-hidden="true" strokeWidth={1.75} />
        )}
        <span aria-live="polite">{label}</span>
      </Button>
    </div>
  );
}
