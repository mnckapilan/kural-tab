import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type ResolvedTheme, type ThemeType, THEME } from "@/types/models";
import { normaliseTheme } from "@/utils/appearance";
import { withoutTransitions } from "@/utils/noTransition";
import { readThemeHint, themeItem, writeThemeHint } from "@/utils/storage";

interface ThemeContextType {
  /** The theme currently applied (system already resolved). */
  theme: ResolvedTheme;
  /** What the user chose: light, dark or system. */
  themePreference: ThemeType;
  setThemePreference: (preference: ThemeType) => void;
  /** Flips to the opposite of the applied theme and stores that explicit value. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_QUERY = "(prefers-color-scheme: dark)";

const subscribeSystemDark = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getSystemDark = (): boolean => window.matchMedia(DARK_QUERY).matches;

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Start from the same preference public/theme-init.js already painted, so
  // the class effect below doesn't flip it back before storage resolves.
  const [preference, setPreference] = useState<ThemeType>(
    () => readThemeHint() ?? THEME.DARK,
  );
  const systemDark = useSyncExternalStore(subscribeSystemDark, getSystemDark);
  const theme: ResolvedTheme =
    preference === THEME.SYSTEM
      ? systemDark
        ? THEME.DARK
        : THEME.LIGHT
      : preference;

  // Preference currently applied to <html>, and whether the next application is
  // the storage correction (which must not animate; see withoutTransitions).
  const appliedPreference = useRef<ThemeType | null>(null);
  const applyInstantly = useRef(false);

  useEffect(() => {
    const getSavedTheme = async (): Promise<void> => {
      try {
        const saved = normaliseTheme(await themeItem.getValue());
        // The localStorage hint can be missing or stale (first run, cleared
        // site data). Correcting it must not animate the body background.
        if (saved !== appliedPreference.current) {
          applyInstantly.current = true;
          setPreference(saved);
        }
      } catch (error: unknown) {
        console.error("Error retrieving theme from storage:", error);
      }
    };

    void getSavedTheme();

    // Keep other open new-tab and settings pages in sync
    return themeItem.watch((newTheme) => {
      setPreference(normaliseTheme(newTheme));
    });
  }, []);

  useEffect(() => {
    const { documentElement } = document;
    const apply = (): void => {
      documentElement.dataset.theme = theme;
      documentElement.classList.toggle("dark", theme === THEME.DARK);
    };

    if (applyInstantly.current) {
      applyInstantly.current = false;
      withoutTransitions(apply);
    } else {
      apply();
    }
  }, [theme]);

  useEffect(() => {
    appliedPreference.current = preference;
    // The theme effect above has consumed the flag if the resolved theme
    // changed; if it didn't (e.g. dark -> system on a dark OS), drop it here.
    applyInstantly.current = false;
    writeThemeHint(preference);
  }, [preference]);

  const setThemePreference = useCallback((next: ThemeType): void => {
    setPreference(next);

    themeItem.setValue(next).catch((error: unknown) => {
      console.error("Error saving theme:", error);
    });
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemePreference(theme === THEME.DARK ? THEME.LIGHT : THEME.DARK);
  }, [theme, setThemePreference]);

  const value = useMemo(
    () => ({
      theme,
      themePreference: preference,
      setThemePreference,
      toggleTheme,
    }),
    [theme, preference, setThemePreference, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextType {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
