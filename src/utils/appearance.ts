import { PALETTES } from "@/lib/appearanceOptions";
import { normaliseHex, pickForeground } from "@/lib/colour";
import {
  FONT_SIZE,
  PALETTE,
  TAMIL_FONT,
  THEME,
  type Appearance,
  type CustomBackground,
  type ResolvedTheme,
  type ThemeType,
} from "@/types/models";

const values = <T extends Record<string, string>>(
  constants: T,
): ReadonlyArray<T[keyof T]> => Object.values(constants) as Array<T[keyof T]>;

const isOneOf = <T extends string>(
  options: ReadonlyArray<T>,
  value: unknown,
): value is T => options.includes(value as T);

export const DEFAULT_APPEARANCE: Appearance = {
  fontSize: FONT_SIZE.M,
  tamilFont: TAMIL_FONT.NOTO_SANS,
  palette: PALETTE.SLATE,
  // Slate's backgrounds, so choosing Custom starts from the default look.
  customBackground: { light: "#d4d4d4", dark: "#1a1a1a" },
};

/** Coerces anything stored (or hinted) into a valid theme preference. */
export function normaliseTheme(raw: unknown): ThemeType {
  return isOneOf(values(THEME), raw) ? raw : THEME.DARK;
}

/**
 * Merges a stored value over the defaults field by field, so missing, partial
 * or invalid data (older versions, hand-edited storage) never breaks the page.
 */
export function normaliseAppearance(raw: unknown): Appearance {
  const stored = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  const custom = (
    typeof stored.customBackground === "object" &&
    stored.customBackground !== null
      ? stored.customBackground
      : {}
  ) as Record<string, unknown>;
  const colour = (value: unknown, fallback: string): string =>
    (typeof value === "string" ? normaliseHex(value) : null) ?? fallback;

  return {
    fontSize: isOneOf(values(FONT_SIZE), stored.fontSize)
      ? stored.fontSize
      : DEFAULT_APPEARANCE.fontSize,
    tamilFont: isOneOf(values(TAMIL_FONT), stored.tamilFont)
      ? stored.tamilFont
      : DEFAULT_APPEARANCE.tamilFont,
    palette: isOneOf(values(PALETTE), stored.palette)
      ? stored.palette
      : DEFAULT_APPEARANCE.palette,
    customBackground: {
      light: colour(custom.light, DEFAULT_APPEARANCE.customBackground.light),
      dark: colour(custom.dark, DEFAULT_APPEARANCE.customBackground.dark),
    },
  };
}

export function sameAppearance(a: Appearance, b: Appearance): boolean {
  return (
    a.fontSize === b.fontSize &&
    a.tamilFont === b.tamilFont &&
    a.palette === b.palette &&
    a.customBackground.light === b.customBackground.light &&
    a.customBackground.dark === b.customBackground.dark
  );
}

export interface BackgroundColours {
  background: string;
  foreground: string;
}

/**
 * Background/foreground of the active palette for one theme, or null for Slate
 * (whose values are the stylesheet defaults). Custom text is derived from the
 * background so contrast always holds.
 */
export function paletteColours(
  appearance: Appearance,
  theme: ResolvedTheme,
): BackgroundColours | null {
  if (appearance.palette === PALETTE.CUSTOM) {
    const background = appearance.customBackground[theme];
    return { background, foreground: pickForeground(background) };
  }
  if (appearance.palette === PALETTE.SLATE) return null;
  const preset = PALETTES.find((p) => p.id === appearance.palette);
  return preset ? preset[theme] : null;
}

/** Backgrounds a palette uses in each mode (for theme cards and seeding Custom). */
export function paletteBackgrounds(appearance: Appearance): CustomBackground {
  const light = paletteColours(appearance, THEME.LIGHT);
  const dark = paletteColours(appearance, THEME.DARK);
  const slate = PALETTES[0];
  return {
    light: light?.background ?? slate?.light.background ?? "#d4d4d4",
    dark: dark?.background ?? slate?.dark.background ?? "#1a1a1a",
  };
}
