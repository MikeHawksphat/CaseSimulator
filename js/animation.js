import * as dom from './dom.js';
import { state, setIsOpening } from './state.js';
import { WEAPON_CASE_1, ROLLER_ITEM_COUNT, ROLLER_ANIMATION_DURATION, ROLLER_ITEM_WIDTH, WINNING_ITEM_OFFSET_INDEX, GOLD_ICON_PATH, ERROR_IMAGE_PATH } from './constants.js';
import { generateRollerItems, openCase } from './caseOpener.js';
import { populateRoller, displayResultModal, hideResultDisplay, toggleOpenUntilControls } from './ui.js';
import { getImageUrl } from './helpers.js';
// Import the specific data manager function needed
import { addItemToInventoryAndSave } from './dataManager.js';

/**
 * Runs the roller animation and displays the result.
 * @param {object} winningItem - The item determined by openCase().
 */
export function runAnimation(winningItem) {
    if (state.isOpening || state.isOpeningUntil) return;
    setIsOpening(true);
    console.log("Animation started.");

    dom.openCaseButton.disabled = true;
    dom.quickOpenButton.disabled = true;
    dom.toggleOpenUntilButton.disabled = true;
    dom.startOpenUntilButton.disabled = true;

    hideResultDisplay();
    const rollerItems = generateRollerItems(ROLLER_ITEM_COUNT);
    let visualItemInRoller;
    if (winningItem.is_knife) {
        const goldPlaceholder = WEAPON_CASE_1.items.find(i => i.rarity === "Gold");
        visualItemInRoller = goldPlaceholder ? { ...goldPlaceholder, displayImageUrl: getImageUrl(goldPlaceholder).roller } : { ...winningItem, displayImageUrl: GOLD_ICON_PATH };
    } else {
        visualItemInRoller = { ...winningItem, displayImageUrl: winningItem.displayImageUrl || ERROR_IMAGE_PATH };
    }
    const winningIndex = ROLLER_ITEM_COUNT - WINNING_ITEM_OFFSET_INDEX;
    if (winningIndex >= 0 && winningIndex <= rollerItems.length) {
        rollerItems.splice(winningIndex, 0, visualItemInRoller);
    } else {
        rollerItems.push(visualItemInRoller);
    }
    populateRoller(rollerItems);

    if (ROLLER_ITEM_WIDTH <= 0) { console.error("ROLLER_ITEM_WIDTH invalid."); resetAnimationState(); return; }
    const containerWidth = dom.rollerContainer?.offsetWidth;
    if (!containerWidth || containerWidth <= 0) { console.error("Roller container width invalid."); resetAnimationState(); return; }

    const centerOffset = (winningIndex * ROLLER_ITEM_WIDTH) + (ROLLER_ITEM_WIDTH / 2) - (containerWidth / 2);
    const randomOffset = (Math.random() - 0.5) * (ROLLER_ITEM_WIDTH * 0.7);
    const initialScrollTarget = centerOffset + randomOffset;

    dom.rollerTrack.style.transition = 'none';
    dom.rollerTrack.style.transform = `translateX(0px)`;
    void dom.rollerTrack.offsetWidth;
    dom.rollerTrack.style.transition = `transform ${ROLLER_ANIMATION_DURATION}ms cubic-bezier(0.2, 0.8, 0.1, 1)`;
    dom.rollerTrack.style.transform = `translateX(-${initialScrollTarget}px)`;

    setTimeout(() => {
        displayResultModal(winningItem);
        // *** MODIFIED: Call dataManager function to add item and trigger save ***
        addItemToInventoryAndSave(winningItem);

        const finalScrollTarget = centerOffset;
        dom.rollerTrack.style.transition = 'transform 0.4s ease-out';
        dom.rollerTrack.style.transform = `translateX(-${finalScrollTarget}px)`;
        setTimeout(resetAnimationState, 400);
    }, ROLLER_ANIMATION_DURATION);
}

/** Resets flags and re-enables buttons after animation/action. */
function resetAnimationState() {
    console.log("Resetting animation state...");
    setIsOpening(false);
    const enableButtons = !state.isOpeningUntil;
    dom.openCaseButton.disabled = !enableButtons;
    dom.quickOpenButton.disabled = !enableButtons;
    dom.toggleOpenUntilButton.disabled = !enableButtons;
    dom.startOpenUntilButton.disabled = !enableButtons;
    console.log("Animation state reset complete.");
}

/** Handles the "Quick Open" action. */
export function handleQuickOpen() {
    if (state.isOpening || state.isOpeningUntil) return;
    setIsOpening(true);
    console.log("Quick Open started.");

    dom.openCaseButton.disabled = true;
    dom.quickOpenButton.disabled = true;
    dom.toggleOpenUntilButton.disabled = true;
    dom.startOpenUntilButton.disabled = true;

    try {
        const item = openCase(); // Generates item, increments counter, triggers save
        console.log("Quick Open - Item generated:", item);
        displayResultModal(item);
        // *** MODIFIED: Call dataManager function to add item and trigger save ***
        // Note: openCase already triggers a save for the counter increment.
        // Adding the item also triggers a save. This might result in two quick saves.
        // Consider optimizing dataManager.saveData if this becomes an issue (e.g., debounce).
        addItemToInventoryAndSave(item);
        console.log("Quick Open - Item added to inventory and saved.");
    } catch (error) {
        console.error("Error during Quick Open:", error);
    } finally {
        setTimeout(resetAnimationState, 150);
    }
}
