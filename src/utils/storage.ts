import { storage } from "#imports";
import type { Appearance, ContentPreferences, ThemeType } from "@/types/models";
import {
  DEFAULT_APPEARANCE,
  normaliseAppearance,
  normaliseTheme,
  paletteColours,
} from "@/utils/appearance";
import { DEFAULT_CONTENT } from "@/utils/content";
import { THEME } from "@/types/models";

// Typed storage items. The keys (`theme`, `favouriteKurals`) and the `sync`
// area match what the extension has always used, so existing users keep their data.
// `theme` now also accepts "system"; existing "light"/"dark" values are valid as-is.
// Stored values are untrusted: pass them through normaliseTheme /
// normaliseAppearance (utils/appearance.ts) before use.
export const themeItem = storage.defineItem<ThemeType>("sync:theme", {
  fallback: THEME.DARK,
});

/**
 * Visual preferences (text size, Tamil font, palette, custom backgrounds).
 * `version` lets a later release add `migrations` without losing data.
 */
export const appearanceItem = storage.defineItem<Appearance>(
  "sync:appearance",
  { fallback: DEFAULT_APPEARANCE, version: 1 },
);

/**
 * What the new tab shows with each kural, and which chapters are hidden.
 * Stored values are untrusted: pass them through normaliseContent
 * (utils/content.ts) before use.
 */
export const contentItem = storage.defineItem<ContentPreferences>(
  "sync:content",
  { fallback: DEFAULT_CONTENT, version: 1 },
);

export const favouriteKuralsItem = storage.defineItem<number[]>(
  "sync:favouriteKurals",
  { fallback: [] },
);

/**
 * Synchronous, per-device copies of the theme and appearance in localStorage,
 * read by public/theme-init.js before first paint (chrome.storage is async, so
 * it can't be read in time). `themeItem` / `appearanceItem` remain the source
 * of truth; ThemeContext and AppearanceContext mirror every change here. Keep
 * the keys and the JSON shape in sync with public/theme-init.js.
 *
 * - THEME_HINT_KEY holds the bare preference ("light" | "dark" | "system").
 *   The key and the light/dark values predate "system", so old hints still work.
 * - APPEARANCE_HINT_KEY holds `AppearanceHint`.
 */
export const THEME_HINT_KEY = "kural-tab:theme";
export const APPEARANCE_HINT_KEY = "kural-tab:appearance";

export interface AppearanceHint extends Appearance {
  /**
   * Resolved colours of the active non-Slate palette per mode, so the blocking
   * script needs no palette knowledge. Null for Slate.
   */
  colours: Record<
    "light" | "dark",
    { background: string; foreground: string }
  > | null;
}

export const readThemeHint = (): ThemeType | null => {
  try {
    const value = localStorage.getItem(THEME_HINT_KEY);
    return value === null ? null : normaliseTheme(value);
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

export const readAppearanceHint = (): Appearance | null => {
  try {
    const value = localStorage.getItem(APPEARANCE_HINT_KEY);
    return value === null ? null : normaliseAppearance(JSON.parse(value));
  } catch {
    return null;
  }
};

export const writeAppearanceHint = (appearance: Appearance): void => {
  try {
    const light = paletteColours(appearance, THEME.LIGHT);
    const dark = paletteColours(appearance, THEME.DARK);
    const hint: AppearanceHint = {
      ...appearance,
      colours: light && dark ? { light, dark } : null,
    };
    localStorage.setItem(APPEARANCE_HINT_KEY, JSON.stringify(hint));
  } catch {
    // Best effort: without it we just fall back to the default first paint.
  }
};
