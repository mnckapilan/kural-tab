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
  MetadataSection,
  KuralMetadataResult,
} from "../models";
import { KuralService } from "../kuralService";

interface KuralContextType {
  kural: Kural | null;
  metadata: KuralMetadataResult | null;
  isLoading: boolean;
  error: string | null;
  refreshKural: () => void;
}

const KuralContext = createContext<KuralContextType | undefined>(undefined);

interface KuralProviderProps {
  children: ReactNode;
}

export const KuralProvider: React.FC<KuralProviderProps> = ({ children }) => {
  const [kural, setKural] = useState<Kural | null>(null);
  const [metadata, setMetadata] = useState<KuralMetadataResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKural = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the data
      const { kuralData, metadataData } = await KuralService.fetchKuralData();

      // Get random kural
      const randomKural = KuralService.getRandomKural(kuralData);

      // Find metadata using the correct property (Number instead of number)
      const kuralMetadata = KuralService.findKuralMetadata(
        metadataData[0],
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

  return (
    <KuralContext.Provider
      value={{
        kural,
        metadata,
        isLoading,
        error,
        refreshKural,
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
