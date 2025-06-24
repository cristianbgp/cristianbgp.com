import { $theme, setTheme } from "@/stores/app-store";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";

export function useTheme() {
  const theme = useStore($theme);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setTheme(isDarkMode ? "dark" : "theme-light");
  }, []);

  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
  }, [theme]);

  return { theme, setTheme };
}
