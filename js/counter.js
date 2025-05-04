import { CASE_COUNT_STORAGE_KEY } from './constants.js';
import { state, setTotalCasesOpened, incrementTotalCasesOpened } from './state.js';
import { safeLocalStorage } from './helpers.js';
import { updateCounterDisplay } from './ui.js'; // Import UI update function

/** Saves the total case count to localStorage. */
function saveTotalCases() {
    safeLocalStorage('setItem', CASE_COUNT_STORAGE_KEY, state.totalCasesOpened.toString());
}

/** Loads the total case count from localStorage. */
export function loadTotalCases() {
    const storedCount = safeLocalStorage('getItem', CASE_COUNT_STORAGE_KEY);
    let count = storedCount ? parseInt(storedCount, 10) : 0;

    if (isNaN(count)) {
        console.warn("Invalid case count found in localStorage, resetting to 0.");
        count = 0;
    }
    setTotalCasesOpened(count); // Update state
    updateCounterDisplay(); // Update the display
}

/** Increments the total case counter and updates display/storage. */
export function incrementCaseCounter() {
    incrementTotalCasesOpened(); // Update state
    updateCounterDisplay();      // Update UI
    saveTotalCases();            // Persist state
}
