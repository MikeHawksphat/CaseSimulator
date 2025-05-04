// --- Main Entry Point ---
import * as dom from './dom.js';
import { state, initializeAuthState } from './state.js'; // Import state initializer
// Import specific functions from dataManager
import { loadData, clearInventoryAndSave } from './dataManager.js';
import { openCase, generateRollerItems } from './caseOpener.js';
import { runAnimation, handleQuickOpen } from './animation.js';
import { startOpenUntil, stopOpenUntil } from './openUntil.js';
// Import specific UI functions
import {
    showPage,
    populateRoller,
    hideResultDisplay,
    renderInventoryGrid,
    populateTargetItemSelect,
    updateAccordionARIA,
    updateAuthUI, // Import auth UI updater
    updateSaveStatus // Import save status updater
} from './ui.js';
// Import auth functions
import { setupAuthEventListeners } from './auth.js';

// --- Event Listeners ---

function setupEventListeners() {
    // --- Navigation ---
    dom.navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = link.dataset.page;
            if (pageId) showPage(pageId);
            else console.error("Nav link missing data-page:", link);
        });
    });

    // --- Auth (Setup delegated to auth.js) ---
    setupAuthEventListeners();

    // --- Case Opening Page ---
    dom.openCaseButton?.addEventListener('click', () => {
        if (!state.isOpening && !state.isOpeningUntil) runAnimation(openCase());
    });
    dom.quickOpenButton?.addEventListener('click', () => {
        if (!state.isOpening && !state.isOpeningUntil) handleQuickOpen();
    });
    dom.modalBackdrop?.addEventListener('click', (event) => {
        if (event.target === dom.modalBackdrop) hideResultDisplay();
    });
    dom.closeResultButton?.addEventListener('click', hideResultDisplay);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !dom.modalBackdrop?.classList.contains('hidden')) {
            hideResultDisplay();
        }
    });

    // --- Open Until Panel ---
    dom.toggleOpenUntilButton?.addEventListener('click', () => {
        dom.openUntilPanel?.classList.toggle('hidden');
        dom.toggleOpenUntilButton?.classList.toggle('active', !dom.openUntilPanel?.classList.contains('hidden'));
    });
    dom.openSpeedSlider?.addEventListener('input', () => {
        if (dom.speedValueSpan && dom.openSpeedSlider) {
            dom.speedValueSpan.textContent = dom.openSpeedSlider.value;
        }
    });
    dom.startOpenUntilButton?.addEventListener('click', startOpenUntil);
    dom.stopOpenUntilButton?.addEventListener('click', stopOpenUntil);
    dom.accordionHeaders?.forEach(header => {
        header.addEventListener('click', () => { setTimeout(updateAccordionARIA, 0); });
    });

    // --- Inventory Page ---
    dom.rarityFilter?.addEventListener('change', renderInventoryGrid); // Re-render only
    dom.sortOrder?.addEventListener('change', renderInventoryGrid); // Re-render only
    // *** MODIFIED: Use clearInventoryAndSave from dataManager ***
    dom.clearInventoryButton?.addEventListener('click', clearInventoryAndSave);

    // --- Settings Page ---
    // Add listeners if needed
}

// --- Initialization ---
async function initializeApp() {
    console.log("Initializing Case Simulator (Auth)...");

    // 1. Initialize authentication state (check localStorage for token)
    initializeAuthState();
    updateAuthUI(); // Update UI based on initial auth state

    // 2. Load initial data (will use API if logged in, localStorage otherwise)
    await loadData(); // loadData now handles UI updates (renderInventoryGrid, updateCounterDisplay)

    // 3. Initial UI setup (that doesn't depend on loaded data)
    populateRoller(generateRollerItems(20));
    populateTargetItemSelect();
    if (dom.speedValueSpan && dom.openSpeedSlider) {
        dom.speedValueSpan.textContent = dom.openSpeedSlider.value;
    }
    hideResultDisplay(); // Ensure result modal is hidden
    if (dom.emptyInventoryMessage) { // Check initial inventory message state
        dom.emptyInventoryMessage.classList.toggle('hidden', state.inventory.length > 0);
    }

    // 4. Set initial page view and ARIA states
    showPage('page-case-opening');
    updateAccordionARIA();
    updateSaveStatus(); // Show initial save status

    // 5. Setup all event listeners
    setupEventListeners();

    console.log("Initialization complete.");
}

// --- Run ---
document.addEventListener('DOMContentLoaded', initializeApp);
