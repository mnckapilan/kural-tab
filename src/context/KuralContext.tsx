import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  type Kural,
  type KuralData,
  type KuralMetadataResult,
} from "../types/models";
import { KuralService } from "../services/kuralService";
import { favouriteKuralsItem } from "../utils/storage";

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
  selectKuralByNumber: (kuralNumber: number) => void;
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

export const KuralProvider: React.FC<KuralProviderProps> = ({ children }) => {
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
        setKuralNumber(KuralService.getRandomKural(data.kuralData).Number);
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

  const kural = useMemo(
    () => kuralData?.kural.find((item) => item.Number === kuralNumber) ?? null,
    [kuralData, kuralNumber],
  );
  const metadata =
    kuralNumber === null
      ? null
      : (loaded?.metadataLookup.get(kuralNumber) ?? null);

  const refreshKural = (): void => {
    if (kuralData) {
      setKuralNumber(KuralService.getRandomKural(kuralData).Number);
    } else {
      // Nothing loaded yet: this is the "Try Again" path after a failed load.
      setError(null);
      setLoadAttempt((n) => n + 1);
    }
  };

  const selectKuralByNumber = (selected: number): void => {
    if (kuralData?.kural.some((item) => item.Number === selected)) {
      setKuralNumber(selected);
    }
  };

  const isFavourite = (kuralNumber: number): boolean =>
    favouriteKurals.includes(kuralNumber);

  const toggleFavourite = (kuralNumber: number): void => {
    const next = favouriteKurals.includes(kuralNumber)
      ? favouriteKurals.filter((num) => num !== kuralNumber)
      : [...favouriteKurals, kuralNumber];
    const sorted = next.sort((a, b) => a - b);

    setFavouriteKurals(sorted);
    favouriteKuralsItem.setValue(sorted).catch((error: unknown) => {
      console.error("Error saving favourite kurals:", error);
    });
  };

  return (
    <KuralContext.Provider
      value={{
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
      }}
    >
      {children}
    </KuralContext.Provider>
  );
};

export const useKural = (): KuralContextType => {
  const context = useContext(KuralContext);
  if (context === undefined) {
    throw new Error("useKural must be used within a KuralProvider");
  }
  return context;
};
