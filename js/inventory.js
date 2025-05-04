import { INVENTORY_STORAGE_KEY } from './constants.js';
import { state, setInventory, addToInventoryState, clearInventoryState } from './state.js';
import { safeLocalStorage } from './helpers.js';
import { renderInventoryGrid, hideResultDisplay } from './ui.js'; // Import UI functions

/** Saves the current inventory state to localStorage. */
function saveInventory() {
    try {
        const inventoryJson = JSON.stringify(state.inventory);
        safeLocalStorage('setItem', INVENTORY_STORAGE_KEY, inventoryJson);
    } catch (e) {
        console.error("Failed to stringify or save inventory:", e);
        alert("Error saving inventory! Your inventory might not persist.");
    }
}

/** Loads inventory from localStorage. */
export function loadInventory() {
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
            alert("Error loading inventory! Starting with an empty inventory.");
        }
    }
    setInventory(loadedInventory); // Update state
    renderInventoryGrid(); // Render the loaded inventory
}

/**
 * Adds an item to the inventory state, saves, and re-renders.
 * @param {object} item - The item object to add.
 */
export function addItemToInventory(item) {
    addToInventoryState(item); // Update state
    saveInventory();           // Persist state
    renderInventoryGrid();     // Update UI
}

/** Clears the inventory after confirmation. */
export function clearInventory() {
    if (confirm("Are you sure you want to clear your entire inventory? This cannot be undone.")) {
        clearInventoryState(); // Update state
        saveInventory();       // Persist state (save empty array)
        renderInventoryGrid(); // Update UI
        hideResultDisplay();   // Hide any displayed item when clearing
    }
}
