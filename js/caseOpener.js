import { WEAPON_CASE_1, STATTRAK_CHANCE, ERROR_IMAGE_PATH } from './constants.js';
import { getRandomFloat, generateFloatValue, chooseRarity, getWearCondition, getImageUrl } from './helpers.js';
// Import the specific data manager function needed
import { incrementCaseCounterAndSave } from './dataManager.js';

/**
 * Generates an array of items for the roller animation visual.
 * (No changes needed in this function)
 */
export function generateRollerItems(count) {
    const items = [];
    const visualPool = WEAPON_CASE_1.items.filter(i => !i.is_knife);
    const goldItem = WEAPON_CASE_1.items.find(i => i.is_knife);

    for (let i = 0; i < count; i++) {
        let template;
        const r = Math.random();
        if (r < 0.01 && goldItem) { template = goldItem; }
        else if (r < 0.05) { const pool = visualPool.filter(it => it.rarity === "Covert"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; }
        else if (r < 0.15) { const pool = visualPool.filter(it => it.rarity === "Classified"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; }
        else if (r < 0.40) { const pool = visualPool.filter(it => it.rarity === "Restricted"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; }
        else { const pool = visualPool.filter(it => it.rarity === "Mil-Spec"); template = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : visualPool[0]; }

        if (template) {
            const urls = getImageUrl(template);
            items.push({ ...template, displayImageUrl: urls.roller });
        } else {
            console.warn("Roller item generation failed for iteration", i);
            const defaultItem = visualPool[0] || goldItem;
            if (defaultItem) {
                const urls = getImageUrl(defaultItem);
                items.push({ ...defaultItem, displayImageUrl: urls.roller });
            } else {
                 items.push({ name: "Error", rarity: "Error", displayImageUrl: ERROR_IMAGE_PATH });
            }
        }
    }
    return items;
}


/**
 * Simulates opening a single case, increments counter, and triggers save.
 * @returns {object} The generated item object.
 */
export function openCase() {
    // *** MODIFIED: Call the dataManager function to increment and save ***
    incrementCaseCounterAndSave(); // Increments counter, updates UI, triggers save (API or local)

    const rarity = chooseRarity();
    let potentialItems = WEAPON_CASE_1.items.filter(i => i.rarity === rarity);

    if (!potentialItems.length) {
        console.error(`No items found for rarity: ${rarity}. Defaulting to Mil-Spec.`);
        potentialItems = WEAPON_CASE_1.items.filter(i => i.rarity === "Mil-Spec");
        if (!potentialItems.length) {
            console.error("FATAL: No Mil-Spec items found either!");
            return { name: "ERROR", rarity: "Error", rarity_color:"red", wearCondition:"Error", floatValue:"0", paintSeed:0, isStatTrak:false, isBlueGem:false, resultImageUrl: ERROR_IMAGE_PATH, displayImageUrl: ERROR_IMAGE_PATH, id: Date.now() };
        }
    }

    let template = potentialItems[Math.floor(Math.random() * potentialItems.length)];
    let item = { ...template };

    // --- Generate Item Details (No changes needed here) ---
    if (item.is_knife) {
        const knife = WEAPON_CASE_1.knives[Math.floor(Math.random() * WEAPON_CASE_1.knives.length)];
        const finish = WEAPON_CASE_1.finishes[Math.floor(Math.random() * WEAPON_CASE_1.finishes.length)];
        item.name = `${knife.type} | ${finish}`;
        item.type = knife.type;
        item.finish = finish;
        item.image_slug_base = knife.image_slug_base;
        item.blue_gem_seed = (finish === "Case Hardened" && knife.blue_gem_seed !== undefined) ? knife.blue_gem_seed : undefined;
    } else {
         item.blue_gem_seed = template.hasOwnProperty('blue_gem_seed') ? template.blue_gem_seed : undefined;
    }
    item.isStatTrak = Math.random() < STATTRAK_CHANCE;
    const float = generateFloatValue();
    item.floatValue = float.toFixed(6);
    item.wearCondition = getWearCondition(float);
    item.paintSeed = Math.floor(getRandomFloat(1, 1001));
    item.isBlueGem = (item.blue_gem_seed !== undefined && item.paintSeed === item.blue_gem_seed);
    const urls = getImageUrl(item);
    item.displayImageUrl = urls.roller;
    item.resultImageUrl = urls.result;

    return item;
}
