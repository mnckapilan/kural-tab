import { storage } from "#imports";
import { THEME, type ThemeType } from "@/types/models";

// Typed storage items. The keys (`theme`, `favouriteKurals`) and the `sync`
// area match what the extension has always used, so existing users keep their data.
export const themeItem = storage.defineItem<ThemeType>("sync:theme", {
  fallback: THEME.DARK,
});

export const favouriteKuralsItem = storage.defineItem<number[]>(
  "sync:favouriteKurals",
  { fallback: [] },
);

/**
 * Synchronous, per-device copy of the theme in localStorage, read by
 * public/theme-init.js before first paint (chrome.storage is async, so it can't
 * be read in time). `themeItem` remains the source of truth; ThemeContext
 * mirrors every change here. Keep the key in sync with public/theme-init.js.
 */
export const THEME_HINT_KEY = "kural-tab:theme";

export const readThemeHint = (): ThemeType | null => {
  try {
    const value = localStorage.getItem(THEME_HINT_KEY);
    return value === THEME.LIGHT || value === THEME.DARK ? value : null;
  } catch {
    return null;
  }
};

export const writeThemeHint = (theme: ThemeType): void => {
  try {
    localStorage.setItem(THEME_HINT_KEY, theme);
  } catch {
    // Best effort: without it we just fall back to the dark first paint.
  }
};
