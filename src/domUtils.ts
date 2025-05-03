// domUtils.ts - DOM manipulation utility functions
import { ElementId } from './models';

/**
 * DOM operation error class for better error handling
 */
export class DOMOperationError extends Error {
    constructor(message: string, public readonly elementId?: string) {
        super(message);
        this.name = 'DOMOperationError';

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DOMOperationError);
        }
    }
}

/**
 * Safely get an HTML element by ID with proper type casting
 * @param id - The ID of the element to get
 * @returns The element or null if not found
 */
export function getElement<T extends HTMLElement = HTMLElement>(id: ElementId | string): T | null {
    return document.getElementById(id) as T | null;
}

/**
 * Set the inner HTML of an element safely
 * @param element - The element to update
 * @param content - The content to set
 * @throws DOMOperationError if element is provided but setting content fails
 */
export function setElementContent(element: HTMLElement | null, content: string): void {
    if (!element) return;

    try {
        element.innerHTML = content;
    } catch (error) {
        const message = error instanceof Error
            ? `Failed to set content: ${error.message}`
            : 'Failed to set element content';
        console.error(message, { element, content });
        throw new DOMOperationError(message, element.id);
    }
}

/**
 * CSS property type with proper typing
 */
export type CSSProperties = Partial<CSSStyleDeclaration>;

/**
 * Set styles on an element safely with improved typing
 * @param element - The element to style
 * @param styles - Object containing styles to apply
 * @returns True if all styles were applied successfully
 */
export function setStyles(element: HTMLElement | null, styles: Record<string, string>): boolean {
    if (!element) return false;

    let success = true;

    Object.entries(styles).forEach(([key, value]) => {
        try {
            // Use direct assignment which is safer than indexing
            (element.style as any)[key] = value;
        } catch (error) {
            success = false;
            console.warn(`Unable to set style property ${key}:`, error);
        }
    });

    return success;
}

/**
 * Add an event listener with type safety
 * @param elementId - ID of the element to add the listener to
 * @param eventType - Type of event to listen for
 * @param listener - Event listener function
 * @returns Function to remove the event listener
 */
export function addEventListenerById<K extends keyof HTMLElementEventMap>(
    elementId: ElementId | string,
    eventType: K,
    listener: (event: HTMLElementEventMap[K]) => void
): () => void {
    const element = getElement(elementId);

    if (element) {
        element.addEventListener(eventType, listener as EventListener);
        return () => element.removeEventListener(eventType, listener as EventListener);
    }

    // Return a no-op function if element not found
    return () => { };
}

/**
 * Create a new element with optional attributes and content
 * @param tagName - The tag name of the element to create
 * @param attributes - Optional attributes to set on the element
 * @param content - Optional content to set on the element
 * @returns The newly created element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes?: Record<string, string>,
    content?: string
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);

    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    if (content) {
        element.innerHTML = content;
    }

    return element;
}

/**
 * Safely append a child element to a parent element
 * @param parent - The parent element to append to
 * @param child - The child element to append
 * @returns The appended child element or null if parent not found
 */
export function appendElement<T extends HTMLElement>(
    parent: HTMLElement | null,
    child: T
): T | null {
    if (!parent) return null;

    return parent.appendChild(child);
}