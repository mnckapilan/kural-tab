import { storage } from "#imports";
import { THEME, type ThemeType } from "../types/models";

// Typed storage items. The keys (`theme`, `favouriteKurals`) and the `sync`
// area match what the extension has always used, so existing users keep their data.
export const themeItem = storage.defineItem<ThemeType>("sync:theme", {
  fallback: THEME.DARK,
});

export const favouriteKuralsItem = storage.defineItem<number[]>(
  "sync:favouriteKurals",
  { fallback: [] },
);
