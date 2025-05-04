// starService.ts - Service for managing starred Thirukkurals

import { Kural, KuralMetadataResult, StarredKural, STORAGE_KEYS } from './models';

/**
 * Service for managing starred Thirukkurals
 */
export class StarService {
    /**
     * Retrieves all starred Kurals from storage
     * @returns Promise resolving to array of starred Kurals
     */
    public static async getStarredKurals(): Promise<StarredKural[]> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(STORAGE_KEYS.STARRED_KURALS, (result) => {
                const starredKurals: StarredKural[] = result[STORAGE_KEYS.STARRED_KURALS] || [];
                resolve(starredKurals);
            });
        });
    }

    /**
     * Adds a Kural to starred list or removes it if already starred
     * @param kural - The Kural to star/unstar
     * @param metadata - The Kural's metadata
     * @returns Promise resolving to true if Kural is now starred, false if unstarred
     */
    public static async toggleStarKural(kural: Kural, metadata: KuralMetadataResult | null): Promise<boolean> {
        const starredKurals = await this.getStarredKurals();

        // Check if kural is already starred
        const existingIndex = starredKurals.findIndex(item => item.kural.number === kural.number);

        if (existingIndex >= 0) {
            // Remove from starred
            starredKurals.splice(existingIndex, 1);
            await this.saveStarredKurals(starredKurals);
            return false;
        } else {
            // Add to starred
            const starredKural: StarredKural = {
                kural,
                metadata,
                starredAt: Date.now()
            };
            starredKurals.push(starredKural);
            await this.saveStarredKurals(starredKurals);
            return true;
        }
    }

    /**
     * Checks if a Kural is starred
     * @param kuralNumber - The number of the Kural to check
     * @returns Promise resolving to true if starred, false otherwise
     */
    public static async isStarred(kuralNumber: number): Promise<boolean> {
        const starredKurals = await this.getStarredKurals();
        return starredKurals.some(item => item.kural.number === kuralNumber);
    }

    /**
     * Removes a Kural from starred list
     * @param kuralNumber - The number of the Kural to unstar
     * @returns Promise resolving when operation is complete
     */
    public static async unstarKural(kuralNumber: number): Promise<void> {
        const starredKurals = await this.getStarredKurals();
        const updatedList = starredKurals.filter(item => item.kural.number !== kuralNumber);
        await this.saveStarredKurals(updatedList);
    }

    /**
     * Saves the starred Kurals list to storage
     * @param starredKurals - The list of starred Kurals to save
     * @returns Promise resolving when save is complete
     */
    private static async saveStarredKurals(starredKurals: StarredKural[]): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set(
                { [STORAGE_KEYS.STARRED_KURALS]: starredKurals },
                () => resolve()
            );
        });
    }
}