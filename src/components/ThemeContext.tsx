import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { ThemeType, THEME } from "../models";

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

    // Get saved theme preference
    const getSavedTheme = async (): Promise<void> => {
      try {
        if (
          typeof window !== "undefined" &&
          window.chrome &&
          window.chrome.storage &&
          window.chrome.storage.sync
        ) {
          const data = await window.chrome.storage.sync.get("theme");
          const savedTheme = (data.theme as ThemeType) || THEME.DARK;
          setTheme(savedTheme);
        }
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

    getSavedTheme();
  }, []);

  useEffect(() => {
    // Apply theme class to body
    if (theme === THEME.LIGHT) {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    } else {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    }
  }, [theme]);

  const toggleTheme = (): void => {
    const newTheme = theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    setTheme(newTheme);

    // Save theme preference to storage
    if (
      typeof window !== "undefined" &&
      window.chrome &&
      window.chrome.storage &&
      window.chrome.storage.sync
    ) {
      window.chrome.storage.sync
        .set({ theme: newTheme })
        .catch((error: unknown) => {
          console.error("Error saving theme:", error);
        });
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
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
