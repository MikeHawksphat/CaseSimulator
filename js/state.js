// --- Global State ---
export const state = {
    // User Authentication
    isAuthenticated: false,
    currentUser: null, // e.g., { email: 'user@example.com' }
    authToken: null, // Store JWT or session token

    // Existing State
    inventory: [],
    totalCasesOpened: 0,
    isOpening: false,
    isOpeningUntil: false,
    openUntilIntervalId: null,
    openUntilCount: 0,
    lastStatusUpdate: 0,
};

// --- State Modifiers ---

// Auth State
export function setAuthState(isAuthenticated, user, token) {
    state.isAuthenticated = isAuthenticated;
    state.currentUser = user; // Can be null if logging out
    state.authToken = token; // Can be null if logging out
    // Persist token (e.g., in localStorage) for session persistence
    if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user)); // Store user info too
    } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
}

// Inventory
export function setInventory(newInventory) { state.inventory = newInventory; }
export function addToInventoryState(item) {
    const inventoryItem = { ...item, id: Date.now() + Math.random(), timestamp: Date.now() };
    state.inventory.unshift(inventoryItem);
}
export function clearInventoryState() { state.inventory = []; }

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

// --- Initialization ---
// Function to check for persisted auth token on load
export function initializeAuthState() {
    const token = localStorage.getItem('authToken');
    const userString = localStorage.getItem('currentUser');
    if (token && userString) {
        try {
            const user = JSON.parse(userString);
            // TODO: Optionally verify token with backend here before setting state
            setAuthState(true, user, token);
            console.log("User session restored from localStorage.");
        } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
            setAuthState(false, null, null); // Clear invalid state
        }
    } else {
        setAuthState(false, null, null); // Ensure clean state if no token
    }
}
