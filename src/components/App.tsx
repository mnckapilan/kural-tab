import React from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { KuralProvider } from "../context/KuralContext";
import ThemeToggle from "./ThemeToggle";
import KuralDisplay from "./KuralDisplay";
import ErrorBoundary from "./ErrorBoundary";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <KuralProvider>
          <AppContent />
        </KuralProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="app">
      <ThemeToggle />
      <KuralDisplay />
      {import.meta.env.DEV && <div className="dev-indicator">DEV BUILD</div>}
    </div>
  );
};

export default App;
