import { state } from './state.js';
import { setInventory, setTotalCasesOpened, clearInventoryState } from './state.js';
import { safeLocalStorage } from './helpers.js';
import { INVENTORY_STORAGE_KEY, CASE_COUNT_STORAGE_KEY } from './constants.js';
import { renderInventoryGrid, updateCounterDisplay, updateSaveStatus } from './ui.js';

// --- Constants ---
const API_BASE = '/api'; // Base path for Vercel serverless functions

// --- API Calls for Data ---

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
             // Include auth token if available - REQUIRED for user-specific data
            ...(state.authToken && { 'Authorization': `Bearer ${state.authToken}` }),
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        // Add a timestamp to prevent caching issues, especially for GET requests
        const url = `${API_BASE}${endpoint}?t=${Date.now()}`;
        const response = await fetch(url, options);

        // Handle cases where the response might be empty (e.g., successful save with 204 No Content)
        if (response.status === 204) {
            return null; // Or return an indication of success
        }

        const data = await response.json(); // Assume backend returns JSON for errors or data

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data; // Contains success data (e.g., inventory, case count)
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error);
        throw error;
    }
}


// --- Data Loading ---

/** Loads inventory and case count, either from API (if logged in) or localStorage. */
export async function loadData() {
    console.log(`Loading data. Auth state: ${state.isAuthenticated}`);
    if (state.isAuthenticated && state.authToken) {
        console.log("Attempting to load data from API...");
        try {
            // Fetch data from the backend API
            const data = await apiRequest('/data/load', 'GET');
            console.log("API Data received:", data);
            // Ensure data structure is valid before setting state
            setInventory(Array.isArray(data?.inventory) ? data.inventory : []);
            setTotalCasesOpened(Number.isInteger(data?.totalCasesOpened) ? data.totalCasesOpened : 0);
            console.log("State updated from API data.");
        } catch (error) {
            console.error("Failed to load data from API:", error);
            alert("Could not load your saved data from the server. Using local storage.");
            // Fallback to local storage if API fails
            loadDataFromLocalStorage();
        }
    } else {
        console.log("Loading data from localStorage.");
        // Load from local storage if not logged in
        loadDataFromLocalStorage();
    }
    // Update UI regardless of source
    renderInventoryGrid();
    updateCounterDisplay();
    updateSaveStatus(); // Update the save status indicator
}

function loadDataFromLocalStorage() {
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
}

// --- Data Saving ---

/** Saves inventory and case count, either via API (if logged in) or to localStorage. */
export async function saveData() {
    // Prevent saving if opening until is active (to avoid spamming saves)
    // Allow saving during normal open/quick open as those update state less frequently
    if (state.isOpeningUntil) {
        // console.log("Save skipped: Open Until is active.");
        return;
    }

    if (state.isAuthenticated && state.authToken) {
        console.log("Attempting to save data via API...");
        try {
            const payload = {
                inventory: state.inventory,
                totalCasesOpened: state.totalCasesOpened,
            };
            await apiRequest('/data/save', 'POST', payload);
            console.log("Data saved via API successfully.");
            updateSaveStatus(); // Update indicator
        } catch (error) {
            console.error("Failed to save data via API:", error);
            alert("Could not save progress to the server. Changes might be lost.");
            // Optionally fallback to local storage? Or just notify user.
            updateSaveStatus(true); // Indicate save error
        }
    } else {
        // console.log("Saving data to localStorage.");
        // Save to local storage if not logged in
        saveDataToLocalStorage();
        updateSaveStatus(); // Update indicator
    }
}

function saveDataToLocalStorage() {
    // Save Inventory
    try {
        const inventoryJson = JSON.stringify(state.inventory);
        safeLocalStorage('setItem', INVENTORY_STORAGE_KEY, inventoryJson);
    } catch (e) {
        console.error("Failed to stringify or save inventory to localStorage:", e);
    }
    // Save Case Count
    safeLocalStorage('setItem', CASE_COUNT_STORAGE_KEY, state.totalCasesOpened.toString());
}


// --- Specific Data Actions (modified to use saveData) ---

/** Adds an item and triggers a save */
export function addItemToInventoryAndSave(item) {
    const inventoryItem = { ...item, id: Date.now() + Math.random(), timestamp: Date.now() };
    state.inventory.unshift(inventoryItem); // Add to state first
    renderInventoryGrid(); // Update UI immediately
    saveData(); // Then trigger save (API or local)
}

/** Increments counter and triggers a save */
export function incrementCaseCounterAndSave() {
    state.totalCasesOpened++;
    updateCounterDisplay();
    saveData();
}

/** Clears inventory and triggers a save */
export function clearInventoryAndSave() {
     if (confirm("Are you sure you want to clear your entire inventory? This cannot be undone.")) {
        clearInventoryState(); // Update state
        renderInventoryGrid(); // Update UI
        hideResultDisplay(); // Hide any displayed item
        saveData(); // Trigger save (API or local)
    }
}
