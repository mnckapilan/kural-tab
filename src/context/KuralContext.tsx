import React, {
  createContext,
  useState,
  useContext,
  useEffect,
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

export const KuralProvider: React.FC<KuralProviderProps> = ({ children }) => {
  const [kural, setKural] = useState<Kural | null>(null);
  const [metadata, setMetadata] = useState<KuralMetadataResult | null>(null);
  const [kuralData, setKuralData] = useState<KuralData | null>(null);
  const [metadataLookup, setMetadataLookup] = useState<Map<
    number,
    KuralMetadataResult
  > | null>(null);
  const [favouriteKurals, setFavouriteKurals] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchKural = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      let currentKuralData = kuralData;
      let currentMetadataLookup = metadataLookup;

      if (!currentKuralData || !currentMetadataLookup) {
        const fetched = await KuralService.fetchKuralData();
        currentKuralData = fetched.kuralData;
        // metadata.json is a one-element array holding the திருக்குறள் root section
        const metadataRoot = fetched.metadataData[0];
        if (!metadataRoot) {
          throw new Error("Metadata root section is missing");
        }
        currentMetadataLookup = KuralService.buildMetadataLookup(metadataRoot);
        setKuralData(currentKuralData);
        setMetadataLookup(currentMetadataLookup);
      }

      const randomKural = KuralService.getRandomKural(currentKuralData);
      setKural(randomKural);
      setMetadata(currentMetadataLookup.get(randomKural.Number) ?? null);
    } catch (err) {
      console.error("Error loading Thirukkural:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load Thirukkural",
      );
      setKural(null);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchKural();
  }, []);

  const refreshKural = (): void => {
    void fetchKural();
  };

  const selectKuralByNumber = (kuralNumber: number): void => {
    if (!kuralData || !metadataLookup) return;
    const selected = kuralData.kural.find(
      (item) => item.Number === kuralNumber,
    );
    if (!selected) return;
    setKural(selected);
    setMetadata(metadataLookup.get(kuralNumber) ?? null);
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
