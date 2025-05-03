// kuralRenderer.ts - Handles rendering and UI updates for Kural content

import { Kural, KuralMetadataResult, ELEMENT_IDS, ElementId } from './models';
import { DOMOperationError, getElement, setElementContent, setStyles } from './domUtils';

/**
 * Interface for UI elements needed for rendering
 */
interface UIElements {
    kuralElement: HTMLElement | null;
    explanationElement: HTMLElement | null;
    mvElement: HTMLElement | null;
    numberElement: HTMLElement | null;
    metadataElement: HTMLElement | null;
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
    public static renderKural(kural: Kural, metadata: KuralMetadataResult | null): void {
        try {
            const elements = this.getUIElements();

            if (!this.validateUIElements(elements)) {
                throw new DOMOperationError("Required UI elements not found in the document");
            }

            const { kuralElement, explanationElement, mvElement, numberElement, metadataElement } = elements;

            // Render Kural text (we've validated they exist above)
            this.renderKuralText(kuralElement!, kural);

            // Render explanation and meaning
            setElementContent(explanationElement, kural.explanation);
            setElementContent(mvElement, kural.mv);

            // Render number and metadata
            setElementContent(numberElement, `${kural.number}`);
            this.renderMetadata(metadataElement!, metadata);

            // Adjust layout
            this.adjustLayout(kuralElement!, explanationElement!, mvElement!);
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