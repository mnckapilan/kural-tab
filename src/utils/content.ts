import type { ContentPreferences } from "@/types/models";

/** Chapters are numbered 1-133 in metadata.json. */
export const TOTAL_CHAPTERS = 133;

export const DEFAULT_CONTENT: ContentPreferences = {
  showTranslation: true,
  showMeaning: true,
  showMetadata: true,
  hiddenChapters: [],
};

/** Sorted, de-duplicated chapter numbers, dropping anything not 1-133. */
export function normaliseChapters(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const valid = (raw as unknown[]).filter(
    (n): n is number =>
      typeof n === "number" &&
      Number.isInteger(n) &&
      n >= 1 &&
      n <= TOTAL_CHAPTERS,
  );
  return [...new Set(valid)].sort((a, b) => a - b);
}

/**
 * Merges a stored value over the defaults field by field, so missing, partial
 * or invalid data never breaks the page.
 */
export function normaliseContent(raw: unknown): ContentPreferences {
  const stored = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  const flag = (value: unknown, fallback: boolean): boolean =>
    typeof value === "boolean" ? value : fallback;

  return {
    showTranslation: flag(
      stored.showTranslation,
      DEFAULT_CONTENT.showTranslation,
    ),
    showMeaning: flag(stored.showMeaning, DEFAULT_CONTENT.showMeaning),
    showMetadata: flag(stored.showMetadata, DEFAULT_CONTENT.showMetadata),
    hiddenChapters: normaliseChapters(stored.hiddenChapters),
  };
}

export function sameContent(
  a: ContentPreferences,
  b: ContentPreferences,
): boolean {
  return (
    a.showTranslation === b.showTranslation &&
    a.showMeaning === b.showMeaning &&
    a.showMetadata === b.showMetadata &&
    a.hiddenChapters.length === b.hiddenChapters.length &&
    a.hiddenChapters.every((n, i) => n === b.hiddenChapters[i])
  );
}
