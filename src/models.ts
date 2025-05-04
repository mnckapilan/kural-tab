// models.ts - Interfaces and type definitions for the application

/**
 * Represents a Kural in our application
 */
export interface Kural {
    Line1: string;
    Line2: string;
    Translation: string;
    mv: string;
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
 * Theme constants
 */
export const THEME = {
    LIGHT: "light",
    DARK: "dark"
} as const;

/**
 * Theme type derived from constants
 */
export type ThemeType = typeof THEME[keyof typeof THEME];

/**
 * CSS class constants
 */
export const CSS_CLASSES = {
    LIGHT_MODE: "light-mode",
    DARK_MODE: "dark-mode",
    NO_TRANSITION: "no-transition"
} as const;

/**
 * Element ID constants
 */
export const ELEMENT_IDS = {
    KURAL: "kural",
    EXPLANATION: "explanation",
    MV: "mv",
    NUMBER: "number",
    METADATA: "metadata",
    MODE_SWITCH: "mode-switch"
} as const;

/**
 * Element ID type derived from constants
 */
export type ElementId = typeof ELEMENT_IDS[keyof typeof ELEMENT_IDS];

/**
 * File path constants
 */
export const FILE_PATHS = {
    KURAL_DATA: "data/thirukkural.json",
    METADATA: "data/metadata.json"
} as const;