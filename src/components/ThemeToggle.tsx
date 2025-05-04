import React from "react";
import { THEME } from "../models";
import { useTheme } from "./ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mode-toggle">
      <input
        type="checkbox"
        id="mode-switch"
        className="mode-switch"
        checked={theme === THEME.LIGHT}
        onChange={toggleTheme}
      />
      <label
        htmlFor="mode-switch"
        className="mode-switch-label"
        aria-label="Toggle dark/light mode"
      >
        <svg
          className="sun-moon-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" className="sun" />
          <line x1="12" y1="1" x2="12" y2="3" className="sun-ray" />
          <line x1="12" y1="21" x2="12" y2="23" className="sun-ray" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" className="sun-ray" />
          <line
            x1="18.36"
            y1="18.36"
            x2="19.78"
            y2="19.78"
            className="sun-ray"
          />
          <line x1="1" y1="12" x2="3" y2="12" className="sun-ray" />
          <line x1="21" y1="12" x2="23" y2="12" className="sun-ray" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" className="sun-ray" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" className="sun-ray" />
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            className="moon"
          />
        </svg>
      </label>
    </div>
  );
};

export default ThemeToggle;
