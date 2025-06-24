import { atom } from "nanostores";

export const $isCommandOpen = atom(false);

export function setCommandOpen(value: boolean) {
  $isCommandOpen.set(value);
}

export function toggleCommandOpen() {
  $isCommandOpen.set(!$isCommandOpen.get());
}

type Theme = "theme-light" | "dark" | "system";

export const $theme = atom<Theme>("theme-light");

export function setTheme(value: Theme) {
  $theme.set(value);
}

export function toggleTheme() {
  $theme.set($theme.get() === "dark" ? "theme-light" : "dark");
}