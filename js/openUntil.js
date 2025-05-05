import * as dom from './dom.js';
import { state, setIsOpeningUntil, setOpenUntilIntervalId, clearOpenUntilIntervalId, resetOpenUntilSession, incrementOpenUntilCount, updateLastStatusTimestamp } from './state.js';
import { MIN_OPEN_UNTIL_INTERVAL } from './constants.js';
import { openCase } from './caseOpener.js'; // Uses the updated openCase which saves data
import { addItemToInventoryAndSave } from './dataManager.js'; // Use dataManager to add items
import { displayResults, hideResultDisplay, updateOpenUntilStatus, toggleOpenUntilControls } from './ui.js';

/** Checks if an opened item meets the target conditions. */
function checkConditions(item, targets) {
    // Item Name/Type Check
    if (targets.item !== 'any') {
        if (targets.item === 'any_knife') {
            if (!item.is_knife) return false;
        } else {
            if (item.name !== targets.item) return false;
        }
    }
    // Wear Check
    if (targets.wear !== 'any') {
         if (targets.wear === 'Vanilla') { // Handle Vanilla wear for knives
             if (!item.is_knife || item.finish !== 'Vanilla') return false;
         } else { // Normal wear check
             if (item.wearCondition !== targets.wear) return false;
         }
    }
    // StatTrak Check
    if (targets.statTrak !== 'any') {
        const isTargetingStatTrak = (targets.statTrak === 'yes');
        if (item.isStatTrak !== isTargetingStatTrak) return false;
    }
    // Seed Check
    if (targets.seed !== null && item.paintSeed !== targets.seed) {
        return false;
    }
    // All conditions met
    return true;
}

/** Performs a single step in the "Open Until" process. */
function performOpenUntilStep(targets) {
    if (!state.isOpeningUntil) return; // Stop if flag turned off externally

    const openedItem = openCase(); // openCase now increments counter and saves data
    incrementOpenUntilCount(); // Increment session counter

    if (checkConditions(openedItem, targets)) {
        // Target found!
        stopOpenUntil(); // Stop the automated process
        displayResults([openedItem]); // Display the single found item in the results area
        addItemToInventoryAndSave(openedItem); // Ensure item is added and saved
        updateOpenUntilStatus(`Success! Found ${openedItem.isStatTrak ? 'ST™ ' : ''}${openedItem.name || 'Item'} (${openedItem.wearCondition}, P:${openedItem.paintSeed ?? 'N/A'}) after ${state.openUntilCount.toLocaleString()} cases.`, 'success');
    } else {
        // Target not found, continue running
        const now = Date.now();
        // Throttle status updates to avoid excessive DOM manipulation
        if (now - state.lastStatusUpdate > 100) { // Update max ~10 times/sec
            updateOpenUntilStatus(`Opening... Count: ${state.openUntilCount.toLocaleString()}`, 'running');
            updateLastStatusTimestamp();
        }
        // Add non-matching items to inventory and save
        // This happens less frequently than normal opening, so less performance impact likely acceptable
        addItemToInventoryAndSave(openedItem);
    }
}

/** Starts the "Open Until" automated process. */
export function startOpenUntil() {
    // Prevent starting if already running or a single/multi animation is in progress
    if (state.isOpening || state.isOpeningUntil) {
         console.log("Open Until prevented: Already opening or animating.");
         return;
    }

    // Get Targets from UI
    const targets = {
        item: dom.targetItemSelect?.value || 'any',
        wear: dom.targetWearSelect?.value || 'any',
        statTrak: dom.targetStatTrakSelect?.value || 'any',
        seed: dom.targetSeedInput?.value ? parseInt(dom.targetSeedInput.value, 10) : null
    };

    // Validate Seed Input
    if (targets.seed !== null && (isNaN(targets.seed) || targets.seed < 0 || targets.seed > 1000)) {
        updateOpenUntilStatus("Invalid Paint Seed (must be 0-1000).", "error");
        dom.targetSeedInput?.focus();
        return;
    }
    // Ensure seed is strictly null if it was invalid after parsing
    if (targets.seed !== null && isNaN(targets.seed)) targets.seed = null;


    // Start Process
    const casesPerSecond = parseInt(dom.openSpeedSlider?.value || state.settings.defaultOpenSpeed, 10); // Use current slider value or default setting
    let intervalMs = Math.max(MIN_OPEN_UNTIL_INTERVAL, 1000 / casesPerSecond);

    setIsOpeningUntil(true); // Set the flag
    resetOpenUntilSession(); // Reset session counter and timestamp
    toggleOpenUntilControls(false); // Disable UI controls
    updateOpenUntilStatus(`Starting... Speed: ~${casesPerSecond} CPS`, 'running');
    hideResultDisplay(); // Hide previous results

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
