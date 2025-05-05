import * as dom from './dom.js';
import { state, setIsOpening, resetMultiOpenCounter, incrementMultiOpenCounter, areAllMultiOpensComplete } from './state.js';
import { WEAPON_CASE_1, ROLLER_ANIMATION_DURATION, ROLLER_ITEM_WIDTH, WINNING_ITEM_OFFSET_INDEX, GOLD_ICON_PATH, ERROR_IMAGE_PATH, ROLLER_ITEM_COUNT } from './constants.js';
import { generateRollerItems } from './caseOpener.js';
import { populateRoller, displayResults, hideResultDisplay, setupMultiRollers } from './ui.js';
import { getImageUrl } from './helpers.js';
// *** ADDED IMPORT FOR addItemToInventoryAndSave ***
import { addItemToInventoryAndSave } from './dataManager.js';

/**
 * Runs the roller animation for a SINGLE case and updates the multi-open counter.
 * @param {object} winningItem - The item determined by openCase().
 * @param {number} index - The index (0-based) of this roller instance.
 * @param {Array<object>} allWonItems - Array containing all items from this multi-open batch.
 */
function runSingleAnimation(winningItem, index, allWonItems) {
    const rollerTrackId = `rollerTrack_${index}`;
    const rollerContainerId = `rollerContainer_${index}`;
    const rollerTrack = document.getElementById(rollerTrackId);
    const rollerContainer = document.getElementById(rollerContainerId);

    // Crucial Check: Ensure elements exist
    if (!rollerTrack || !rollerContainer) {
        console.error(`Animation failed: Roller elements for index ${index} (IDs: ${rollerTrackId}, ${rollerContainerId}) not found.`);
        handleAnimationCompletion(allWonItems); // Count as complete to avoid UI lock
        return;
    }
    // console.log(`Running animation for roller index ${index}`); // Debug log

    // Populate this specific roller
    const itemsToDisplay = state.settings.playAnimation ? ROLLER_ITEM_COUNT : 1;
    const rollerItems = generateRollerItems(itemsToDisplay);
    let visualItemInRoller;
    if (winningItem.is_knife) {
        const goldPlaceholder = WEAPON_CASE_1.items.find(i => i.rarity === "Gold");
        visualItemInRoller = goldPlaceholder ? { ...goldPlaceholder, displayImageUrl: getImageUrl(goldPlaceholder).roller } : { ...winningItem, displayImageUrl: GOLD_ICON_PATH };
    } else {
        visualItemInRoller = { ...winningItem, displayImageUrl: winningItem.displayImageUrl || ERROR_IMAGE_PATH };
    }
    const winningIndex = state.settings.playAnimation ? Math.max(0, rollerItems.length - WINNING_ITEM_OFFSET_INDEX) : 0;
    if (winningIndex >= 0 && winningIndex <= rollerItems.length) {
         rollerItems.splice(winningIndex, 0, visualItemInRoller);
    } else {
        console.warn(`Calculated winningIndex ${winningIndex} out of bounds. Appending item.`);
        rollerItems.push(visualItemInRoller);
    }
    populateRoller(rollerItems, index);

    // Skip animation if setting is off
    if (!state.settings.playAnimation) {
        // console.log(`Animation skipped for roller ${index}.`); // Debug log
        const finalScrollTarget = calculateScrollTarget(winningIndex, rollerContainer);
        if (finalScrollTarget !== null) {
            rollerTrack.style.transition = 'none';
            rollerTrack.style.transform = `translateX(-${finalScrollTarget}px)`;
        }
        handleAnimationCompletion(allWonItems);
        return;
    }

    // Calculate Animation Target
    const containerWidth = rollerContainer.offsetWidth;
    if (!containerWidth || containerWidth <= 0) {
         console.error(`Roller container width calculation failed for roller ${index}.`);
         handleAnimationCompletion(allWonItems);
         return;
    }
    const centerOffset = (winningIndex * ROLLER_ITEM_WIDTH) + (ROLLER_ITEM_WIDTH / 2) - (containerWidth / 2);
    const randomOffset = (Math.random() - 0.5) * (ROLLER_ITEM_WIDTH * 0.7);
    const initialScrollTarget = Math.max(0, centerOffset + randomOffset);

    // Start Animation
    requestAnimationFrame(() => {
        rollerTrack.style.transition = 'none';
        rollerTrack.style.transform = `translateX(0px)`;
        void rollerTrack.offsetWidth; // Force reflow

        rollerTrack.style.transition = `transform ${ROLLER_ANIMATION_DURATION}ms cubic-bezier(0.2, 0.8, 0.1, 1)`;
        rollerTrack.style.transform = `translateX(-${initialScrollTarget}px)`;

        // After Animation
        setTimeout(() => {
            // Snap to Center
            const finalScrollTarget = calculateScrollTarget(winningIndex, rollerContainer);
             if (finalScrollTarget !== null) {
                rollerTrack.style.transition = 'transform 0.4s ease-out';
                rollerTrack.style.transform = `translateX(-${finalScrollTarget}px)`;
             }
            // Mark this animation as complete after snap duration
            setTimeout(() => handleAnimationCompletion(allWonItems), 400);
        }, ROLLER_ANIMATION_DURATION);
    });
}

