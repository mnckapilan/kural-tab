import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type Kural,
  type KuralData,
  type KuralMetadataResult,
} from "@/types/models";
import { KuralService } from "@/services/kuralService";
import { favouriteKuralsItem } from "@/utils/storage";

interface KuralContextType {
  kural: Kural | null;
  metadata: KuralMetadataResult | null;
  kuralData: KuralData | null;
  favouriteKurals: number[];
  isLoading: boolean;
  error: string | null;
  refreshKural: () => void;
  toggleFavourite: (kuralNumber: number) => void;
  isFavourite: (kuralNumber: number) => boolean;
  /** Shows the given kural; returns false (and changes nothing) if no kural has that number. */
  selectKuralByNumber: (kuralNumber: number) => boolean;
}

const KuralContext = createContext<KuralContextType | undefined>(undefined);

interface KuralProviderProps {
  children: ReactNode;
}

interface LoadedKuralData {
  kuralData: KuralData;
  metadataLookup: Map<number, KuralMetadataResult>;
}

const loadKuralData = async (): Promise<LoadedKuralData> => {
  const { kuralData, metadataData } = await KuralService.fetchKuralData();
  // metadata.json is a one-element array holding the திருக்குறள் root section
  const metadataRoot = metadataData[0];
  if (!metadataRoot) {
    throw new Error("Metadata root section is missing");
  }
  return {
    kuralData,
    metadataLookup: KuralService.buildMetadataLookup(metadataRoot),
  };
};

/** Parses a `#42`-style location hash into a kural number, or null if it isn't one. */
const kuralNumberFromHash = (hash: string): number | null => {
  const match = /^#(\d+)$/.exec(hash);
  return match ? Number(match[1]) : null;
};

const hasKural = (data: KuralData, num: number | null): num is number =>
  num !== null && data.kural.some((item) => item.Number === num);

export function KuralProvider({ children }: KuralProviderProps) {
  const [loaded, setLoaded] = useState<LoadedKuralData | null>(null);
  const [kuralNumber, setKuralNumber] = useState<number | null>(null);
  const [favouriteKurals, setFavouriteKurals] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Bumped by refreshKural() to retry a failed load.
  const [loadAttempt, setLoadAttempt] = useState(0);

  const kuralData = loaded?.kuralData ?? null;
  const isLoading = loaded === null && error === null;

  useEffect(() => {
    const loadFavouriteKurals = async (): Promise<void> => {
      try {
        setFavouriteKurals(await favouriteKuralsItem.getValue());
      } catch (error: unknown) {
        console.error("Error retrieving favourite kurals from storage:", error);
      }
    };

    void loadFavouriteKurals();

    // Keep other open new-tab pages in sync
    return favouriteKuralsItem.watch((next) => {
      setFavouriteKurals(next);
    });
  }, []);

  // Fetch once; later randomisations reuse the loaded data. `loadAttempt`
  // re-runs this after a failure.
  useEffect(() => {
    let cancelled = false;
    loadKuralData().then(
      (data) => {
        if (cancelled) return;
        setLoaded(data);
        // A `newtab.html#42` deep link (or a reload) shows that kural;
        // otherwise pick a random one.
        const fromHash = kuralNumberFromHash(window.location.hash);
        setKuralNumber(
          hasKural(data.kuralData, fromHash)
            ? fromHash
            : KuralService.getRandomKural(data.kuralData).Number,
        );
      },
      (err: unknown) => {
        if (cancelled) return;
        console.error("Error loading Thirukkural:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load Thirukkural",
        );
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  // Mirror the current kural into the URL so reloads keep it and the link can
  // be shared. replaceState, not pushState: randomising shouldn't fill the
  // tab's back history (and replaceState doesn't fire `hashchange`).
  useEffect(() => {
    if (kuralNumber === null) return;
    const hash = `#${kuralNumber}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [kuralNumber]);

  // Follow manual edits to the hash (e.g. pasting `#42` into the address bar).
  useEffect(() => {
    if (!kuralData) return;
    const onHashChange = (): void => {
      const fromHash = kuralNumberFromHash(window.location.hash);
      if (hasKural(kuralData, fromHash)) {
        setKuralNumber(fromHash);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [kuralData]);

  const kural = useMemo(
    () => kuralData?.kural.find((item) => item.Number === kuralNumber) ?? null,
    [kuralData, kuralNumber],
  );
  const metadata =
    kuralNumber === null
      ? null
      : (loaded?.metadataLookup.get(kuralNumber) ?? null);

  const refreshKural = useCallback((): void => {
    if (kuralData) {
      setKuralNumber(KuralService.getRandomKural(kuralData).Number);
    } else {
      // Nothing loaded yet: this is the "Try Again" path after a failed load.
      setError(null);
      setLoadAttempt((n) => n + 1);
    }
  }, [kuralData]);

  const selectKuralByNumber = useCallback(
    (selected: number): boolean => {
      if (!kuralData || !hasKural(kuralData, selected)) return false;
      setKuralNumber(selected);
      return true;
    },
    [kuralData],
  );

  const isFavourite = useCallback(
    (num: number): boolean => favouriteKurals.includes(num),
    [favouriteKurals],
  );

  const toggleFavourite = useCallback(
    (num: number): void => {
      const next = favouriteKurals.includes(num)
        ? favouriteKurals.filter((n) => n !== num)
        : [...favouriteKurals, num];
      const sorted = next.sort((a, b) => a - b);

      setFavouriteKurals(sorted);
      favouriteKuralsItem.setValue(sorted).catch((error: unknown) => {
        console.error("Error saving favourite kurals:", error);
      });
    },
    [favouriteKurals],
  );

  const value = useMemo(
    () => ({
      kural,
      metadata,
      kuralData,
      favouriteKurals,
      isLoading,
      error,
      refreshKural,
      toggleFavourite,
      isFavourite,
      selectKuralByNumber,
    }),
    [
      kural,
      metadata,
      kuralData,
      favouriteKurals,
      isLoading,
      error,
      refreshKural,
      toggleFavourite,
      isFavourite,
      selectKuralByNumber,
    ],
  );

  return <KuralContext value={value}>{children}</KuralContext>;
}

export function useKural(): KuralContextType {
  const context = use(KuralContext);
  if (context === undefined) {
    throw new Error("useKural must be used within a KuralProvider");
  }
  return context;
}
