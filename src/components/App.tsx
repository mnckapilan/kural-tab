/// <reference types="chrome"/>
import React from "react";
import { ThemeProvider } from "./ThemeContext";
import { KuralProvider } from "./KuralContext";
import ThemeToggle from "./ThemeToggle";
import KuralDisplay from "./KuralDisplay";

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <KuralProvider>
        <AppContent />
      </KuralProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="app">
      <ThemeToggle />
      <KuralDisplay />
    </div>
  );
};

export default App;
