import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { type ThemeType, THEME } from "../types/models";
import { themeItem } from "../utils/storage";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(THEME.DARK);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Add initial no-transition class to prevent flash
    document.body.classList.add("no-transition");

    const getSavedTheme = async (): Promise<void> => {
      try {
        setTheme(await themeItem.getValue());
      } catch (error: unknown) {
        console.error("Error retrieving theme from storage:", error);
      } finally {
        setIsLoading(false);

        // Force a reflow before removing the no-transition class
        void document.body.offsetWidth;

        // Remove the no-transition class after a brief delay
        setTimeout(() => {
          document.body.classList.remove("no-transition");
        }, 50);
      }
    };

    void getSavedTheme();

    // Keep other open new-tab pages in sync
    return themeItem.watch((newTheme) => {
      setTheme(newTheme);
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme === THEME.LIGHT ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === THEME.DARK);
  }, [theme]);

  const toggleTheme = (): void => {
    const newTheme = theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    setTheme(newTheme);

    themeItem.setValue(newTheme).catch((error: unknown) => {
      console.error("Error saving theme:", error);
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
