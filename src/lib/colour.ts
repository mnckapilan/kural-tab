// Pure colour helpers for the custom background palette. No DOM access.

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Near-black / near-white used as the derived text colour (matches Slate). */
export const DARK_TEXT = "#1a1a1a";
export const LIGHT_TEXT = "#f2f2f2";

/**
 * Normalises "#abc", "ABC" or "#AABBCC" to lowercase "#rrggbb".
 * Returns null for anything else.
 */
export function normaliseHex(input: string): string | null {
  const match = HEX_PATTERN.exec(input.trim());
  const digits = match?.[1]?.toLowerCase();
  if (!digits) return null;
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((c) => c + c)
          .join("")
      : digits;
  return `#${full}`;
}

/** WCAG relative luminance of a "#rrggbb" colour (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const normalised = normaliseHex(hex);
  if (!normalised) return 0;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(normalised.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two "#rrggbb" colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Picks near-black or near-white text, whichever contrasts more with the background. */
export function pickForeground(background: string): string {
  return contrastRatio(background, DARK_TEXT) >=
    contrastRatio(background, LIGHT_TEXT)
    ? DARK_TEXT
    : LIGHT_TEXT;
}
