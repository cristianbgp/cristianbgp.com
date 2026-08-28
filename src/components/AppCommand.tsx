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
  Settings,
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
import { useEffect, useState } from "react";
import { cn, isApple, isMobile } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import {
  $isCommandOpen,
  setCommandOpen,
  toggleCommandOpen,
} from "@/stores/app-store";
import { useStore } from "@nanostores/react";
import { Button } from "@/components/ui/button";
import { isExternalUrl, normalizePathname } from "@/lib/navigation";

type CommandArticle = {
  id: string;
  title: string;
  archived: boolean;
};

type CommandTool = {
  id: string;
  title: string;
  url: string;
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
  const normalizedCurrentPath = normalizePathname(currentPath);
  const [search, setSearch] = useState("");
  const { theme, setTheme } = useTheme();
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
        <CommandGroup>
          <CommandItem onSelect={() => onSelect(toggleTheme)}>
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
            <span>Toggle theme</span>
            <CommandShortcut>{getCommandKey()}I</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tools">
          {tools.map((tool) => {
            const ToolIcon = toolIcons[tool.id] ?? BoxIcon;
            return (
              <CommandItem
                key={tool.id}
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
                <span>{tool.title}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Personal">
          {normalizedCurrentPath !== "/" && (
            <CommandItem onSelect={() => onSelect(() => navigate("/"))}>
              <Home />
              <span>Home</span>
            </CommandItem>
          )}
          {normalizedCurrentPath !== "/articles" && (
            <CommandItem onSelect={() => onSelect(() => navigate("/articles"))}>
              <BookOpenIcon />
              <span>Articles</span>
            </CommandItem>
          )}
          {normalizedCurrentPath !== "/tools" && (
            <CommandItem onSelect={() => onSelect(() => navigate("/tools"))}>
              <BoxIcon />
              <span>Tools</span>
            </CommandItem>
          )}
          {normalizedCurrentPath !== "/resume" && (
            <CommandItem onSelect={() => onSelect(() => navigate("/resume"))}>
              <User />
              <span>Resume</span>
            </CommandItem>
          )}
          <CommandItem disabled>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>{getCommandKey()}S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        {search.length > 0 && articles.length > 0 && (
          <CommandGroup>
            {articles.map((article) => (
              <CommandItem
                key={article.id}
                onSelect={() =>
                  onSelect(() => navigate(`/articles/${article.id}`))
                }
              >
                <BookTextIcon />
                <span className={cn(article.archived && "line-through")}>
                  {article.title}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
