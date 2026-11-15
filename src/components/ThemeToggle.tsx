import React from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { THEME } from "../types/models";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { ENTRANCE, FADE_IN, FADE_OUT } from "@/lib/motion";

// Sun/Moon swap with a rotate + fade. `initial={false}` skips the animation on
// first render (same intent as the `no-transition` flash prevention).
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <m.div
      className="fixed top-5 right-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: ENTRANCE }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="rounded-full"
        aria-label="Toggle dark/light mode"
        aria-pressed={theme === THEME.LIGHT}
        onClick={toggleTheme}
      >
        <span className="relative size-6">
          <AnimatePresence initial={false} mode="wait">
            <m.span
              key={theme}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0, transition: FADE_IN }}
              exit={{ opacity: 0, rotate: 90, transition: FADE_OUT }}
            >
              {theme === THEME.DARK ? (
                <Moon className="size-6" />
              ) : (
                <Sun className="size-6" />
              )}
            </m.span>
          </AnimatePresence>
        </span>
      </Button>
    </m.div>
  );
};

export default ThemeToggle;
