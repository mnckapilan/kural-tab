import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { KuralProvider } from "@/context/KuralContext";
import ThemeToggle from "@/components/ThemeToggle";
import KuralDisplay from "@/components/KuralDisplay";
import ErrorBoundary from "@/components/ErrorBoundary";
import MotionProvider from "@/components/MotionProvider";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <MotionProvider>
        <ThemeProvider>
          <KuralProvider>
            <AppContent />
          </KuralProvider>
        </ThemeProvider>
      </MotionProvider>
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center text-center leading-[normal]">
      {/* Shrink-wrapped flex item: the couplet width is measured against it. */}
      <div>
        <ThemeToggle />
        <KuralDisplay />
      </div>
      {import.meta.env.DEV && (
        <div className="pointer-events-none fixed right-4 bottom-4 z-1000 rounded-full border border-white/35 bg-black/40 px-2.5 py-1.5 text-xs tracking-[0.08em] text-white">
          DEV BUILD
        </div>
      )}
    </div>
  );
};

export default App;
