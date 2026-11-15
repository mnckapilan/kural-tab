import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "@/context/ThemeContext";
import { pickForeground } from "@/lib/colour";
import {
  PALETTE,
  type Appearance,
  type FontSizeId,
  type PaletteId,
  type ResolvedTheme,
  type TamilFontId,
} from "@/types/models";
import {
  DEFAULT_APPEARANCE,
  normaliseAppearance,
  paletteBackgrounds,
  sameAppearance,
} from "@/utils/appearance";
import { withoutTransitions } from "@/utils/noTransition";
import {
  appearanceItem,
  readAppearanceHint,
  writeAppearanceHint,
} from "@/utils/storage";

interface AppearanceContextType {
  appearance: Appearance;
  setFontSize: (fontSize: FontSizeId) => void;
  setTamilFont: (tamilFont: TamilFontId) => void;
  setPalette: (palette: PaletteId) => void;
  /** `hex` must already be a normalised "#rrggbb". */
  setCustomBackground: (mode: ResolvedTheme, hex: string) => void;
  resetAppearance: () => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(
  undefined,
);

// Dragging a native colour input fires many change events; chrome.storage.sync
// is rate limited, so custom colours are applied at once but saved when idle.
const CUSTOM_SAVE_DELAY_MS = 300;

interface AppearanceProviderProps {
  children: ReactNode;
}

/** Must be rendered inside ThemeProvider (custom colours depend on the resolved theme). */
export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const { theme } = useTheme();
  // Start from the hint public/theme-init.js already painted from.
  const [appearance, setAppearance] = useState<Appearance>(
    () => readAppearanceHint() ?? DEFAULT_APPEARANCE,
  );
  const appliedAppearance = useRef<Appearance | null>(null);
  const applyInstantly = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const unsaved = useRef<Appearance | null>(null);

  const flushSave = useCallback((): void => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    const pending = unsaved.current;
    unsaved.current = null;
    if (pending) {
      appearanceItem.setValue(pending).catch((error: unknown) => {
        console.error("Error saving appearance:", error);
      });
    }
  }, []);

  useEffect(() => {
    const getSavedAppearance = async (): Promise<void> => {
      try {
        const saved = normaliseAppearance(await appearanceItem.getValue());
        // The localStorage hint can be missing or stale. Correcting it must
        // not animate the body background.
        if (
          appliedAppearance.current &&
          !sameAppearance(saved, appliedAppearance.current)
        ) {
          applyInstantly.current = true;
          setAppearance(saved);
        }
      } catch (error: unknown) {
        console.error("Error retrieving appearance from storage:", error);
      }
    };

    void getSavedAppearance();

    // Keep other open new-tab and settings pages in sync. Ignore echoes while
    // a local change is still waiting to be saved.
    const unwatch = appearanceItem.watch((next) => {
      if (unsaved.current) return;
      const normalised = normaliseAppearance(next);
      setAppearance((prev) =>
        sameAppearance(prev, normalised) ? prev : normalised,
      );
    });

    return () => {
      unwatch();
      flushSave();
    };
  }, [flushSave]);

  useEffect(() => {
    const { documentElement } = document;
    const apply = (): void => {
      documentElement.dataset.palette = appearance.palette;
      documentElement.dataset.font = appearance.tamilFont;
      documentElement.dataset.size = appearance.fontSize;
      // Only Custom needs inline colours (text is derived from the
      // background); presets are pure CSS. theme-init.js may have set inline
      // colours for the first paint of any palette, so clear them otherwise.
      if (appearance.palette === PALETTE.CUSTOM) {
        const background = appearance.customBackground[theme];
        documentElement.style.setProperty("--background", background);
        documentElement.style.setProperty(
          "--foreground",
          pickForeground(background),
        );
      } else {
        documentElement.style.removeProperty("--background");
        documentElement.style.removeProperty("--foreground");
      }
    };

    if (applyInstantly.current) {
      applyInstantly.current = false;
      withoutTransitions(apply);
    } else {
      apply();
    }
    appliedAppearance.current = appearance;
    writeAppearanceHint(appearance);
  }, [appearance, theme]);

  const save = useCallback(
    (next: Appearance, { debounce = false } = {}): void => {
      setAppearance(next);
      unsaved.current = next;
      window.clearTimeout(saveTimer.current);
      if (debounce) {
        saveTimer.current = window.setTimeout(flushSave, CUSTOM_SAVE_DELAY_MS);
      } else {
        flushSave();
      }
    },
    [flushSave],
  );

  const setFontSize = useCallback(
    (fontSize: FontSizeId): void => save({ ...appearance, fontSize }),
    [appearance, save],
  );

  const setTamilFont = useCallback(
    (tamilFont: TamilFontId): void => save({ ...appearance, tamilFont }),
    [appearance, save],
  );

  const setPalette = useCallback(
    (palette: PaletteId): void => {
      // First time choosing Custom (backgrounds still the defaults): start
      // from the colours currently on screen.
      const untouched =
        appearance.customBackground.light ===
          DEFAULT_APPEARANCE.customBackground.light &&
        appearance.customBackground.dark ===
          DEFAULT_APPEARANCE.customBackground.dark;
      const customBackground =
        palette === PALETTE.CUSTOM && untouched
          ? paletteBackgrounds(appearance)
          : appearance.customBackground;
      save({ ...appearance, palette, customBackground });
    },
    [appearance, save],
  );

  const setCustomBackground = useCallback(
    (mode: ResolvedTheme, hex: string): void =>
      save(
        {
          ...appearance,
          customBackground: { ...appearance.customBackground, [mode]: hex },
        },
        { debounce: true },
      ),
    [appearance, save],
  );

  const resetAppearance = useCallback(
    (): void => save(DEFAULT_APPEARANCE),
    [save],
  );

  const value = useMemo(
    () => ({
      appearance,
      setFontSize,
      setTamilFont,
      setPalette,
      setCustomBackground,
      resetAppearance,
    }),
    [
      appearance,
      setFontSize,
      setTamilFont,
      setPalette,
      setCustomBackground,
      resetAppearance,
    ],
  );

  return <AppearanceContext value={value}>{children}</AppearanceContext>;
}

export function useAppearance(): AppearanceContextType {
  const context = use(AppearanceContext);
  if (context === undefined) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}
