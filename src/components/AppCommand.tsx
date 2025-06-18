import { Home, Moon, Settings, Sun, User } from "lucide-react";
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
import { useTheme } from "./theme-provider";
import { useNavigate } from "react-router";
import { useAppStore } from "@/stores/app-store";
import { cn, isApple } from "@/lib/utils";

export function CommandKeyTrigger() {
  const [showCommandPrompt, setShowCommandPrompt] = useState(false);
  const { setCommandOpen } = useAppStore();

  const getCommandKey = () => {
    const modifierKeyPrefix = isApple()
      ? "⌘" // command key
      : "^"; // control key

    return modifierKeyPrefix;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommandPrompt(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <p
      className={cn(
        "text-muted-foreground text-sm hover:text-foreground group select-none pointer-events-auto transition-all duration-1000",
        showCommandPrompt ? "opacity-100" : "opacity-0",
        showCommandPrompt ? "cursor-pointer" : "cursor-default"
      )}
      data-state={showCommandPrompt ? "show" : "hidden"}
      onClick={() => showCommandPrompt && setCommandOpen(true)}
    >
      Press{" "}
      <kbd className="bg-muted text-muted-foreground group-hover:text-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none transition-all duration-1000">
        <span className="text-xs">{getCommandKey()}</span>K
      </kbd>
    </p>
  );
}

export function AppCommand() {
  const { commandOpen, toggleCommandOpen, setCommandOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandItem onSelect={() => onSelect(toggleTheme)}>
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
            <span>Toggle theme</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
          <CommandItem
            hidden={location.pathname === "/"}
            onSelect={() => onSelect(() => navigate("/"))}
          >
            <Home />
            <span>Home</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Personal">
          <CommandItem onSelect={() => onSelect(() => navigate("/resume"))}>
            <User />
            <span>Resume</span>
          </CommandItem>
          <CommandItem disabled>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
