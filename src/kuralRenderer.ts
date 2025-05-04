// kuralRenderer.ts - Handles rendering and UI updates for Kural content

import { Kural, KuralMetadataResult, ELEMENT_IDS, ElementId, StarredKural } from './models';
import { DOMOperationError, getElement, setElementContent, setStyles } from './domUtils';
import { StarService } from './starService';

/**
 * Interface for UI elements needed for rendering
 */
interface UIElements {
    kuralElement: HTMLElement | null;
    explanationElement: HTMLElement | null;
    mvElement: HTMLElement | null;
    numberElement: HTMLElement | null;
    metadataElement: HTMLElement | null;
    starButtonElement: HTMLElement | null;
}

/**
 * Responsible for rendering Kural content to the DOM
 */
export class KuralRenderer {
    /**
     * Get all UI elements needed for rendering
     * @returns Object containing references to DOM elements or null if not found
     */
    public static getUIElements(): UIElements {
        return {
            kuralElement: getElement(ELEMENT_IDS.KURAL),
            explanationElement: getElement(ELEMENT_IDS.EXPLANATION),
            mvElement: getElement(ELEMENT_IDS.MV),
            numberElement: getElement(ELEMENT_IDS.NUMBER),
            metadataElement: getElement(ELEMENT_IDS.METADATA),
            starButtonElement: getElement(ELEMENT_IDS.STAR_BUTTON),
        };
    }

    /**
     * Validate that all required UI elements exist
     * @param elements - The UI elements to validate
     * @returns True if all elements exist, false otherwise
     */
    public static validateUIElements(elements: UIElements): boolean {
        return Object.values(elements).every(element => element !== null);
    }

    /**
     * Render a Kural and its metadata to the UI
     * @param kural - The Kural to render
     * @param metadata - The Kural metadata
     * @throws DOMOperationError if rendering fails
     */
    public static async renderKural(kural: Kural, metadata: KuralMetadataResult | null): Promise<void> {
        try {
            const elements = this.getUIElements();

            // Don't require star button for backwards compatibility
            const requiredElements = { ...elements };
            delete requiredElements.starButtonElement;

            if (!Object.values(requiredElements).every(el => el !== null)) {
                throw new DOMOperationError("Required UI elements not found in the document");
            }

            const { kuralElement, explanationElement, mvElement, numberElement, metadataElement, starButtonElement } = elements;

            // Render Kural text
            this.renderKuralText(kuralElement!, kural);

            // Render explanation and meaning
            setElementContent(explanationElement!, kural.explanation);
            setElementContent(mvElement!, kural.mv);

            // Render number and metadata
            setElementContent(numberElement!, `${kural.number}`);
            this.renderMetadata(metadataElement!, metadata);

            // Render star button if it exists
            if (starButtonElement) {
                await this.renderStarButton(starButtonElement, kural, metadata);
            }

            // Adjust layout
            await this.adjustLayout(kuralElement!, explanationElement!, mvElement!);
        } catch (error) {
            console.error("Failed to render Kural:", error);
            this.renderError(error);

            if (!(error instanceof DOMOperationError)) {
                throw new DOMOperationError(
                    "Failed to render Kural content",
                    error instanceof Error ? error.message : undefined
                );
            }
            throw error;
        }
    }

    /**
     * Renders the Kural text with proper line breaks
     * @param element - The element to render into
     * @param kural - The Kural to render
     */
    private static renderKuralText(element: HTMLElement, kural: Kural): void {
        setElementContent(element, `<div>${kural.line1}</div><div>${kural.line2}</div>`);
    }

    /**
     * Renders the metadata with link
     * @param element - The element to render into
     * @param metadata - The metadata to render
     */
    private static renderMetadata(element: HTMLElement, metadata: KuralMetadataResult | null): void {
        if (!metadata) {
            setElementContent(element, '');
            return;
        }

        const metadataHtml = `
      <a href="https://thirukkural.gokulnath.com/#/thirukkuralchapters/${metadata.chapter.number}/thirukkurals" 
         target="_blank" 
         class="metadata-tree"
         rel="noopener noreferrer">
        <div class="section">${metadata.section.tamil} – ${metadata.section.name}</div>
        <div class="chapter">${metadata.chapter.tamil} – ${metadata.chapter.name}</div>
      </a>
    `;

        setElementContent(element, metadataHtml);
    }

