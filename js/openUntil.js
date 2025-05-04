import * as dom from './dom.js';
import { state, setIsOpeningUntil, setOpenUntilIntervalId, clearOpenUntilIntervalId, resetOpenUntilSession, incrementOpenUntilCount, updateLastStatusTimestamp } from './state.js';
import { MIN_OPEN_UNTIL_INTERVAL } from './constants.js';
import { openCase } from './caseOpener.js';
import { addItemToInventory } from './inventory.js';
import { displayResultModal, hideResultDisplay, updateOpenUntilStatus, toggleOpenUntilControls } from './ui.js';

/**
 * Checks if an opened item meets the target conditions set by the user.
 * @param {object} item - The item that was just opened.
 * @param {object} targets - An object containing the user's target criteria.
 * @returns {boolean} True if the item meets all conditions, false otherwise.
 */
function checkConditions(item, targets) {
    // 1. Check Item Name/Type
    if (targets.item !== 'any') {
        if (targets.item === 'any_knife') {
            if (!item.is_knife) return false;
        } else {
            if (item.name !== targets.item) return false;
        }
    }

    // 2. Check Wear Condition
    if (targets.wear !== 'any' && item.wearCondition !== targets.wear) {
        return false;
    }

    // 3. Check StatTrak
    if (targets.statTrak !== 'any') {
        const isTargetingStatTrak = (targets.statTrak === 'yes');
        if (item.isStatTrak !== isTargetingStatTrak) return false;
    }

    // 4. Check Paint Seed
    // targets.seed is already parsed number or null
    if (targets.seed !== null && item.paintSeed !== targets.seed) {
        return false;
    }

    // If all checks passed
    return true;
}

/** Performs a single step in the "Open Until" process. */
function performOpenUntilStep(targets) {
    if (!state.isOpeningUntil) return; // Stop if flag turned off externally

    const openedItem = openCase(); // Open one case (increments counter)
    incrementOpenUntilCount(); // Increment session counter

    if (checkConditions(openedItem, targets)) {
        // Target found!
        stopOpenUntil(); // Stop the process
        displayResultModal(openedItem); // Display the found item
        addItemToInventory(openedItem); // Add to inventory
        updateOpenUntilStatus(`Success! Found ${openedItem.isStatTrak ? 'ST™ ' : ''}${openedItem.name || 'Item'} (${openedItem.wearCondition}, P:${openedItem.paintSeed ?? 'N/A'}) after ${state.openUntilCount.toLocaleString()} cases.`, 'success');
    } else {
        // Target not found, continue running
        const now = Date.now();
        // Throttle status updates
        if (now - state.lastStatusUpdate > 100) { // Update max ~10 times/sec
            updateOpenUntilStatus(`Opening... Count: ${state.openUntilCount.toLocaleString()}`, 'running');
            updateLastStatusTimestamp();
        }
        // Optional: Add non-matching items to inventory (can impact performance)
        // addItemToInventory(openedItem);
    }
}

/** Starts the "Open Until" automated process. */
export function startOpenUntil() {
    // Prevent starting if already running or a single animation is in progress
    if (state.isOpening || state.isOpeningUntil) {
         console.log("Open Until prevented: Already opening or animating.");
         return;
    }

    // --- Get Targets from UI ---
    const targets = {
        item: dom.targetItemSelect.value,
        wear: dom.targetWearSelect.value,
        statTrak: dom.targetStatTrakSelect.value,
        seed: dom.targetSeedInput.value ? parseInt(dom.targetSeedInput.value, 10) : null
    };

    // --- Validate Seed Input ---
    if (targets.seed !== null && (isNaN(targets.seed) || targets.seed < 0 || targets.seed > 1000)) {
        updateOpenUntilStatus("Invalid Paint Seed (must be 0-1000).", "error");
        dom.targetSeedInput.focus();
        return;
    }
     // Ensure seed is strictly null if it was invalid after parsing
     if (targets.seed !== null && isNaN(targets.seed)) targets.seed = null;


    // --- Start Process ---
    const casesPerSecond = parseInt(dom.openSpeedSlider.value, 10);
    let intervalMs = Math.max(MIN_OPEN_UNTIL_INTERVAL, 1000 / casesPerSecond);

    setIsOpeningUntil(true); // Set the flag
    resetOpenUntilSession(); // Reset session counter and timestamp

    toggleOpenUntilControls(false); // Disable UI controls

    updateOpenUntilStatus(`Starting... Speed: ~${casesPerSecond} CPS`, 'running');
    hideResultDisplay(); // Hide any previous result modal

    // Start the interval timer
    const intervalId = setInterval(() => performOpenUntilStep(targets), intervalMs);
    setOpenUntilIntervalId(intervalId); // Store the interval ID in state
}

/** Stops the "Open Until" automated process. */
export function stopOpenUntil() {
    if (!state.isOpeningUntil) return; // Do nothing if not running

    clearOpenUntilIntervalId(); // Stop the interval timer and clear ID in state
    setIsOpeningUntil(false); // Reset the flag

    toggleOpenUntilControls(true); // Re-enable UI controls

    // Update status unless it was already a success message
    if (!dom.openUntilStatus?.classList.contains('success')) {
        updateOpenUntilStatus(`Stopped manually after ${state.openUntilCount.toLocaleString()} cases.`);
    }
}
