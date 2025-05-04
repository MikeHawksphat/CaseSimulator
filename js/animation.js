import * as dom from './dom.js';
import { state, setIsOpening } from './state.js';
import { WEAPON_CASE_1, ROLLER_ITEM_COUNT, ROLLER_ANIMATION_DURATION, ROLLER_ITEM_WIDTH, WINNING_ITEM_OFFSET_INDEX, GOLD_ICON_PATH, ERROR_IMAGE_PATH } from './constants.js';
import { generateRollerItems, openCase } from './caseOpener.js'; // Ensure openCase is imported
import { populateRoller, displayResultModal, hideResultDisplay, toggleOpenUntilControls } from './ui.js';
import { getImageUrl } from './helpers.js';
import { addItemToInventory } from './inventory.js';

/**
 * Runs the roller animation and displays the result.
 * @param {object} winningItem - The item determined by openCase().
 */
export function runAnimation(winningItem) {
    // Check flags before starting
    if (state.isOpening || state.isOpeningUntil) {
        console.log("Animation prevented: Already opening or opening until.");
        return;
    }
    setIsOpening(true); // Set opening flag
    console.log("Animation started. State:", { ...state }); // Log state

    // Disable buttons during animation
    dom.openCaseButton.disabled = true;
    dom.quickOpenButton.disabled = true;
    dom.toggleOpenUntilButton.disabled = true;
    dom.startOpenUntilButton.disabled = true; // Also disable start button

    hideResultDisplay(); // Hide previous result immediately

    const rollerItems = generateRollerItems(ROLLER_ITEM_COUNT);

    // Determine the visual representation of the winning item for the roller
    let visualItemInRoller;
    if (winningItem.is_knife) {
        const goldPlaceholder = WEAPON_CASE_1.items.find(i => i.rarity === "Gold");
        if (goldPlaceholder) {
            const urls = getImageUrl(goldPlaceholder);
            visualItemInRoller = { ...goldPlaceholder, displayImageUrl: urls.roller };
        } else {
             console.error("Gold placeholder item not found!");
             visualItemInRoller = { ...winningItem, displayImageUrl: GOLD_ICON_PATH };
        }
    } else {
        visualItemInRoller = { ...winningItem, displayImageUrl: winningItem.displayImageUrl || ERROR_IMAGE_PATH }; // Add fallback
    }

    // Insert the visual representation near the end
    const winningIndex = ROLLER_ITEM_COUNT - WINNING_ITEM_OFFSET_INDEX;
    if (winningIndex >= 0 && winningIndex <= rollerItems.length) {
        rollerItems.splice(winningIndex, 0, visualItemInRoller);
    } else {
        console.error(`Invalid winningIndex (${winningIndex}). Appending visual item.`);
        rollerItems.push(visualItemInRoller);
    }

    populateRoller(rollerItems); // Populate the track

    // --- Calculate Animation Target ---
    if (ROLLER_ITEM_WIDTH <= 0) {
        console.error("ROLLER_ITEM_WIDTH is invalid (<= 0). Aborting animation.");
        resetAnimationState(); // Reset state even on error
        return;
    }
    const containerWidth = dom.rollerContainer?.offsetWidth;
    if (!containerWidth || containerWidth <= 0) {
         console.error("Roller container width calculation failed. Aborting animation.");
         resetAnimationState(); // Reset state even on error
         return;
    }

    const centerOffset = (winningIndex * ROLLER_ITEM_WIDTH) + (ROLLER_ITEM_WIDTH / 2) - (containerWidth / 2);
    const randomOffset = (Math.random() - 0.5) * (ROLLER_ITEM_WIDTH * 0.7);
    const initialScrollTarget = centerOffset + randomOffset;

    // --- Start Animation ---
    dom.rollerTrack.style.transition = 'none';
    dom.rollerTrack.style.transform = `translateX(0px)`;
    void dom.rollerTrack.offsetWidth; // Force reflow

    dom.rollerTrack.style.transition = `transform ${ROLLER_ANIMATION_DURATION}ms cubic-bezier(0.2, 0.8, 0.1, 1)`;
    dom.rollerTrack.style.transform = `translateX(-${initialScrollTarget}px)`;

    // --- After Animation ---
    setTimeout(() => {
        console.log("Animation finished. Displaying result and adding to inventory.");
        displayResultModal(winningItem);
        addItemToInventory(winningItem); // Add AFTER displaying

        // --- Snap to Center ---
        const finalScrollTarget = centerOffset;
        dom.rollerTrack.style.transition = 'transform 0.4s ease-out';
        dom.rollerTrack.style.transform = `translateX(-${finalScrollTarget}px)`;

        // Reset state after snap transition completes
        setTimeout(resetAnimationState, 400);

    }, ROLLER_ANIMATION_DURATION);
}

/** Resets flags and re-enables buttons after animation/action. */
function resetAnimationState() {
    console.log("Resetting animation state...");
    setIsOpening(false); // Reset opening flag

    // Re-enable buttons, respecting the 'isOpeningUntil' state
    // Buttons should be enabled if 'isOpeningUntil' is FALSE
    const enableButtons = !state.isOpeningUntil;
    dom.openCaseButton.disabled = !enableButtons;
    dom.quickOpenButton.disabled = !enableButtons;
    dom.toggleOpenUntilButton.disabled = !enableButtons;
    dom.startOpenUntilButton.disabled = !enableButtons; // Also controlled by toggleOpenUntilControls

    // If 'Open Until' is active, ensure the controls reflect that state correctly
    // This is handled by toggleOpenUntilControls in start/stop functions
    // No need to call toggleOpenUntilControls here as it might interfere
    // if called between startOpenUntil and the first interval tick.

    console.log("Animation state reset complete. State:", { ...state }); // Log state after reset
}

/** Handles the "Quick Open" action - opens a case and shows result instantly. */
export function handleQuickOpen() {
    if (state.isOpening || state.isOpeningUntil) {
        console.log("Quick Open prevented: Already opening or opening until.");
        return;
    }
    setIsOpening(true); // Use the flag briefly
    console.log("Quick Open started. State:", { ...state }); // Log state

    // Disable buttons temporarily
    dom.openCaseButton.disabled = true;
    dom.quickOpenButton.disabled = true;
    dom.toggleOpenUntilButton.disabled = true;
    dom.startOpenUntilButton.disabled = true;

    try {
        const item = openCase(); // Generate the item (increments counter)
        console.log("Quick Open - Item generated:", item);
        displayResultModal(item); // Display result
        console.log("Quick Open - Result displayed.");
        addItemToInventory(item); // Add to inventory (saves inventory, re-renders)
        console.log("Quick Open - Item added to inventory.");
    } catch (error) {
        console.error("Error during Quick Open:", error);
        // Optionally display an error message to the user
    } finally {
        // Re-enable buttons after a short delay, regardless of success/error
        // Use the reset function for consistency
        setTimeout(resetAnimationState, 150); // Short delay
    }
}
