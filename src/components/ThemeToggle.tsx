import React from "react";
import { Moon, Sun } from "lucide-react";
import { THEME } from "../types/models";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";

// Both icons are always mounted and stacked; the `dark:` variant on <html>
// drives the cross-fade + 180° rotation.
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className="fixed top-5 right-5 rounded-full"
      aria-label="Toggle dark/light mode"
      aria-pressed={theme === THEME.LIGHT}
      onClick={toggleTheme}
    >
      <span className="relative size-6">
        <Moon className="absolute inset-0 size-6 rotate-180 opacity-0 transition-all duration-300 dark:rotate-0 dark:opacity-100" />
        <Sun className="absolute inset-0 size-6 rotate-0 opacity-100 transition-all duration-300 dark:-rotate-180 dark:opacity-0" />
      </span>
    </Button>
  );
};

export default ThemeToggle;
