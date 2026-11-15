import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { type ThemeType, THEME } from "@/types/models";
import { readThemeHint, themeItem, writeThemeHint } from "@/utils/storage";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Start from the same theme public/theme-init.js already painted, so the
  // class effect below doesn't flip it back before storage resolves.
  const [theme, setTheme] = useState<ThemeType>(
    () => readThemeHint() ?? THEME.DARK,
  );
  // Theme currently applied to <html>, and whether the next application is the
  // storage correction (which must not animate; see below).
  const appliedTheme = useRef<ThemeType | null>(null);
  const applyInstantly = useRef(false);

  useEffect(() => {
    const getSavedTheme = async (): Promise<void> => {
      try {
        const saved = await themeItem.getValue();
        // The localStorage hint can be missing or stale (first run, cleared
        // site data). Correcting it must not animate the body background.
        if (saved !== appliedTheme.current) {
          applyInstantly.current = true;
          setTheme(saved);
        }
      } catch (error: unknown) {
        console.error("Error retrieving theme from storage:", error);
      }
    };

    void getSavedTheme();

    // Keep other open new-tab pages in sync
    return themeItem.watch((newTheme) => {
      setTheme(newTheme);
    });
  }, []);

  useEffect(() => {
    const { body, documentElement } = document;
    const instant = applyInstantly.current;
    applyInstantly.current = false;

    if (instant) body.classList.add("no-transition");
    documentElement.dataset.theme = theme === THEME.LIGHT ? "light" : "dark";
    documentElement.classList.toggle("dark", theme === THEME.DARK);
    if (instant) {
      // Flush styles while transitions are off, so removing the class below
      // doesn't start one.
      void body.offsetWidth;
      body.classList.remove("no-transition");
    }

    appliedTheme.current = theme;
    writeThemeHint(theme);
  }, [theme]);

  const toggleTheme = (): void => {
    const newTheme = theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    setTheme(newTheme);

    themeItem.setValue(newTheme).catch((error: unknown) => {
      console.error("Error saving theme:", error);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