/** Calculates the final scroll target to center the winning item. */
function calculateScrollTarget(winningIndex, rollerContainer) {
     if (ROLLER_ITEM_WIDTH <= 0) return null;
     const containerWidth = rollerContainer?.offsetWidth;
     if (!containerWidth || containerWidth <= 0) return null;
     const centerOffset = (winningIndex * ROLLER_ITEM_WIDTH) + (ROLLER_ITEM_WIDTH / 2) - (containerWidth / 2);
     return Math.max(0, centerOffset);
}


/** Handles completion of one animation, checks if all are done. */
function handleAnimationCompletion(allWonItems) {
    incrementMultiOpenCounter();
    // console.log(`Animation ${state.multiOpenCompleteCounter}/${state.multiOpenTotalCount} complete.`); // Debug log
    if (areAllMultiOpensComplete()) {
        console.log("All animations complete.");
        if(state.settings.playAnimation) {
            displayResults(allWonItems);
        }
        resetAnimationState();
    }
}


/** Resets flags and re-enables buttons after animation/action. */
function resetAnimationState() {
    console.log("Resetting animation state...");
    setIsOpening(false);
    state.multiOpenCompleteCounter = 0;
    state.multiOpenTotalCount = 0;
    const enableButtons = !state.isOpeningUntil;
    if(dom.openCaseButton) dom.openCaseButton.disabled = !enableButtons;
    if(dom.quickOpenButton) dom.quickOpenButton.disabled = !enableButtons;
    if(dom.toggleOpenUntilButton) dom.toggleOpenUntilButton.disabled = !enableButtons;
    if(dom.startOpenUntilButton) dom.startOpenUntilButton.disabled = !enableButtons;
    if(dom.multiOpenCountInput) dom.multiOpenCountInput.disabled = !enableButtons;
    console.log("Animation state reset complete.");
}

/**
 * Orchestrates opening multiple cases with animation.
 * @param {number} count - Number of cases to open.
 * @param {Function} openCaseFn - The function to call to generate a single winning item.
 */
export function runMultiOpen(count, openCaseFn) {
    if (state.isOpening || state.isOpeningUntil) return;
    count = Math.max(1, Math.min(10, parseInt(count, 10) || 1));
    setIsOpening(true);
    resetMultiOpenCounter(count);
    console.log(`Starting multi-open for ${count} cases.`);

    // Disable buttons
    if(dom.openCaseButton) dom.openCaseButton.disabled = true;
    if(dom.quickOpenButton) dom.quickOpenButton.disabled = true;
    if(dom.toggleOpenUntilButton) dom.toggleOpenUntilButton.disabled = true;
    if(dom.startOpenUntilButton) dom.startOpenUntilButton.disabled = true;
    if(dom.multiOpenCountInput) dom.multiOpenCountInput.disabled = true;

    hideResultDisplay();
    setupMultiRollers(count); // Create the roller elements in the DOM

    const allWonItems = [];

    // Generate items first (openCaseFn increments counter and saves)
    for (let i = 0; i < count; i++) {
        const winningItem = openCaseFn();
        allWonItems.push(winningItem);
        // Add item to inventory *immediately* after generating it
        // This ensures data is saved even if the animation part has issues or user navigates away
        addItemToInventoryAndSave(winningItem);
    }

     // Display results immediately if animation is off
     if (!state.settings.playAnimation) {
        displayResults(allWonItems);
     }

    // Start animations (or skip if setting is off)
    allWonItems.forEach((item, index) => {
        // Use rAF to ensure DOM is ready after setupMultiRollers
        requestAnimationFrame(() => {
             runSingleAnimation(item, index, allWonItems);
        });
    });

    // If animation is off, reset state immediately
    if (!state.settings.playAnimation) {
         resetAnimationState();
    }
    // If animation is on, resetAnimationState is called by the last handleAnimationCompletion
}


/** Handles the "Quick Open" action for multiple cases. */
export function handleQuickOpen(count, openCaseFn) {
    if (state.isOpening || state.isOpeningUntil) return;
    count = Math.max(1, Math.min(10, parseInt(count, 10) || 1));
    setIsOpening(true);
    console.log(`Quick Open started for ${count} cases.`);

    // Disable buttons temporarily
    if(dom.openCaseButton) dom.openCaseButton.disabled = true;
    if(dom.quickOpenButton) dom.quickOpenButton.disabled = true;
    if(dom.toggleOpenUntilButton) dom.toggleOpenUntilButton.disabled = true;
    if(dom.startOpenUntilButton) dom.startOpenUntilButton.disabled = true;
    if(dom.multiOpenCountInput) dom.multiOpenCountInput.disabled = true;

    const openedItems = [];
    try {
        for (let i = 0; i < count; i++) {
            const item = openCaseFn(); // Generates item, increments counter, triggers save
            openedItems.push(item);
            // Add item to inventory state and save
            // *** Use the imported function ***
            addItemToInventoryAndSave(item);
        }
        console.log(`Quick Open - ${count} items generated and saved.`);
        displayResults(openedItems); // Display all results in the result area
        console.log("Quick Open - Results displayed.");
    } catch (error) {
        console.error("Error during Quick Open:", error);
    } finally {
        // Re-enable buttons after a short delay
        setTimeout(resetAnimationState, 150);
    }
}
