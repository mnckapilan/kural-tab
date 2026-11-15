import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ContentPreferences } from "@/types/models";
import {
  DEFAULT_CONTENT,
  normaliseChapters,
  normaliseContent,
  sameContent,
} from "@/utils/content";
import { contentItem } from "@/utils/storage";

interface ContentContextType {
  content: ContentPreferences;
  /** False until the stored preferences have been read (or failed to read). */
  isReady: boolean;
  setShowTranslation: (show: boolean) => void;
  setShowMeaning: (show: boolean) => void;
  setShowMetadata: (show: boolean) => void;
  /** Replaces the hidden chapters (normalised before saving). */
  setHiddenChapters: (chapters: ReadonlyArray<number>) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
}

export function ContentProvider({ children }: ContentProviderProps) {
  const [content, setContent] = useState<ContentPreferences>(DEFAULT_CONTENT);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const saved = normaliseContent(await contentItem.getValue());
        if (!cancelled) {
          setContent((prev) => (sameContent(prev, saved) ? prev : saved));
        }
      } catch (error: unknown) {
        console.error("Error retrieving content settings from storage:", error);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };
    void load();

    // Keep other open new-tab and settings pages in sync.
    const unwatch = contentItem.watch((next) => {
      const normalised = normaliseContent(next);
      setContent((prev) => (sameContent(prev, normalised) ? prev : normalised));
    });
    return () => {
      cancelled = true;
      unwatch();
    };
  }, []);

  const save = useCallback((next: ContentPreferences): void => {
    setContent(next);
    contentItem.setValue(next).catch((error: unknown) => {
      console.error("Error saving content settings:", error);
    });
  }, []);

  const setShowTranslation = useCallback(
    (showTranslation: boolean): void => save({ ...content, showTranslation }),
    [content, save],
  );
  const setShowMeaning = useCallback(
    (showMeaning: boolean): void => save({ ...content, showMeaning }),
    [content, save],
  );
  const setShowMetadata = useCallback(
    (showMetadata: boolean): void => save({ ...content, showMetadata }),
    [content, save],
  );
  const setHiddenChapters = useCallback(
    (chapters: ReadonlyArray<number>): void =>
      save({ ...content, hiddenChapters: normaliseChapters(chapters) }),
    [content, save],
  );

  const value = useMemo(
    () => ({
      content,
      isReady,
      setShowTranslation,
      setShowMeaning,
      setShowMetadata,
      setHiddenChapters,
    }),
    [
      content,
      isReady,
      setShowTranslation,
      setShowMeaning,
      setShowMetadata,
      setHiddenChapters,
    ],
  );

  return <ContentContext value={value}>{children}</ContentContext>;
}

export function useContent(): ContentContextType {
  const context = use(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
