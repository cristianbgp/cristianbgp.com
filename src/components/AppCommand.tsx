import {
  BookTextIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  Code2Icon,
  Home,
  Moon,
  NotebookTextIcon,
  Settings,
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
import { cn, isApple } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import {
  $isCommandOpen,
  setCommandOpen,
  toggleCommandOpen,
} from "@/stores/app-store";
import { useStore } from "@nanostores/react";
import { Button } from "@/components/ui/button";

function getCommandKey() {
  return isApple() ? "⌘" : "^";
}

export function CommandKeyTrigger() {
  const [showCommandPrompt, setShowCommandPrompt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommandPrompt(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Button
      variant="ghost"
      className={cn(
        "text-muted-foreground text-sm hover:text-foreground group select-none pointer-events-auto transition-all duration-1000",
        showCommandPrompt ? "opacity-100" : "opacity-0",
        showCommandPrompt ? "cursor-pointer" : "cursor-default"
      )}
      data-state={showCommandPrompt ? "show" : "hidden"}
      onClick={() => showCommandPrompt && setCommandOpen(true)}
      aria-hidden={!showCommandPrompt}
      tabIndex={showCommandPrompt ? 0 : -1}
    >
      Press{" "}
      <kbd className="bg-muted text-muted-foreground group-hover:text-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none transition-all duration-1000">
        <span className="text-xs">{getCommandKey()}</span>K
      </kbd>
    </Button>
  );
}

export function AppCommand() {
  const isCommandOpen = useStore($isCommandOpen);
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
    <CommandDialog open={isCommandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search..." />
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
          <CommandItem
            onSelect={() => {
              onSelect(() =>
                window.open("https://notes.cristianbgp.com", "_blank")
              );
            }}
          >
            <NotebookTextIcon />
            <span>Notes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onSelect(() =>
                window.open("https://dollarpe.cristianbgp.com", "_blank")
              );
            }}
          >
            <CircleDollarSignIcon />
            <span>Dollarpe</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              onSelect(() =>
                window.open("https://holiday.cristianbgp.com", "_blank")
              )
            }
          >
            <CalendarDaysIcon />
            <span>Holidays</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              onSelect(() => navigate("/components/json-tree-viewer"))
            }
          >
            <Code2Icon />
            <span>JSON Tree Viewer</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Personal">
          {location.pathname !== "/" && (
            <CommandItem onSelect={() => onSelect(() => navigate("/"))}>
              <Home />
              <span>Home</span>
            </CommandItem>
          )}
          {location.pathname !== "/articles" && (
            <CommandItem onSelect={() => onSelect(() => navigate("/articles"))}>
              <BookTextIcon />
              <span>Articles</span>
            </CommandItem>
          )}
          {location.pathname !== "/resume" && (
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
      </CommandList>
    </CommandDialog>
  );
}
