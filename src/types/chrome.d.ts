/// <reference types="chrome"/>

// Declare global Chrome object for TypeScript to recognize it in React components
declare global {
    interface Window {
        chrome: typeof chrome;
    }
}