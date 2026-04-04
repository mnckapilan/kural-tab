// kuralService.ts - Service for fetching and processing Kural data

import {
    Kural,
    KuralData,
    MetadataSection,
    KuralMetadataResult,
    FILE_PATHS
} from '../types/models';

/**
 * Custom error for Kural data operations
 */
export class KuralDataError extends Error {
    public readonly cause: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'KuralDataError';
        this.cause = cause;
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

            throw new KuralDataError(message, error);
        }
    }

    /**
     * Selects a random Kural from the data
     */
    public static getRandomKural(kuralData: KuralData): Kural {
        const randomIndex = Math.floor(Math.random() * kuralData.kural.length);
        return kuralData.kural[randomIndex];
    }

    /**
     * Builds a lookup Map from kural number → metadata result.
     * Call this once after fetching data; use the map for O(1) lookups.
     */
    public static buildMetadataLookup(
        metadata: MetadataSection
    ): Map<number, KuralMetadataResult> {
        const map = new Map<number, KuralMetadataResult>();

        if (!metadata?.section?.detail) return map;

        for (const section of metadata.section.detail) {
            if (!section.chapterGroup?.detail) continue;

            for (const chapterGroup of section.chapterGroup.detail) {
                if (!chapterGroup.chapters?.detail) continue;

                for (const chapter of chapterGroup.chapters.detail) {
                    const result: KuralMetadataResult = {
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

                    for (let n = chapter.start; n <= chapter.end; n++) {
                        map.set(n, result);
                    }
                }
            }
        }

        return map;
    }
}
