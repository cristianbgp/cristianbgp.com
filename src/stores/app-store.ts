import { atom } from "nanostores";

export const $isCommandOpen = atom(false);

export function setCommandOpen(value: boolean) {
  $isCommandOpen.set(value);
}

export function toggleCommandOpen() {
  $isCommandOpen.set(!$isCommandOpen.get());
}

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export function parseThemePreference(value: string | null): ThemePreference {
  return value === "dark" || value === "light" ? value : "system";
}

export function resolveTheme(
  preference: ThemePreference,
  systemIsDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemIsDark ? "dark" : "light";
  }

  return preference;
}

export function serializeThemePreference(
  preference: ThemePreference,
): ResolvedTheme | null {
  return preference === "system" ? null : preference;
}

export const $theme = atom<ThemePreference>("system");

export function setTheme(value: ThemePreference) {
  $theme.set(value);
}

export function toggleTheme() {
  $theme.set($theme.get() === "dark" ? "light" : "dark");
}
