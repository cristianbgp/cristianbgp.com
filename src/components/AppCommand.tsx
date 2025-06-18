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

export function AppCommand() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    console.log("toggleTheme", theme);
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandItem onSelect={toggleTheme}>
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
            <span>Toggle theme</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
          <CommandItem
            hidden={location.pathname === "/"}
            onSelect={() => navigate("/")}
          >
            <Home />
            <span>Home</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Personal">
          <CommandItem onSelect={() => navigate("/resume")}>
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
