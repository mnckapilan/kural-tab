// kuralService.ts - Service for fetching and processing Kural data

import {
    Kural,
    KuralData,
    MetadataSection,
    KuralMetadataResult,
    FILE_PATHS
} from './models';

/**
 * Custom error for Kural data operations
 */
export class KuralDataError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'KuralDataError';

        // Maintain proper stack trace in Node.js environments
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, KuralDataError);
        }
    }
}

/**
 * Service class for handling Kural data operations
 */
export class KuralService {
    /**
     * Fetches both Kural data and metadata
     * @returns Promise with kural data and metadata
     * @throws KuralDataError if fetch or data processing fails
     */
    public static async fetchKuralData(): Promise<{
        kuralData: KuralData;
        metadataData: ReadonlyArray<MetadataSection>;
    }> {
        try {
            const [kuralResponse, metadataResponse] = await Promise.all([
                fetch(FILE_PATHS.KURAL_DATA),
                fetch(FILE_PATHS.METADATA),
            ]);

            if (!kuralResponse.ok) {
                throw new Error(`Failed to fetch Kural data: ${kuralResponse.status}`);
            }

            if (!metadataResponse.ok) {
                throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`);
            }

            const kuralData: KuralData = await kuralResponse.json();
            const metadataData: MetadataSection[] = await metadataResponse.json();

            if (!kuralData?.kural?.length) {
                throw new Error("Invalid or empty Kural data received");
            }

            if (!metadataData?.length) {
                throw new Error("Invalid or empty metadata received");
            }

            return { kuralData, metadataData };
        } catch (error) {
            const message = error instanceof Error
                ? `Error fetching Kural data: ${error.message}`
                : 'Unknown error fetching Kural data';

            console.error(message, error);
            throw new KuralDataError(message, error);
        }
    }

    /**
     * Selects a random Kural from the data
     * @param kuralData The full kural dataset
     * @returns A randomly selected kural
     */
    public static getRandomKural(kuralData: KuralData): Kural {
        const totalKurals = kuralData.kural.length;
        const randomIndex = Math.floor(Math.random() * totalKurals);
        return kuralData.kural[randomIndex];
    }

    /**
     * Find metadata for a specific Kural number
     * @param metadata - The metadata to search in
     * @param kuralNumber - The kural number to find
     * @returns The metadata result or null if not found
     */
    public static findKuralMetadata(
        metadata: MetadataSection,
        kuralNumber: number
    ): KuralMetadataResult | null {
        if (!metadata?.section?.detail) {
            return null;
        }

        for (const section of metadata.section.detail) {
            if (!section.chapterGroup?.detail) continue;

            for (const chapterGroup of section.chapterGroup.detail) {
                if (!chapterGroup.chapters?.detail) continue;

                for (const chapter of chapterGroup.chapters.detail) {
                    if (kuralNumber >= chapter.start && kuralNumber <= chapter.end) {
                        return {
                            section: {
                                name: section.translation,
                                tamil: section.name,
                            },
                            chapter: {
                                name: chapter.translation,
                                tamil: chapter.name,
                                number: chapter.number,
                            },
                        };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Generate the metadata HTML for a kural
     * @param metadata The kural metadata
     * @returns HTML string for the metadata
     */
    public static generateMetadataHtml(metadata: KuralMetadataResult | null): string {
        if (!metadata) return '';

        return `<a href="https://thirukkural.gokulnath.com/#/thirukkuralchapters/${metadata.chapter.number}/thirukkurals" target="_blank" class="metadata-tree">
      <div class="section">${metadata.section.tamil} – ${metadata.section.name}</div>
      <div class="chapter">${metadata.chapter.tamil} – ${metadata.chapter.name}</div>
    </a>`;
    }
}