/// <reference types="chrome"/>
import React from "react";
import { ThemeProvider } from "./ThemeContext";
import { KuralProvider } from "./KuralContext";
import ThemeToggle from "./ThemeToggle";
import KuralDisplay from "./KuralDisplay";

declare const __DEV__: boolean;

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
      {__DEV__ && <div className="dev-indicator">DEV BUILD</div>}
    </div>
  );
};

export default App;
