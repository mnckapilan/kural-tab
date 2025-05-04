// content.ts - Main entry point that orchestrates the application

import { ELEMENT_IDS, AppPage } from './models';
import { addEventListenerById, getElement } from './domUtils';
import { KuralService } from './kuralService';
import { ThemeManager } from './themeManager';
import { KuralRenderer } from './kuralRenderer';

// Current app state
let currentPage: AppPage = AppPage.RANDOM;

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
    await KuralRenderer.renderKural(kural, kuralMetadata);

  } catch (error) {
    // Handle errors using our renderer
    KuralRenderer.renderError(error);
  }
}

/**
 * Shows the starred Thirukkurals page
 */
async function showStarredPage(): Promise<void> {
  const randomContainer = document.querySelector('.quote-container');
  const starredContainer = getElement(ELEMENT_IDS.STARRED_CONTAINER);

  if (!randomContainer || !starredContainer) {
    console.error("Required containers not found");
    return;
  }

  // Hide random kural view, show starred view
  randomContainer.classList.add('hidden');
  starredContainer.classList.remove('hidden');

  // Render the starred list
  await KuralRenderer.renderStarredList(starredContainer);

  // Update current page
  currentPage = AppPage.STARRED;
}

/**
 * Shows the random Thirukkural page
 */
function showRandomPage(): void {
  const randomContainer = document.querySelector('.quote-container');
  const starredContainer = getElement(ELEMENT_IDS.STARRED_CONTAINER);

  if (!randomContainer || !starredContainer) {
    console.error("Required containers not found");
    return;
  }

  // Show random kural view, hide starred view
  randomContainer.classList.remove('hidden');
  starredContainer.classList.add('hidden');

  // Update current page
  currentPage = AppPage.RANDOM;

  // Get a new random kural
  setKural();
}

/**
 * Initialize the application when the DOM is ready
 */
function initializeApp(): void {
  ThemeManager.setInitialTheme();

  // Set up the containers if not already present
  setupContainers();

  // Start with the random page
  showRandomPage();
}

/**
 * Set up containers for the different views
 */
function setupContainers(): void {
  // Add back button to starred container if not exists
  const starredContainer = getElement(ELEMENT_IDS.STARRED_CONTAINER);
  if (starredContainer && !getElement(ELEMENT_IDS.BACK_TO_RANDOM)) {
    const backButton = document.createElement('button');
    backButton.id = ELEMENT_IDS.BACK_TO_RANDOM;
    backButton.className = 'back-button';
    backButton.innerText = '← Back to Random Thirukkural';
    backButton.addEventListener('click', showRandomPage);

    // Insert at the beginning of the container
    if (starredContainer.firstChild) {
      starredContainer.insertBefore(backButton, starredContainer.firstChild);
    } else {
      starredContainer.appendChild(backButton);
    }
  }

  // Add star button to quote container if not exists
  const quoteContainer = document.querySelector('.quote-container');
  if (quoteContainer && !getElement(ELEMENT_IDS.STAR_BUTTON)) {
    const starButton = document.createElement('div');
    starButton.id = ELEMENT_IDS.STAR_BUTTON;
    starButton.className = 'star-button-container';
    quoteContainer.appendChild(starButton);
  }

  // Add link to starred page if not exists
  if (!getElement(ELEMENT_IDS.STARRED_PAGE_LINK)) {
    const starredLink = document.createElement('div');
    starredLink.id = ELEMENT_IDS.STARRED_PAGE_LINK;
    starredLink.className = 'starred-link-container';
    starredLink.innerHTML = '<button class="starred-link">View Starred Thirukkurals</button>';
    document.body.appendChild(starredLink);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  // Theme toggle
  addEventListenerById(ELEMENT_IDS.MODE_SWITCH, "change", () => {
    ThemeManager.toggleTheme();
  });

  // View starred page
  document.addEventListener('click', (e) => {
    const target = e.target as Element;
    if (target.closest('.starred-link')) {
      showStarredPage();
    }
  });

  // Initialize on DOM load
  document.addEventListener("DOMContentLoaded", initializeApp);
}

// Initialize event listeners
setupEventListeners();
