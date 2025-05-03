// themeManager.ts - Manages theme switching and persistence

import { THEME, CSS_CLASSES, ELEMENT_IDS, ThemeType } from './models';
import { getElement } from './domUtils';

/**
 * Custom error class for theme-related operations
 */
export class ThemeError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'ThemeError';

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ThemeError);
        }
    }
}

/**
 * Manages application theme (light/dark mode)
 */
export class ThemeManager {
    /**
     * Sets the initial theme based on saved preferences
     * @throws ThemeError if there's an issue setting the initial theme
     */
    public static async setInitialTheme(): Promise<void> {
        try {
            const body = document.body;
            if (!body) {
                throw new ThemeError('Document body not found');
            }

            // Prevent transition flash by adding no-transition class
            body.classList.add(CSS_CLASSES.NO_TRANSITION);

            // Determine and set the theme
            const theme = await this.getSavedTheme();
            this.setTheme(theme === THEME.LIGHT);

            // Force a reflow to ensure the transition doesn't play on page load
            void document.body.offsetWidth;

            // Remove the no-transition class after a brief delay
            setTimeout(() => {
                body.classList.remove(CSS_CLASSES.NO_TRANSITION);
            }, 50);
        } catch (error) {
            console.error("Error setting initial theme:", error);

            // Default to dark theme as fallback
            this.setTheme(false);

            // Remove the no-transition class
            document.body.classList.remove(CSS_CLASSES.NO_TRANSITION);

            throw new ThemeError(
                "Failed to set initial theme",
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Gets the saved theme from storage
     * @returns Promise resolving to the saved theme or default (dark theme)
     */
    private static async getSavedTheme(): Promise<ThemeType> {
        // Type guard for Chrome API
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            try {
                const data = await chrome.storage.sync.get("theme");
                return (data.theme as ThemeType) || THEME.DARK;
            } catch (error) {
                console.error("Error retrieving theme from storage:", error);
                return THEME.DARK; // Default to dark theme
            }
        }

        return THEME.DARK; // Default to dark theme when not in Chrome extension
    }

    /**
     * Toggle between light and dark mode
     * @returns Whether light mode is active after toggling
     */
    public static toggleTheme(): boolean {
        const body = document.body;
        const isLightMode = body.classList.toggle(CSS_CLASSES.LIGHT_MODE);

        // Ensure dark mode class is also toggled correctly
        if (isLightMode) {
            body.classList.remove(CSS_CLASSES.DARK_MODE);
        } else {
            body.classList.add(CSS_CLASSES.DARK_MODE);
        }

        // Save the theme preference
        this.saveThemePreference(isLightMode);

        return isLightMode;
    }

    /**
     * Helper function to set the theme
     * @param isLight - Whether to use light theme
     */
    private static setTheme(isLight: boolean): void {
        const body = document.body;
        const modeSwitch = getElement<HTMLInputElement>(ELEMENT_IDS.MODE_SWITCH);

        if (isLight) {
            body.classList.add(CSS_CLASSES.LIGHT_MODE);
            body.classList.remove(CSS_CLASSES.DARK_MODE);
        } else {
            body.classList.add(CSS_CLASSES.DARK_MODE);
            body.classList.remove(CSS_CLASSES.LIGHT_MODE);
        }

        if (modeSwitch) {
            modeSwitch.checked = isLight;
        }
    }

    /**
     * Save theme preference to storage
     * @param isLightMode - Whether light mode is active
     * @returns Promise that resolves when saving is complete
     */
    private static saveThemePreference(isLightMode: boolean): Promise<void> {
        const theme: ThemeType = isLightMode ? THEME.LIGHT : THEME.DARK;

        // Type guard for Chrome API
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            return chrome.storage.sync
                .set({ theme })
                .catch((error) => {
                    console.error("Error saving theme:", error);
                });
        }

        return Promise.resolve();
    }
}