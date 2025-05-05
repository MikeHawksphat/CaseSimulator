// Import necessary state functions, including addToInventoryState
import { state, setInventory, setTotalCasesOpened, clearInventoryState, incrementTotalCasesOpened, addToInventoryState } from './state.js'; // <-- Import addToInventoryState
import { safeLocalStorage } from './helpers.js';
import { INVENTORY_STORAGE_KEY, CASE_COUNT_STORAGE_KEY } from './constants.js';
import { renderInventoryGrid, updateCounterDisplay, updateSaveStatus, hideResultDisplay } from './ui.js';

/** Loads inventory and case count from localStorage. */
export function loadData() {
    console.log("Loading data from localStorage.");
    // Load Inventory
    const storedInventory = safeLocalStorage('getItem', INVENTORY_STORAGE_KEY);
    let loadedInventory = [];
    if (storedInventory) {
        try {
            loadedInventory = JSON.parse(storedInventory);
            if (!Array.isArray(loadedInventory)) {
                console.warn("Invalid inventory data found in localStorage, resetting.");
                loadedInventory = [];
            }
        } catch (e) {
            console.error("Failed to parse inventory from localStorage:", e);
            loadedInventory = [];
        }
    }
    setInventory(loadedInventory);

    // Load Case Count
    const storedCount = safeLocalStorage('getItem', CASE_COUNT_STORAGE_KEY);
    let count = storedCount ? parseInt(storedCount, 10) : 0;
    if (isNaN(count)) {
        console.warn("Invalid case count found in localStorage, resetting to 0.");
        count = 0;
    }
    setTotalCasesOpened(count);

    // Update UI
    renderInventoryGrid();
    updateCounterDisplay();
    updateSaveStatus(); // Update indicator to show 'localStorage'
}

/** Saves inventory and case count to localStorage. */
export function saveData() {
     // Prevent saving if opening until is active (to avoid spamming saves)
    if (state.isOpeningUntil) {
        // console.log("Save skipped: Open Until is active."); // Optional log
        return;
    }
    // console.log("Saving data to localStorage."); // Optional log
    // Save Inventory
    try {
        const inventoryJson = JSON.stringify(state.inventory);
        safeLocalStorage('setItem', INVENTORY_STORAGE_KEY, inventoryJson);
    } catch (e) {
        console.error("Failed to stringify or save inventory to localStorage:", e);
    }
    // Save Case Count
    safeLocalStorage('setItem', CASE_COUNT_STORAGE_KEY, state.totalCasesOpened.toString());
    updateSaveStatus(); // Update indicator
}


/** Adds an item and triggers a save */
export function addItemToInventoryAndSave(item) {
    // *** Use the imported function from state.js ***
    addToInventoryState(item); // Add item to state (includes generating ID/timestamp)
    // Update UI immediately
    renderInventoryGrid();
    // Then trigger save
    saveData();
}

/** Increments counter and triggers a save */
export function incrementCaseCounterAndSave() {
    // Use the imported function
    incrementTotalCasesOpened(); // Update state
    updateCounterDisplay(); // Update UI
    saveData(); // Trigger save
}

/** Clears inventory and triggers a save */
export function clearInventoryAndSave() {
     if (confirm("Are you sure you want to clear your entire inventory? This cannot be undone.")) {
        clearInventoryState(); // Update state
        renderInventoryGrid(); // Update UI
        hideResultDisplay(); // Clear the item display area
        saveData(); // Trigger save
    }
}

/** Resets all data (inventory and counter) */
export function resetAllData() {
    if (confirm("Are you sure you want to reset ALL data? This includes inventory and case count and cannot be undone.")) {
        clearInventoryState();
        setTotalCasesOpened(0); // Use the state function
        renderInventoryGrid();
        updateCounterDisplay();
        // Clear from localStorage as well
        safeLocalStorage('removeItem', INVENTORY_STORAGE_KEY);
        safeLocalStorage('removeItem', CASE_COUNT_STORAGE_KEY);
        // We don't reset settings here, but could add another function/option for that
        updateSaveStatus(); // Update status indicator
        alert("All data has been reset.");
    }
}
