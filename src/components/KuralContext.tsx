import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  Kural,
  KuralData,
  KuralMetadataResult,
  MetadataSection,
} from "../models";
import { KuralService } from "../kuralService";

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
  const [metadataData, setMetadataData] = useState<MetadataSection[] | null>(
    null
  );
  const [favouriteKurals, setFavouriteKurals] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavouriteKurals = async (): Promise<void> => {
      try {
        if (
          typeof window !== "undefined" &&
          window.chrome &&
          window.chrome.storage &&
          window.chrome.storage.sync
        ) {
          const data = await window.chrome.storage.sync.get("favouriteKurals");
          const stored = Array.isArray(data.favouriteKurals)
            ? data.favouriteKurals
            : [];
          setFavouriteKurals(stored);
        }
      } catch (error: unknown) {
        console.error("Error retrieving favourite kurals from storage:", error);
      }
    };

    loadFavouriteKurals();
  }, []);

  const fetchKural = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      let currentKuralData = kuralData;
      let currentMetadataData = metadataData;

      if (!currentKuralData || !currentMetadataData) {
        const fetched = await KuralService.fetchKuralData();
        currentKuralData = fetched.kuralData;
        currentMetadataData = fetched.metadataData;
        setKuralData(currentKuralData);
        setMetadataData(currentMetadataData);
      }

      const randomKural = KuralService.getRandomKural(currentKuralData);

      const kuralMetadata = KuralService.findKuralMetadata(
        currentMetadataData[0],
        randomKural.Number
      );

      setKural(randomKural);
      setMetadata(kuralMetadata);
    } catch (err) {
      console.error("Error loading Thirukkural:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load Thirukkural"
      );
      setKural(null);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a kural when the component mounts
  useEffect(() => {
    fetchKural();
  }, []);

  const refreshKural = (): void => {
    fetchKural();
  };

  const selectKuralByNumber = (kuralNumber: number): void => {
    if (!kuralData || !metadataData) return;
    const selected = kuralData.kural.find(
      (item) => item.Number === kuralNumber
    );
    if (!selected) return;

    const selectedMetadata = KuralService.findKuralMetadata(
      metadataData[0],
      selected.Number
    );
    setKural(selected);
    setMetadata(selectedMetadata);
  };

  const isFavourite = (kuralNumber: number): boolean =>
    favouriteKurals.includes(kuralNumber);

  const toggleFavourite = (kuralNumber: number): void => {
    setFavouriteKurals((prev) => {
      const next = prev.includes(kuralNumber)
        ? prev.filter((num) => num !== kuralNumber)
        : [...prev, kuralNumber];
      const sorted = next.slice().sort((a, b) => a - b);

      if (
        typeof window !== "undefined" &&
        window.chrome &&
        window.chrome.storage &&
        window.chrome.storage.sync
      ) {
        window.chrome.storage.sync
          .set({ favouriteKurals: sorted })
          .catch((error: unknown) => {
            console.error("Error saving favourite kurals:", error);
          });
      }

      return sorted;
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