    /**
     * Adjusts the layout to ensure proper alignment and widths
     * @param kuralElement - The kural element
     * @param explanationElement - The explanation element
     * @param mvElement - The MV element
     * @returns A promise that resolves when layout adjustments are complete
     */
    private static adjustLayout(
        kuralElement: HTMLElement,
        explanationElement: HTMLElement,
        mvElement: HTMLElement
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            // Use requestAnimationFrame for layout operations to ensure DOM is ready
            requestAnimationFrame(() => {
                try {
                    const kuralLines = kuralElement.getElementsByTagName("div");

                    if (kuralLines.length >= 2) {
                        // Using Math.max with a spread operator for cleaner code
                        const widths = Array.from(kuralLines).map(line => line.offsetWidth);
                        const maxWidth = Math.max(...widths);

                        if (maxWidth > 0) {
                            setStyles(explanationElement, { width: `${maxWidth}px` });
                            setStyles(mvElement, { width: `${maxWidth}px` });
                        }
                    }

                    resolve();
                } catch (error) {
                    console.warn("Layout adjustment failed:", error);
                    resolve(); // Resolve anyway to not block the flow
                }
            });
        });
    }

    /**
     * Renders the star button with appropriate state
     * @param element - The element to render into
     * @param kural - The Kural to render star for
     * @param metadata - The Kural's metadata
     */
    private static async renderStarButton(
        element: HTMLElement,
        kural: Kural,
        metadata: KuralMetadataResult | null
    ): Promise<void> {
        const isStarred = await StarService.isStarred(kural.number);
        const starClass = isStarred ? 'starred' : 'not-starred';
        const starText = isStarred ? '★' : '☆';
        const ariaLabel = isStarred ? 'Unstar this Thirukkural' : 'Star this Thirukkural';

        const html = `<button class="star-button ${starClass}" aria-label="${ariaLabel}" data-kural-number="${kural.number}">${starText}</button>`;
        setElementContent(element, html);

        // Add event listener to the button
        const button = element.querySelector('button');
        if (button) {
            button.addEventListener('click', async () => {
                const isNowStarred = await StarService.toggleStarKural(kural, metadata);
                button.textContent = isNowStarred ? '★' : '☆';
                button.className = `star-button ${isNowStarred ? 'starred' : 'not-starred'}`;
                button.setAttribute('aria-label', isNowStarred ? 'Unstar this Thirukkural' : 'Star this Thirukkural');
            });
        }
    }

    /**x
     * Renders a list of starred Kurals
     * @param container - The container element to render into
     */
    public static async renderStarredList(container: HTMLElement): Promise<void> {
        try {
            const starredKurals = await StarService.getStarredKurals();

            if (starredKurals.length === 0) {
                setElementContent(container, `
                    <div class="empty-state">
                        <p>You haven't starred any Thirukkurals yet.</p>
                        <p>To star a Thirukkural, click the ☆ icon when viewing a Thirukkural on the main page.</p>
                    </div>
                `);
                return;
            }

            // Sort starred kurals by most recently starred first
            const sortedKurals = [...starredKurals].sort((a, b) => b.starredAt - a.starredAt);

            let html = '<ul class="starred-list">';

            for (const starred of sortedKurals) {
                const { kural, metadata } = starred;
                const metadataText = metadata ?
                    `${metadata.chapter.tamil} - ${metadata.chapter.name}` :
                    'No metadata available';

                html += `
                <li class="starred-item" data-kural-number="${kural.number}">
                    <div class="starred-header">
                        <span class="kural-number">#${kural.number}</span>
                        <span class="metadata-brief">${metadataText}</span>
                        <button class="unstar-button" aria-label="Unstar this Thirukkural" data-kural-number="${kural.number}">★</button>
                    </div>
                    <div class="starred-content">
                        <div class="kural-text">
                            <div>${kural.line1}</div>
                            <div>${kural.line2}</div>
                        </div>
                        <div class="kural-explanation">${kural.explanation}</div>
                        <div class="kural-mv">${kural.mv}</div>
                    </div>
                </li>`;
            }

            html += '</ul>';
            setElementContent(container, html);

            // Add event listeners to unstar buttons
            const unstarButtons = container.querySelectorAll('.unstar-button');
            unstarButtons.forEach(button => {
                if (button instanceof HTMLElement) {
                    const kuralNumber = parseInt(button.dataset.kuralNumber || '0', 10);
                    if (kuralNumber) {
                        button.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            await StarService.unstarKural(kuralNumber);
                            // Re-render the list
                            this.renderStarredList(container);
                        });
                    }
                }
            });
        } catch (error) {
            console.error("Failed to render starred list:", error);
            setElementContent(container, `
                <div class="error-state">
                    <p>Failed to load starred Thirukkurals.</p>
                    <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
            `);
        }
    }

    /**
     * Renders an error state when something goes wrong
     * @param error - The error that occurred
     */
    public static renderError(error: unknown): void {
        try {
            const elements = this.getUIElements();
            let errorMessage = "An unknown error occurred";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error !== null && error !== undefined && typeof error === 'object') {
                errorMessage = JSON.stringify(error);
            }

            console.error("Error loading Thirukkural:", error);

            // Set content even if elements are null (with null checks)
            if (elements.kuralElement) {
                setElementContent(elements.kuralElement, "Failed to load Thirukkural");
            }
            if (elements.explanationElement) {
                setElementContent(elements.explanationElement, `Error: ${errorMessage}`);
            }
            if (elements.mvElement) {
                setElementContent(elements.mvElement, "");
            }
            if (elements.numberElement) {
                setElementContent(elements.numberElement, "");
            }
            if (elements.metadataElement) {
                setElementContent(elements.metadataElement, "");
            }
        } catch (secondaryError) {
            // If rendering the error itself fails, log to console as last resort
            console.error("Failed to render error state:", secondaryError, "Original error:", error);
        }
    }
}