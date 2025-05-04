// --- Main Entry Point ---
import * as dom from './dom.js';
import { state } from './state.js';
import { loadInventory, clearInventory } from './inventory.js';
import { loadTotalCases } from './counter.js';
import { openCase, generateRollerItems } from './caseOpener.js';
import { runAnimation, handleQuickOpen } from './animation.js';
import { startOpenUntil, stopOpenUntil } from './openUntil.js';
import {
    showPage, // Import the new navigation function
    populateRoller,
    hideResultDisplay,
    renderInventoryGrid,
    populateTargetItemSelect,
    updateAccordionARIA,
    updateCounterDisplay // Ensure this is imported if needed separately
} from './ui.js';

// --- Event Listeners ---

function setupEventListeners() {
    // --- Navigation ---
    dom.navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor link behavior
            const pageId = link.dataset.page;
            if (pageId) {
                showPage(pageId);
                // Update URL hash for basic history/bookmarking (optional)
                // window.location.hash = link.getAttribute('href');
            } else {
                console.error("Nav link clicked without data-page attribute:", link);
            }
        });
    });

    // --- Case Opening Page ---
    dom.openCaseButton?.addEventListener('click', () => {
        if (!state.isOpening && !state.isOpeningUntil) {
            const item = openCase();
            runAnimation(item);
        }
    });
    dom.quickOpenButton?.addEventListener('click', () => {
        if (!state.isOpening && !state.isOpeningUntil) {
            handleQuickOpen();
        }
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
        const panel = dom.openUntilPanel;
        const button = dom.toggleOpenUntilButton;
        if (!panel || !button) return;
        const isHidden = panel.classList.toggle('hidden');
        button.classList.toggle('active', !isHidden);
        // Don't manage ARIA here, let details/summary handle it
    });
    dom.openSpeedSlider?.addEventListener('input', () => {
        if (dom.speedValueSpan && dom.openSpeedSlider) {
            dom.speedValueSpan.textContent = dom.openSpeedSlider.value;
        }
    });
    dom.startOpenUntilButton?.addEventListener('click', startOpenUntil);
    dom.stopOpenUntilButton?.addEventListener('click', stopOpenUntil);
    dom.accordionHeaders?.forEach(header => {
        header.addEventListener('click', () => {
            setTimeout(updateAccordionARIA, 0);
        });
    });

    // --- Inventory Page ---
    dom.rarityFilter?.addEventListener('change', renderInventoryGrid);
    dom.sortOrder?.addEventListener('change', renderInventoryGrid);
    dom.clearInventoryButton?.addEventListener('click', clearInventory);

    // --- Settings Page ---
    // Add listeners for settings controls as needed
    // dom.themeSelect?.addEventListener('change', handleThemeChange);
}

// --- Initialization ---
function initializeApp() {
    console.log("Initializing Case Simulator (Sidebar Layout)...");

    // Load saved data
    loadInventory(); // Loads inventory state and renders grid
    loadTotalCases(); // Loads case count state and updates display

    // Initial UI setup
    populateRoller(generateRollerItems(20));
    populateTargetItemSelect();
    if (dom.speedValueSpan && dom.openSpeedSlider) {
        dom.speedValueSpan.textContent = dom.openSpeedSlider.value;
    }
    hideResultDisplay();
    if (dom.emptyInventoryMessage) {
        dom.emptyInventoryMessage.classList.toggle('hidden', state.inventory.length > 0);
    }

    // Set initial page view (e.g., case opening)
    showPage('page-case-opening'); // Show default page

    // Set initial ARIA states for accordions
    updateAccordionARIA();

    // Setup all event listeners
    setupEventListeners();

    console.log("Initialization complete.");
}

// --- Run ---
document.addEventListener('DOMContentLoaded', initializeApp);
