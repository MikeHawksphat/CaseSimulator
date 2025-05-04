import { FLOAT_DISTRIBUTION, FLOAT_RANGES, ODDS, WEAPON_CASE_1, ERROR_IMAGE_PATH, GOLD_ICON_PATH } from './constants.js';

/**
 * Generates a random float between min (inclusive) and max (exclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random float.
 */
export function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generates a float value based on CS:GO wear distribution.
 * @returns {number} A float value between 0 and 1.
 */
export function generateFloatValue() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedRangeName = "Battle-Scarred"; // Default to last if something goes wrong

    for (const condition in FLOAT_DISTRIBUTION) {
        cumulative += FLOAT_DISTRIBUTION[condition];
        if (rand < cumulative) {
            selectedRangeName = condition;
            break;
        }
    }

    const range = FLOAT_RANGES.find(r => r.name === selectedRangeName);
    // Generate float within the selected range
    return range ? getRandomFloat(range.min, range.max) : Math.random(); // Fallback to random 0-1
}

/**
 * Chooses an item rarity based on defined odds.
 * @returns {string} The chosen rarity name (e.g., "Mil-Spec", "Covert").
 */
export function chooseRarity() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const rarity in ODDS) {
        cumulative += ODDS[rarity];
        if (rand < cumulative) {
            return rarity;
        }
    }
    console.warn("Rarity choice failed, defaulting to Mil-Spec.");
    return "Mil-Spec"; // Fallback rarity
}

/**
 * Determines the wear condition name based on a float value.
 * @param {number} floatValue - The item's float value (0-1).
 * @returns {string} The name of the wear condition (e.g., "Factory New").
 */
export function getWearCondition(floatValue) {
    for (const range of FLOAT_RANGES) {
        // Battle-Scarred includes 1.0, others are exclusive of max
        if (range.name === "Battle-Scarred") {
            // Handle edge case where float is exactly 1.000...
            if (floatValue >= range.min && floatValue <= range.max) return range.name;
        } else {
            if (floatValue >= range.min && floatValue < range.max) return range.name;
        }
    }
    console.warn(`Could not determine wear for float: ${floatValue}. Defaulting to Unknown.`);
    return "Unknown"; // Should not happen with valid floats 0-1
}

/**
 * Gets the appropriate image URLs for roller display and result display.
 * Handles special case for knives (shows gold icon in roller, specific finish in result).
 * @param {object} item - The item object.
 * @returns {{roller: string, result: string}} Object containing roller and result image URLs.
 */
export function getImageUrl(item) {
    let filename = "";
    let basePath = "";
    let rollerImageUrl = ERROR_IMAGE_PATH; // Default to error image
    let resultImageUrl = ERROR_IMAGE_PATH; // Default to error image

    try {
        if (item.rarity === "Gold" && item.is_knife && item.type && item.finish) {
            // It's a specific knife finish
            basePath = WEAPON_CASE_1.texture_paths.knives;
            const finishSlug = item.finish === "Vanilla" ? "vanilla" : item.finish.toLowerCase().replace(/ /g, '_');
            filename = `${item.image_slug_base}_${finishSlug}.png`;
            resultImageUrl = basePath + filename;
            rollerImageUrl = GOLD_ICON_PATH; // Show generic gold icon in roller
        } else if (item.rarity === "Gold") {
            // Generic gold item (e.g., placeholder in roller)
            rollerImageUrl = GOLD_ICON_PATH;
            resultImageUrl = GOLD_ICON_PATH; // Result should ideally be specific, but fallback
        } else if (item.image_slug) {
            // Regular weapon skin
            basePath = WEAPON_CASE_1.texture_paths.weapons;
            filename = `${item.image_slug}.png`;
            resultImageUrl = basePath + filename;
            rollerImageUrl = basePath + filename; // Show weapon skin in roller too
        } else {
             console.error("Could not determine image URL for item:", item);
        }
    } catch (error) {
        console.error("Error generating image URL for item:", item, error);
        // URLs already defaulted to error path
    }

    return { roller: rollerImageUrl, result: resultImageUrl };
}

/**
 * Safely accesses localStorage.
 * @param {'getItem' | 'setItem' | 'removeItem'} method - The localStorage method to call.
 * @param {string} key - The storage key.
 * @param {string} [value] - The value to set (for setItem).
 * @returns {string|null|void} The result of getItem or null/void for others/errors.
 */
export function safeLocalStorage(method, key, value) {
    try {
        if (method === 'setItem') {
            localStorage.setItem(key, value);
        } else if (method === 'getItem') {
            return localStorage.getItem(key);
        } else if (method === 'removeItem') {
            localStorage.removeItem(key);
        }
    } catch (e) {
        console.error(`LocalStorage operation '${method}' failed for key '${key}':`, e);
        // Optionally alert the user or handle the error appropriately
        // alert(`Could not ${method} data. Storage might be disabled or full.`);
        if (method === 'getItem') return null; // Return null if reading failed
    }
}
