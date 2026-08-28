"use client";

import { MouseEvent, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  MoreHorizontal,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyTextToClipboard } from "@/lib/clipboard";

type JsonViewerProps = {
  data: any;
  rootName?: string;
  defaultExpanded?: boolean;
  className?: string;
};

export function JsonViewer({
  data,
  rootName = "root",
  defaultExpanded = true,
  className,
}: JsonViewerProps) {
  return (
    <TooltipProvider>
      <div className={cn("font-mono text-sm", className)}>
        <JsonNode
          name={rootName}
          data={data}
          isRoot={true}
          defaultExpanded={defaultExpanded}
        />
      </div>
    </TooltipProvider>
  );
}

type JsonNodeProps = {
  name: string;
  data: any;
  isRoot?: boolean;
  defaultExpanded?: boolean;
  level?: number;
};

function JsonNode({
  name,
  data,
  isRoot = false,
  defaultExpanded = true,
  level = 0,
}: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = async (e: MouseEvent) => {
    e.stopPropagation();
    const status = await copyTextToClipboard(
      navigator.clipboard,
      JSON.stringify(data, null, 2),
    );
    setCopyStatus(status);
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const dataType =
    data === null ? "null" : Array.isArray(data) ? "array" : typeof data;
  const isExpandable =
    data !== null &&
    data !== undefined &&
    !(data instanceof Date) &&
    (dataType === "object" || dataType === "array");
  const itemCount =
    isExpandable && data !== null && data !== undefined
      ? Object.keys(data).length
      : 0;

  const nodeLabel = (
    <>
      {isExpandable ? (
        <span className="flex h-4 w-4 items-center justify-center">
          {isExpanded ? (
            <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>
      ) : (
        <span className="w-4" />
      )}

      <span className="font-semibold text-primary">{name}</span>

      <span className="text-muted-foreground">
        {isExpandable ? (
          <>
            {dataType === "array" ? "[" : "{"}
            {!isExpanded && (
              <span className="text-muted-foreground">
                {" "}
                {itemCount} {itemCount === 1 ? "item" : "items"}{" "}
                {dataType === "array" ? "]" : "}"}
              </span>
            )}
          </>
        ) : (
          ":"
        )}
      </span>

      {!isExpandable && <JsonValue data={data} name={name} />}
    </>
  );

  return (
    <div
      className={cn("pl-4 group/object", level > 0 && "border-l border-border")}
    >
      <div
        className={cn(
          "group/property -ml-4 flex items-start gap-1 rounded px-1 py-1 hover:bg-muted/50",
          isRoot && "text-primary font-bold italic"
        )}
      >
        {isExpandable ? (
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={isExpanded}
            onClick={handleToggle}
          >
            {nodeLabel}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-1">{nodeLabel}</div>
        )}

        <button
          type="button"
          onClick={copyToClipboard}
          className="ml-auto rounded p-1 opacity-0 hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/property:opacity-100"
          aria-label={
            copyStatus === "copied"
              ? `Copied ${name}`
              : copyStatus === "error"
                ? `Could not copy ${name}`
                : `Copy ${name} to clipboard`
          }
          title="Copy to clipboard"
        >
          {copyStatus === "copied" ? (
            <Check aria-hidden="true" className="h-3.5 w-3.5 text-foreground" />
          ) : (
            <Copy aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="sr-only" aria-live="polite">
            {copyStatus === "copied"
              ? `${name} copied to clipboard`
              : copyStatus === "error"
                ? `Could not copy ${name} to clipboard`
                : ""}
          </span>
        </button>
      </div>

      {isExpandable && isExpanded && data !== null && data !== undefined && (
        <div className="pl-4">
          {Object.keys(data).map((key) => (
            <JsonNode
              key={key}
              name={dataType === "array" ? `${key}` : key}
              data={data[key]}
              level={level + 1}
              defaultExpanded={level < 1}
            />
          ))}
          <div className="text-muted-foreground pl-0 py-1">
            {dataType === "array" ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
}

// Update the JsonValue function to make the entire row clickable with an expand icon
function JsonValue({ data, name }: { data: any; name: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dataType = typeof data;
  const TEXT_LIMIT = 80; // Character limit before truncation

  if (data === null) {
    return <span className="text-gray-500">null</span>;
  }

  if (data === undefined) {
    return <span className="text-muted-foreground">undefined</span>;
  }

  if (data instanceof Date) {
    return (
      <span className="text-gray-800 dark:text-gray-200">
        {data.toISOString()}
      </span>
    );
  }

  switch (dataType) {
    case "string":
      if (data.length > TEXT_LIMIT) {
        return (
          <button
            type="button"
            className="group relative flex flex-1 cursor-pointer items-start gap-1 rounded text-left text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-gray-200"
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} value for ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {`"`}
            {isExpanded ? (
              <span className="inline-block max-w-full">{data}</span>
            ) : (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className="inline-block max-w-full">
                    {data.substring(0, TEXT_LIMIT)}…
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-md text-xs p-2 break-words"
                >
                  {data}
                </TooltipContent>
              </Tooltip>
            )}
            {`"`}
            <div className="p-1 absolute right-0 translate-x-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-opacity">
              {isExpanded ? (
                <ChevronUp aria-hidden="true" className="h-3 w-3 text-muted-foreground" />
              ) : (
                <MoreHorizontal aria-hidden="true" className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </button>
        );
      }
      return (
        <span className="text-gray-800 dark:text-gray-200">{`"${data}"`}</span>
      );
    case "number":
      return <span className="text-gray-800 dark:text-gray-200">{data}</span>;
    case "boolean":
      return (
        <span className="text-gray-800 dark:text-gray-200">
          {data.toString()}
        </span>
      );
    default:
      return <span>{String(data)}</span>;
  }
}
