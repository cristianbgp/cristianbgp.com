import {
  $theme,
  parseThemePreference,
  resolveTheme,
  serializeThemePreference,
  setTheme as setThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/stores/app-store";
import { useStore } from "@nanostores/react";
import { useCallback, useEffect, useState } from "react";

const systemThemeQuery = "(prefers-color-scheme: dark)";

function applyTheme(theme: ResolvedTheme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark ? "#000000" : "#ffffff");
}

export function useTheme() {
  const preference = useStore($theme);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    setThemePreference(
      parseThemePreference(window.localStorage.getItem("theme")),
    );
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const systemTheme = window.matchMedia(systemThemeQuery);
    const syncResolvedTheme = () => {
      const resolvedTheme = resolveTheme(preference, systemTheme.matches);
      setResolvedTheme(resolvedTheme);
      applyTheme(resolvedTheme);
    };

    syncResolvedTheme();

    if (preference !== "system") return;

    systemTheme.addEventListener("change", syncResolvedTheme);
    return () => systemTheme.removeEventListener("change", syncResolvedTheme);
  }, [isInitialized, preference]);

  const setTheme = useCallback((nextPreference: ThemePreference) => {
    const storedPreference = serializeThemePreference(nextPreference);

    if (storedPreference) {
      window.localStorage.setItem("theme", storedPreference);
    } else {
      window.localStorage.removeItem("theme");
    }

    setThemePreference(nextPreference);
  }, []);

  return { preference, setTheme, theme };
}
