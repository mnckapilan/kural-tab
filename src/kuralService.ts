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
        const randomIndex = Math.floor(Math.random() * kuralData.kural.length);
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
            console.error('Metadata section detail is missing or invalid:', metadata);
            return null;
        }

        console.log(`Finding metadata for Kural number: ${kuralNumber}`);

        // Iterate through each section (அறத்துப்பால், பொருட்பால், காமத்துப்பால்)
        for (const section of metadata.section.detail) {
            if (!section.chapterGroup?.detail) {
                console.log(`Section missing chapterGroup: ${section.name}`);
                continue;
            }

            // Iterate through each chapter group (இயல்)
            for (const chapterGroup of section.chapterGroup.detail) {
                if (!chapterGroup.chapters?.detail) {
                    console.log(`ChapterGroup missing chapters: ${chapterGroup.name}`);
                    continue;
                }

                // Iterate through each chapter (அதிகாரம்)
                for (const chapter of chapterGroup.chapters.detail) {
                    console.log(`Checking chapter: ${chapter.name} (${chapter.start}-${chapter.end})`);

                    if (kuralNumber >= chapter.start && kuralNumber <= chapter.end) {
                        console.log(`Found match! Kural ${kuralNumber} is in chapter: ${chapter.name}`);

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

        console.error(`No metadata found for Kural number: ${kuralNumber}`);
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