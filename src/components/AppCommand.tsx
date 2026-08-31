import {
  BookOpenIcon,
  BookTextIcon,
  BoxIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  CircleDotIcon,
  Code2Icon,
  Home,
  Moon,
  NotebookTextIcon,
  SearchIcon,
  SparklesIcon,
  SquareDashedMousePointerIcon,
  Sun,
  User,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useEffect, useMemo, useState } from "react";
import { cn, isApple, isMobile } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import {
  $isCommandOpen,
  setCommandOpen,
  toggleCommandOpen,
} from "@/stores/app-store";
import { useStore } from "@nanostores/react";
import { Button } from "@/components/ui/button";
import { getCommandPaletteData } from "@/lib/command-palette";
import { isExternalUrl } from "@/lib/navigation";

type CommandArticle = {
  id: string;
  title: string;
  archived: boolean;
  description: string;
  lang: string;
  tags: string[];
};

type CommandTool = {
  id: string;
  title: string;
  url: string;
  description: string;
};

const toolIcons: Record<string, typeof BoxIcon> = {
  space: CircleDotIcon,
  notes: NotebookTextIcon,
  dollarpe: CircleDollarSignIcon,
  holidays: CalendarDaysIcon,
  "json-tree-viewer": Code2Icon,
  "pixel-art-poster": SquareDashedMousePointerIcon,
  microinteractions: SparklesIcon,
};

const pageIcons: Record<string, typeof BoxIcon> = {
  home: Home,
  articles: BookOpenIcon,
  tools: BoxIcon,
  resume: User,
};

function CommandItemLabel({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{title}</span>
      <span className="truncate text-xs text-muted-foreground">
        {description}
      </span>
    </span>
  );
}

function getCommandKey() {
  return isApple() ? "⌘" : "^";
}

export function CommandKeyTrigger() {
  const [showCommandPrompt, setShowCommandPrompt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommandPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Button
      variant="ghost"
      className={cn(
        "text-muted-foreground text-sm hover:text-foreground group select-none pointer-events-auto transition-[color,opacity] duration-1000",
        showCommandPrompt ? "opacity-100" : "opacity-0",
        showCommandPrompt ? "cursor-pointer" : "cursor-default"
      )}
      data-state={showCommandPrompt ? "show" : "hidden"}
      onClick={() => showCommandPrompt && setCommandOpen(true)}
      aria-hidden={!showCommandPrompt}
      tabIndex={showCommandPrompt ? 0 : -1}
    >
      Press{" "}
      <kbd className="bg-muted text-muted-foreground group-hover:text-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none transition-colors duration-1000">
        <span className="text-xs">{getCommandKey()}</span>K
      </kbd>
    </Button>
  );
}

export function CommandPaletteSearchButton() {
  return (
    <Button
      className="group h-10 gap-2 px-4"
      onClick={() => setCommandOpen(true)}
    >
      <SearchIcon aria-hidden="true" className="size-4" strokeWidth={1.75} />
      <span>Search the site</span>
      <kbd className="ml-1 hidden rounded border border-primary-foreground/25 px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground/75 sm:inline-flex">
        {getCommandKey()}K
      </kbd>
    </Button>
  );
}

export function AppCommand({
  articles,
  tools,
  currentPath,
}: {
  articles: CommandArticle[];
  tools: CommandTool[];
  currentPath: string;
}) {
  const isCommandOpen = useStore($isCommandOpen);
  const [search, setSearch] = useState("");
  const { theme, setTheme } = useTheme();
  const commandData = useMemo(
    () => getCommandPaletteData({ articles, currentPath, tools }),
    [articles, currentPath, tools],
  );
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "theme-light" : "dark");
  };

  const onSelect = (cb: () => void) => {
    setCommandOpen(false);
    cb();
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandOpen();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [theme]);

  return (
    <CommandDialog
      open={isCommandOpen}
      onOpenChange={setCommandOpen}
      loop
      onOpenAutoFocus={isMobile() ? (e) => e.preventDefault() : undefined}
    >
      <CommandInput
        placeholder="Type a command or search…"
        autoFocus={false}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-80">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {commandData.pages.map((page) => {
            const PageIcon = pageIcons[page.id] ?? BoxIcon;
            return (
              <CommandItem
                key={page.id}
                keywords={[...page.keywords]}
                onSelect={() => onSelect(() => navigate(page.path))}
              >
                <PageIcon />
                <CommandItemLabel
                  description={page.description}
                  title={page.title}
                />
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tools">
          {commandData.tools.map((tool) => {
            const ToolIcon = toolIcons[tool.id] ?? BoxIcon;
            return (
              <CommandItem
                key={tool.id}
                keywords={tool.keywords}
                onSelect={() =>
                  onSelect(() => {
                    if (isExternalUrl(tool.url)) {
                      window.open(tool.url, "_blank", "noopener,noreferrer");
                    } else {
                      navigate(tool.url);
                    }
                  })
                }
              >
                <ToolIcon />
                <CommandItemLabel
                  description={tool.description}
                  title={tool.title}
                />
              </CommandItem>
            );
          })}
        </CommandGroup>
        {search.trim().length > 0 && commandData.articles.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Articles">
            {commandData.articles.map((article) => (
              <CommandItem
                key={article.id}
                keywords={article.keywords}
                onSelect={() =>
                  onSelect(() => navigate(article.path))
                }
              >
                <BookTextIcon />
                <span className="flex min-w-0 flex-col">
                  <span
                    className={cn(
                      "truncate",
                      article.archived && "line-through",
                    )}
                  >
                    {article.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {article.description}
                  </span>
                </span>
              </CommandItem>
            ))}
            </CommandGroup>
          </>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading="Appearance">
          <CommandItem
            keywords={["appearance", "dark", "light", "theme"]}
            onSelect={() => onSelect(toggleTheme)}
          >
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
            <CommandItemLabel
              description="Switch between light and dark"
              title="Toggle theme"
            />
            <CommandShortcut>{getCommandKey()}I</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
