import { expect, test } from "bun:test";

import {
  parseThemePreference,
  resolveTheme,
  serializeThemePreference,
} from "./app-store";

test("uses the system preference when storage has no valid override", () => {
  expect(parseThemePreference("dark")).toBe("dark");
  expect(parseThemePreference("light")).toBe("light");
  expect(parseThemePreference(null)).toBe("system");
  expect(parseThemePreference("unknown")).toBe("system");
});

test("resolves the system preference to the current system theme", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
  expect(resolveTheme("light", true)).toBe("light");
});

test("persists only explicit theme preferences", () => {
  expect(serializeThemePreference("dark")).toBe("dark");
  expect(serializeThemePreference("light")).toBe("light");
  expect(serializeThemePreference("system")).toBeNull();
});
