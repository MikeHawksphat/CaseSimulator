// --- Main Entry Point ---
import * as dom from './dom.js';
import { state, loadSettings, saveSettings, setSetting, incrementInventoryPage, decrementInventoryPage, setInventoryPage } from './state.js';
// Import specific functions from dataManager
import { loadData, clearInventoryAndSave, resetAllData } from './dataManager.js';
import { openCase, generateRollerItems } from './caseOpener.js';
import { runMultiOpen, handleQuickOpen } from './animation.js';
import { startOpenUntil, stopOpenUntil } from './openUntil.js';
// Import specific UI functions
import {
    showPage,
    populateRoller,
    hideResultDisplay, // Now clears the result list
    renderInventoryGrid,
    populateTargetItemSelect,
    updateAccordionARIA,
    updateSaveStatus,
    updateCounterDisplay,
    applySettingsToUI,
    setupMultiRollers,
    hideItemPopup // Import function to hide item popup
} from './ui.js';

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

    // --- Case Opening Page ---
    dom.openCaseButton?.addEventListener('click', () => {
        if (!state.isOpening && !state.isOpeningUntil) {
             const count = parseInt(dom.multiOpenCountInput?.value || '1', 10);
             runMultiOpen(count, openCase);
        } else {
            console.log("Open Case button blocked: Already opening.");
        }
    });
    dom.quickOpenButton?.addEventListener('click', () => {
        if (!state.isOpening && !state.isOpeningUntil) {
             const count = parseInt(dom.multiOpenCountInput?.value || '1', 10);
             handleQuickOpen(count, openCase);
        } else {
             console.log("Quick Open button blocked: Already opening.");
        }
    });
    // Removed listener for clearResultAreaButton

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
    const inventoryFilters = [
        dom.filterNameInput, dom.rarityFilter, dom.wearFilter,
        dom.statTrakFilter, dom.sortOrder
    ];
    inventoryFilters.forEach(filter => {
        if (filter) {
            const eventType = (filter.type === 'text') ? 'input' : 'change';
            // Reset to page 1 when filters change
            filter.addEventListener(eventType, () => {
                setInventoryPage(1); // Go back to first page on filter change
                renderInventoryGrid();
            });
        }
    });
    dom.clearInventoryButton?.addEventListener('click', clearInventoryAndSave);

    // --- Inventory Pagination ---
    dom.prevPageButton?.addEventListener('click', () => {
        decrementInventoryPage();
        renderInventoryGrid();
    });
    dom.nextPageButton?.addEventListener('click', () => {
        incrementInventoryPage();
        renderInventoryGrid();
    });

     // --- Item Popup Modal ---
     dom.closeItemPopupButton?.addEventListener('click', hideItemPopup);
     dom.itemPopupBackdrop?.addEventListener('click', (event) => {
        // Close if backdrop itself is clicked, not the card inside
        if (event.target === dom.itemPopupBackdrop) {
            hideItemPopup();
        }
     });
     // Close item popup on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !dom.itemPopupBackdrop?.classList.contains('hidden')) {
            hideItemPopup();
        }
    });


    // --- Settings Page ---
    dom.settingAnimationToggle?.addEventListener('change', (event) => {
        setSetting('playAnimation', event.target.checked);
        saveSettings();
    });
     dom.settingDefaultOpenSpeed?.addEventListener('input', (event) => {
         const speed = parseInt(event.target.value, 10);
         if (dom.settingSpeedValueSpan) dom.settingSpeedValueSpan.textContent = speed;
         if (dom.openSpeedSlider) dom.openSpeedSlider.value = speed;
         if (dom.speedValueSpan) dom.speedValueSpan.textContent = speed;
    });
     dom.settingDefaultOpenSpeed?.addEventListener('change', (event) => {
         const speed = parseInt(event.target.value, 10);
         setSetting('defaultOpenSpeed', speed);
         saveSettings();
     });
    dom.resetAllDataButton?.addEventListener('click', resetAllData);
}

// --- Initialization ---
function initializeApp() {
    console.log("Initializing Case Simulator (Layout v2)...");

    // 1. Load Settings first
    loadSettings();

    // 2. Load initial data from localStorage
    loadData(); // Handles UI updates for counter and inventory grid

    // 3. Apply loaded settings to the UI
    applySettingsToUI();

    // 4. Initial UI setup
    setupMultiRollers(1); // Setup initial single roller structure
    populateRoller(generateRollerItems(20), 0); // Populate the initial roller
    populateTargetItemSelect();
    hideResultDisplay(); // Clear result list initially
    hideItemPopup(); // Ensure item popup is hidden

    // 5. Set initial page view and ARIA states
    showPage('page-case-opening');
    updateAccordionARIA();
    updateSaveStatus();

    // 6. Setup all event listeners
    setupEventListeners();

    console.log("Initialization complete.");
}

// --- Run ---
document.addEventListener('DOMContentLoaded', initializeApp);
