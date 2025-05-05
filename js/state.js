// --- Global State ---
export const state = {
    // Settings - with defaults
    settings: {
        playAnimation: true,
        defaultOpenSpeed: 10,
    },

    // Game State
    inventory: [],
    totalCasesOpened: 0,
    isOpening: false, // Flag for ANY opening action (single, multi, quick)
    isOpeningUntil: false, // Flag for automated opening
    openUntilIntervalId: null,
    openUntilCount: 0,
    lastStatusUpdate: 0,
    // Track completion of multiple animations
    multiOpenCompleteCounter: 0,
    multiOpenTotalCount: 0,

    // Inventory Pagination
    inventoryCurrentPage: 1,
    inventoryItemsPerPage: 20, // Adjust as needed
};

// --- State Modifiers ---

// Settings
export function setSetting(key, value) {
    if (state.settings.hasOwnProperty(key)) {
        state.settings[key] = value;
        console.log(`Setting updated: ${key} = ${value}`);
    } else {
        console.warn(`Attempted to set unknown setting: ${key}`);
    }
}
export function loadSettings() {
    const storedSettings = localStorage.getItem('csgoCaseSimSettings_v1');
    if (storedSettings) {
        try {
            const parsed = JSON.parse(storedSettings);
            for (const key in state.settings) {
                if (parsed.hasOwnProperty(key)) {
                    if (typeof parsed[key] === typeof state.settings[key]) {
                        state.settings[key] = parsed[key];
                    } else {
                         console.warn(`Type mismatch for setting '${key}' in localStorage. Using default.`);
                    }
                }
            }
            console.log("Settings loaded from localStorage:", state.settings);
        } catch (e) {
            console.error("Failed to parse settings from localStorage:", e);
        }
    }
}
export function saveSettings() {
    try {
        localStorage.setItem('csgoCaseSimSettings_v1', JSON.stringify(state.settings));
        console.log("Settings saved to localStorage.");
    } catch (e) {
        console.error("Failed to save settings to localStorage:", e);
    }
}


// Inventory
export function setInventory(newInventory) { state.inventory = newInventory; }
export function addToInventoryState(item) {
    const inventoryItem = { ...item, id: Date.now() + Math.random(), timestamp: Date.now() };
    state.inventory.unshift(inventoryItem);
}
export function clearInventoryState() { state.inventory = []; state.inventoryCurrentPage = 1; } // Reset page on clear

// Case Counter
export function setTotalCasesOpened(count) { state.totalCasesOpened = count; }
export function incrementTotalCasesOpened() { state.totalCasesOpened++; }

// Flags and Timers
export function setIsOpening(value) { state.isOpening = value; }
export function setIsOpeningUntil(value) { state.isOpeningUntil = value; }
export function setOpenUntilIntervalId(id) { state.openUntilIntervalId = id; }
export function clearOpenUntilIntervalId() {
    if (state.openUntilIntervalId) clearInterval(state.openUntilIntervalId);
    state.openUntilIntervalId = null;
}

// Open Until Session State
export function resetOpenUntilSession() { state.openUntilCount = 0; state.lastStatusUpdate = Date.now(); }
export function incrementOpenUntilCount() { state.openUntilCount++; }
export function updateLastStatusTimestamp() { state.lastStatusUpdate = Date.now(); }

// Multi-Open Animation Tracking
export function resetMultiOpenCounter(total) { state.multiOpenCompleteCounter = 0; state.multiOpenTotalCount = total; }
export function incrementMultiOpenCounter() { state.multiOpenCompleteCounter++; }
export function areAllMultiOpensComplete() { if (state.multiOpenTotalCount <= 0) return true; return state.multiOpenCompleteCounter >= state.multiOpenTotalCount; }

// Pagination State
export function setInventoryPage(page) {
    state.inventoryCurrentPage = page;
}
export function incrementInventoryPage() {
    state.inventoryCurrentPage++;
}
export function decrementInventoryPage() {
    if (state.inventoryCurrentPage > 1) {
        state.inventoryCurrentPage--;
    }
}
