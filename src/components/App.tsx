import { ThemeProvider } from "@/context/ThemeContext";
import { AppearanceProvider } from "@/context/AppearanceContext";
import { ContentProvider } from "@/context/ContentContext";
import { KuralProvider } from "@/context/KuralContext";
import ThemeToggle from "@/components/ThemeToggle";
import SettingsButton from "@/components/SettingsButton";
import KuralDisplay from "@/components/KuralDisplay";
import ErrorBoundary from "@/components/ErrorBoundary";
import MotionProvider from "@/components/MotionProvider";

function App() {
  return (
    <ErrorBoundary>
      <MotionProvider>
        <ThemeProvider>
          <AppearanceProvider>
            <ContentProvider>
              <KuralProvider>
                <AppContent />
              </KuralProvider>
            </ContentProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </MotionProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  return (
    <div className="flex min-h-screen items-center justify-center-safe text-center leading-[normal]">
      <div>
        <SettingsButton />
        <ThemeToggle />
        <KuralDisplay />
      </div>
      {import.meta.env.DEV && (
        <div className="pointer-events-none fixed right-4 bottom-4 z-1000 rounded-full border border-white/35 bg-black/40 px-2.5 py-1.5 text-xs tracking-widest text-white">
          DEV BUILD
        </div>
      )}
    </div>
  );
}

export default App;
