// --- Global State ---

// Using objects allows passing by reference if needed, though primitives are fine here
export const state = {
    inventory: [], // Holds the current session's inventory items
    totalCasesOpened: 0, // Tracks the total number of cases opened
    isOpening: false, // Flag for single open animation/action
    isOpeningUntil: false, // Flag for automated opening
    openUntilIntervalId: null, // ID for the 'Open Until' interval timer
    openUntilCount: 0, // Counter for the current "Open Until" session
    lastStatusUpdate: 0, // Timestamp for throttling status updates
};

// --- State Modifiers ---

// Inventory
export function setInventory(newInventory) {
    state.inventory = newInventory;
}
export function addToInventoryState(item) {
    // Add a unique ID and timestamp for sorting and identification
    const inventoryItem = {
        ...item,
        id: Date.now() + Math.random(), // Simple unique ID
        timestamp: Date.now() // For 'newest' sorting
    };
    state.inventory.unshift(inventoryItem); // Add to beginning
}
export function clearInventoryState() {
    state.inventory = [];
}

// Case Counter
export function setTotalCasesOpened(count) {
    state.totalCasesOpened = count;
}
export function incrementTotalCasesOpened() {
    state.totalCasesOpened++;
}

// Flags and Timers
export function setIsOpening(value) {
    state.isOpening = value;
}
export function setIsOpeningUntil(value) {
    state.isOpeningUntil = value;
}
export function setOpenUntilIntervalId(id) {
    state.openUntilIntervalId = id;
}
export function clearOpenUntilIntervalId() {
    if (state.openUntilIntervalId) {
        clearInterval(state.openUntilIntervalId);
    }
    state.openUntilIntervalId = null;
}

// Open Until Session State
export function resetOpenUntilSession() {
    state.openUntilCount = 0;
    state.lastStatusUpdate = Date.now();
}
export function incrementOpenUntilCount() {
    state.openUntilCount++;
}
export function updateLastStatusTimestamp() {
    state.lastStatusUpdate = Date.now();
}
