import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, CopyIcon } from "lucide-react";

import { copyTextToClipboard } from "@/lib/clipboard";

type ArticleCodeCopyButtonsProps = {
  lang: string;
};

type CodeBlockCopyButtonProps = {
  code: string;
  lang: string;
};

type CodeCopyStatus = "idle" | "copied" | "error";

const codeCopyLabels = {
  en: {
    idle: "Copy",
    copied: "Copied",
    error: "Could not copy",
    action: "Copy code",
  },
  es: {
    idle: "Copiar",
    copied: "Copiado",
    error: "No se pudo copiar",
    action: "Copiar código",
  },
} satisfies Record<
  "en" | "es",
  Record<CodeCopyStatus | "action", string>
>;

function getCodeCopyLanguage(lang: string) {
  return lang.toLowerCase().startsWith("es") ? "es" : "en";
}

export function getCodeCopyLabel(lang: string, status: CodeCopyStatus) {
  return codeCopyLabels[getCodeCopyLanguage(lang)][status];
}

export function CodeBlockCopyButton({
  code,
  lang,
}: CodeBlockCopyButtonProps) {
  const [status, setStatus] = useState<CodeCopyStatus>("idle");
  const resetTimeout = useRef<number | undefined>(undefined);
  const language = getCodeCopyLanguage(lang);
  const label = codeCopyLabels[language][status];

  useEffect(
    () => () => {
      window.clearTimeout(resetTimeout.current);
    },
    [],
  );

  const handleCopy = async () => {
    window.clearTimeout(resetTimeout.current);
    const result = await copyTextToClipboard(navigator.clipboard, code);
    setStatus(result);
    resetTimeout.current = window.setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <button
      type="button"
      aria-label={codeCopyLabels[language].action}
      className="article-code-copy"
      data-status={status}
      onClick={handleCopy}
    >
      {status === "copied" ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </button>
  );
}

export function ArticleCodeCopyButtons({ lang }: ArticleCodeCopyButtonsProps) {
  const [blocks, setBlocks] = useState<
    Array<{ code: string; element: HTMLPreElement }>
  >([]);

  useEffect(() => {
    const articleBody = document.querySelector("[data-article-body]");
    if (!articleBody) return;

    setBlocks(
      Array.from(articleBody.querySelectorAll("pre")).map((element) => ({
        code: element.querySelector("code")?.textContent ?? "",
        element,
      })),
    );
  }, []);

  return blocks.map(({ code, element }, index) =>
    createPortal(
      <CodeBlockCopyButton code={code} lang={lang} />,
      element,
      `${index}-${code.slice(0, 24)}`,
    ),
  );
}
