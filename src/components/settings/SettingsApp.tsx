import { useEffect, useState } from "react";
import { BookOpen, Info, Palette, type LucideIcon } from "lucide-react";
import { AppearanceProvider } from "@/context/AppearanceContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import MotionProvider from "@/components/MotionProvider";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import ContentSettings from "@/components/settings/ContentSettings";
import AboutSettings from "@/components/settings/AboutSettings";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme, colours, text size and the Tamil typeface.",
    icon: Palette,
    Component: AppearanceSettings,
  },
  {
    id: "content",
    label: "Content",
    description: "What's shown with each kural, and which kurals can appear.",
    icon: BookOpen,
    Component: ContentSettings,
  },
  {
    id: "about",
    label: "About",
    description: "",
    icon: Info,
    Component: AboutSettings,
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  Component: () => React.ReactNode;
}>;

type SectionId = (typeof SECTIONS)[number]["id"];

const sectionFromHash = (): SectionId => {
  const id = window.location.hash.slice(1);
  return SECTIONS.find((s) => s.id === id)?.id ?? "appearance";
};

function SettingsApp() {
  return (
    <ErrorBoundary>
      <MotionProvider>
        <ThemeProvider>
          <AppearanceProvider>
            <SettingsPage />
          </AppearanceProvider>
        </ThemeProvider>
      </MotionProvider>
    </ErrorBoundary>
  );
}

function SettingsPage() {
  const [active, setActive] = useState<SectionId>(sectionFromHash);

  useEffect(() => {
    const onHashChange = () => setActive(sectionFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const { Component } = section;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10 sm:flex-row sm:gap-12 sm:py-16">
      <aside className="sm:w-52 sm:shrink-0">
        <div className="sticky top-16">
          <div className="mb-8 flex items-center gap-3 px-3">
            <img src="/icon/48.png" alt="" className="size-8" />
            <div>
              <div className="text-base text-foreground">Kural Tab</div>
              <div className="text-xs text-muted-foreground">Settings</div>
            </div>
          </div>
          <nav aria-label="Settings sections">
            <ul className="flex gap-1 sm:flex-col">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={id === active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
                      id === active && "bg-accent text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1 sm:max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-light text-foreground">
            {section.label}
          </h1>
          {section.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {section.description}
            </p>
          )}
        </header>
        <Component />
      </main>
    </div>
  );
}

export default SettingsApp;
