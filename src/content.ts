// content.ts - Main entry point that orchestrates the application

import { ELEMENT_IDS } from './models';
import { addEventListenerById } from './domUtils';
import { KuralService } from './kuralService';
import { ThemeManager } from './themeManager';
import { KuralRenderer } from './kuralRenderer';

/**
 * Initializes and sets up the Thirukkural display
 */
async function setKural(): Promise<void> {
  try {
    // Fetch the data using the service
    const { kuralData, metadataData } = await KuralService.fetchKuralData();

    // Get random kural
    const kural = KuralService.getRandomKural(kuralData);

    // Find metadata
    const kuralMetadata = KuralService.findKuralMetadata(metadataData[0], kural.number);

    // Render the kural using our renderer
    KuralRenderer.renderKural(kural, kuralMetadata);

  } catch (error) {
    // Handle errors using our renderer
    KuralRenderer.renderError(error);
  }
}

/**
 * Initialize the application when the DOM is ready
 */
function initializeApp(): void {
  ThemeManager.setInitialTheme();
  setKural();
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  addEventListenerById(ELEMENT_IDS.MODE_SWITCH, "change", () => {
    ThemeManager.toggleTheme();
  });

  document.addEventListener("DOMContentLoaded", initializeApp);
}

// Initialize event listeners
setupEventListeners();
