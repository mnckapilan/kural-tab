// models.ts - Interfaces and type definitions for the application

/**
 * Represents a Kural in our application
 */
export interface Kural {
  Line1: string;
  Line2: string;
  /** Short English translation */
  Translation: string;
  /** English prose explanation */
  explanation: string;
  /** English verse translation; its two lines are run together in the data */
  couplet: string;
  /** Tamil meaning by மு. வரதராசனார் (Mu. Varadarasanar) */
  mv: string;
  /** Tamil meaning by சாலமன் பாப்பையா (Solomon Pappaiah) */
  sp: string;
  /** Tamil meaning by மு. கருணாநிதி (M. Karunanidhi) */
  mk: string;
  Number: number;
}

/**
 * Represents the entire Kural dataset
 */
export interface KuralData {
  kural: ReadonlyArray<Kural>;
}

/**
 * Represents a chapter in the Thirukkural
 */
export interface Chapter {
  name: string;
  translation: string;
  transliteration?: string;
  number: number;
  start: number;
  end: number;
}

/**
 * Represents the chapters container
 */
export interface ChaptersContainer {
  tamil: string;
  detail: ReadonlyArray<Chapter>;
}

/**
 * Represents a chapter group (இயல்) in the Thirukkural
 */
export interface ChapterGroup {
  name: string;
  translation: string;
  transliteration?: string;
  number: number;
  chapters: ChaptersContainer;
}

/**
 * Represents the chapter group container
 */
export interface ChapterGroupContainer {
  tamil: string;
  detail: ReadonlyArray<ChapterGroup>;
}

/**
 * Represents a section of the Thirukkural
 */
export interface Section {
  name: string;
  translation: string;
  transliteration?: string;
  number: number;
  chapterGroup: ChapterGroupContainer;
}

/**
 * Represents the metadata structure for sections
 */
export interface MetadataSection {
  tamil: string;
  section: {
    tamil: string;
    detail: ReadonlyArray<Section>;
  };
}

/**
 * Represents the metadata for a specific Kural
 */
export interface KuralMetadataResult {
  section: {
    name: string;
    tamil: string;
  };
  chapter: {
    name: string;
    tamil: string;
    number: number;
  };
}

/**
 * Theme constants. LIGHT/DARK are the two resolved themes; SYSTEM is only ever
 * a stored preference ("follow prefers-color-scheme").
 */
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

/**
 * Theme preference as stored (light, dark or system)
 */
export type ThemeType = (typeof THEME)[keyof typeof THEME];

/**
 * Theme actually applied to the page (system resolved to light or dark)
 */
export type ResolvedTheme = Exclude<ThemeType, typeof THEME.SYSTEM>;

/**
 * Text size ids. The scale factors live in CSS (`[data-size]` in globals.css).
 */
export const FONT_SIZE = {
  S: "s",
  M: "m",
  L: "l",
  XL: "xl",
} as const;

export type FontSizeId = (typeof FONT_SIZE)[keyof typeof FONT_SIZE];

/**
 * Tamil typeface ids (`[data-font]` in globals.css, @font-face declarations)
 */
export const TAMIL_FONT = {
  NOTO_SANS: "noto-sans",
  NOTO_SERIF: "noto-serif",
  TIRO: "tiro",
  MUKTA: "mukta",
  HIND: "hind",
  KAVIVANAR: "kavivanar",
} as const;

export type TamilFontId = (typeof TAMIL_FONT)[keyof typeof TAMIL_FONT];

/**
 * Background palette ids (`[data-palette]` in globals.css). CUSTOM uses the
 * user's own backgrounds from `Appearance.customBackground`.
 */
export const PALETTE = {
  SLATE: "slate",
  PAPER: "paper",
  PALM_LEAF: "palm-leaf",
  INK: "ink",
  FOREST: "forest",
  CUSTOM: "custom",
} as const;

export type PaletteId = (typeof PALETTE)[keyof typeof PALETTE];

/**
 * Custom background colours (#rrggbb), one per resolved theme
 */
export interface CustomBackground {
  light: string;
  dark: string;
}

/**
 * Visual preferences stored in `appearanceItem`
 */
export interface Appearance {
  fontSize: FontSizeId;
  tamilFont: TamilFontId;
  palette: PaletteId;
  customBackground: CustomBackground;
}

/**
 * Tamil meaning (உரை) to show. The ids are the field names on `Kural`.
 */
export const MEANING_SOURCE = {
  VARADARASANAR: "mv",
  PAPPAIAH: "sp",
  KARUNANIDHI: "mk",
} as const;

export type MeaningSourceId =
  (typeof MEANING_SOURCE)[keyof typeof MEANING_SOURCE];

/**
 * English text to show: the short translation, the prose explanation or the
 * verse couplet.
 */
export const TRANSLATION_SOURCE = {
  TRANSLATION: "translation",
  EXPLANATION: "explanation",
  COUPLET: "couplet",
} as const;

export type TranslationSourceId =
  (typeof TRANSLATION_SOURCE)[keyof typeof TRANSLATION_SOURCE];

/**
 * Content preferences stored in `contentItem`. `hiddenChapters` holds chapter
 * numbers (1-133), sorted and de-duplicated; sections and இயல் are derived.
 */
export interface ContentPreferences {
  showTranslation: boolean;
  showMeaning: boolean;
  showMetadata: boolean;
  translationSource: TranslationSourceId;
  meaningSource: MeaningSourceId;
  hiddenChapters: number[];
}

/**
 * File path constants
 */
export const FILE_PATHS = {
  KURAL_DATA: "data/thirukkural.json",
  METADATA: "data/metadata.json",
} as const;
