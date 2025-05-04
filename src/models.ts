// models.ts - Interfaces and type definitions for the application

/**
 * Represents a Kural in our application
 */
export interface Kural {
    readonly line1: string;
    readonly line2: string;
    readonly explanation: string;
    readonly mv: string;
    readonly number: number;
}

/**
 * Represents the entire Kural dataset
 */
export interface KuralData {
    readonly kural: ReadonlyArray<Kural>;
}

/**
 * Represents a chapter in the Thirukkural
 */
export interface Chapter {
    readonly start: number;
    readonly end: number;
    readonly name: string;
    readonly translation: string;
    readonly number: number;
}

/**
 * Represents a group of chapters
 */
export interface ChapterGroup {
    readonly detail: ReadonlyArray<{
        readonly chapters: {
            readonly detail: ReadonlyArray<Chapter>;
        };
    }>;
}

/**
 * Represents a section of the Thirukkural
 */
export interface Section {
    readonly name: string;
    readonly translation: string;
    readonly chapterGroup: ChapterGroup;
}

/**
 * Represents the metadata structure for sections
 */
export interface MetadataSection {
    readonly section: {
        readonly detail: ReadonlyArray<Section>;
    };
}

/**
 * Represents the metadata for a specific Kural
 */
export interface KuralMetadataResult {
    readonly section: {
        readonly name: string;
        readonly tamil: string;
    };
    readonly chapter: {
        readonly name: string;
        readonly tamil: string;
        readonly number: number;
    };
}

/**
 * Represents a starred Kural with its metadata
 */
export interface StarredKural {
    readonly kural: Kural;
    readonly metadata: KuralMetadataResult | null;
    readonly starredAt: number; // timestamp when starred
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
    MODE_SWITCH: "mode-switch",
    STAR_BUTTON: "star-button",
    STARRED_LIST: "starred-list",
    STARRED_CONTAINER: "starred-container",
    BACK_TO_RANDOM: "back-to-random",
    STARRED_PAGE_LINK: "starred-page-link"
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

/**
 * Storage keys for Chrome storage
 */
export const STORAGE_KEYS = {
    STARRED_KURALS: "starredKurals",
    THEME: "theme"
} as const;

/**
 * Represents the application pages
 */
export enum AppPage {
    RANDOM = "random",
    STARRED = "starred"
}