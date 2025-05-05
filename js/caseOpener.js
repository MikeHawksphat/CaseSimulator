import { WEAPON_CASE_1, STATTRAK_CHANCE, ERROR_IMAGE_PATH } from './constants.js';
import { getRandomFloat, generateFloatValue, chooseRarity, getWearCondition, getImageUrl } from './helpers.js';
// Import the specific data manager function needed
import { incrementCaseCounterAndSave } from './dataManager.js';

/**
 * Generates an array of items for the roller animation visual.
 * @param {number} count - Number of items to generate for the roller.
 * @returns {object[]} An array of item objects for the roller.
 */
export function generateRollerItems(count) {
    const items = [];
    // Pool of non-knife items for the roller visuals
    const visualPool = WEAPON_CASE_1.items.filter(i => !i.is_knife);
    // Generic gold placeholder for knives in the roller
    const goldItem = WEAPON_CASE_1.items.find(i => i.is_knife);

    for (let i = 0; i < count; i++) {
        let template;
        const r = Math.random();

        // Approximate odds for visual roller (not precise, just for show)
        if (r < 0.01 && goldItem) { template = goldItem; } // ~1% gold
        else if (r < 0.05) { const pool = visualPool.filter(it => it.rarity === "Covert"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; } // ~4% Covert
        else if (r < 0.15) { const pool = visualPool.filter(it => it.rarity === "Classified"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; } // ~10% Classified
        else if (r < 0.40) { const pool = visualPool.filter(it => it.rarity === "Restricted"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; } // ~25% Restricted
        else { const pool = visualPool.filter(it => it.rarity === "Mil-Spec"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; } // ~60% Mil-Spec

        if (template) {
            // Get the appropriate roller image URL (gold icon for knives)
            const urls = getImageUrl(template);
            items.push({ ...template, displayImageUrl: urls.roller });
        } else {
            // Fallback if template selection fails (shouldn't happen with current logic)
            console.warn("Roller item generation failed for iteration", i);
            const defaultItem = visualPool[0] || goldItem; // Use first weapon or gold item
            if (defaultItem) {
                const urls = getImageUrl(defaultItem);
                items.push({ ...defaultItem, displayImageUrl: urls.roller });
            } else {
                 // Absolute fallback
                 items.push({ name: "Error", rarity: "Error", displayImageUrl: ERROR_IMAGE_PATH });
            }
        }
    }
    return items;
}


/**
 * Simulates opening a single case, increments counter, and triggers save.
 * @returns {object} The generated item object with all details (wear, StatTrak, seed, etc.).
 */
export function openCase() {
    // Increment counter and trigger save via dataManager
    incrementCaseCounterAndSave();

    const rarity = chooseRarity();
    let potentialItems = WEAPON_CASE_1.items.filter(i => i.rarity === rarity);

    // Handle case where no items exist for the chosen rarity
    if (!potentialItems.length) {
        console.error(`No items found for rarity: ${rarity}. Defaulting to Mil-Spec.`);
        potentialItems = WEAPON_CASE_1.items.filter(i => i.rarity === "Mil-Spec");
        if (!potentialItems.length) {
            console.error("FATAL: No Mil-Spec items found either!");
            // Return a minimal error object
            return {
                name: "ERROR", rarity: "Error", rarity_color: "red", wearCondition: "Error",
                floatValue: "0", paintSeed: 0, isStatTrak: false, isBlueGem: false,
                resultImageUrl: ERROR_IMAGE_PATH, displayImageUrl: ERROR_IMAGE_PATH, id: Date.now()
            };
        }
    }

    // Select a random item template from the filtered list
    let template = potentialItems[Math.floor(Math.random() * potentialItems.length)];
    let item = { ...template }; // Create a copy to modify

    // --- Generate Item Details ---

    // Handle Knife Generation specifically
    if (item.is_knife) {
        const knife = WEAPON_CASE_1.knives[Math.floor(Math.random() * WEAPON_CASE_1.knives.length)];
        const finish = WEAPON_CASE_1.finishes[Math.floor(Math.random() * WEAPON_CASE_1.finishes.length)];

        item.name = `${knife.type} | ${finish}`;
        item.type = knife.type; // Store knife type (e.g., "Karambit")
        item.finish = finish; // Store finish name (e.g., "Case Hardened")
        item.image_slug_base = knife.image_slug_base; // Store base slug for image lookup

        // Assign blue gem seed only if it's Case Hardened AND the knife type has a defined BG seed
        item.blue_gem_seed = (finish === "Case Hardened" && knife.blue_gem_seed !== undefined)
                             ? knife.blue_gem_seed
                             : undefined;
    } else {
         // Assign blue gem seed for non-knives if applicable (e.g., AK Case Hardened)
         item.blue_gem_seed = template.hasOwnProperty('blue_gem_seed') ? template.blue_gem_seed : undefined;
    }

    // Determine StatTrak™
    item.isStatTrak = Math.random() < STATTRAK_CHANCE;

    // Determine Float Value and Wear Condition
    const float = generateFloatValue();
    item.floatValue = float.toFixed(6); // Store float with precision
    item.wearCondition = getWearCondition(float);

    // Determine Paint Seed (Pattern Index)
    item.paintSeed = Math.floor(getRandomFloat(1, 1001)); // Seeds 1-1000 inclusive

    // Check for Blue Gem condition
    item.isBlueGem = (item.blue_gem_seed !== undefined && item.paintSeed === item.blue_gem_seed);

    // Get Image URLs based on the fully generated item details
    const urls = getImageUrl(item);
    item.displayImageUrl = urls.roller; // Image for the roller animation
    item.resultImageUrl = urls.result; // Image for the result display/inventory

    return item; // Return the fully detailed item object
}
