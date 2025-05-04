// --- Case Data ---
export const WEAPON_CASE_1 = {
    name: "Weapon Case 1",
    items: [
        // Mil-Spec
        { name: "MP7 | Skulls", rarity: "Mil-Spec", rarity_color: "#4b69ff", image_slug: "mp7_skulls", rarity_sort: 1 },
        { name: "AUG | Wings", rarity: "Mil-Spec", rarity_color: "#4b69ff", image_slug: "aug_wings", rarity_sort: 1 },
        { name: "SG 553 | Ultraviolet", rarity: "Mil-Spec", rarity_color: "#4b69ff", image_slug: "sg553_ultraviolet", rarity_sort: 1 },
        // Restricted
        { name: "Glock-18 | Dragon Tattoo", rarity: "Restricted", rarity_color: "#8847ff", image_slug: "glock18_dragontattoo", rarity_sort: 2 },
        { name: "USP-S | Dark Water", rarity: "Restricted", rarity_color: "#8847ff", image_slug: "usps_darkwater", rarity_sort: 2 },
        { name: "M4A1-S | Dark Water", rarity: "Restricted", rarity_color: "#8847ff", image_slug: "m4a1s_darkwater", rarity_sort: 2 },
        // Classified
        { name: "AK-47 | Case Hardened", rarity: "Classified", rarity_color: "#d32ce6", image_slug: "ak47_casehardened", blue_gem_seed: 661, rarity_sort: 3 },
        { name: "Desert Eagle | Hypnotic", rarity: "Classified", rarity_color: "#d32ce6", image_slug: "deagle_hypnotic", rarity_sort: 3 },
        // Covert
        { name: "AWP | Lightning Strike", rarity: "Covert", rarity_color: "#eb4b4b", image_slug: "awp_lightningstrike", rarity_sort: 4 },
        // Gold (Placeholder for knives)
        { name: "Special Item", rarity: "Gold", rarity_color: "#ffd700", is_knife: true, rarity_sort: 5 }
    ],
    knives: [
        { type: "Karambit", image_slug_base: "karambit", blue_gem_seed: 387 },
        { type: "Bayonet", image_slug_base: "bayonet", blue_gem_seed: 555 },
        { type: "M9 Bayonet", image_slug_base: "m9_bayonet", blue_gem_seed: 601 },
        { type: "Flip Knife", image_slug_base: "flip_knife", blue_gem_seed: 670 },
        { type: "Gut Knife", image_slug_base: "gut_knife", blue_gem_seed: 567 }
    ],
    finishes: [
        "Vanilla", "Blue Steel", "Boreal Forest", "Case Hardened",
        "Crimson Web", "Fade", "Forest DDPAT", "Night", "Safari Mesh",
        "Scorched", "Slaughter", "Stained", "Urban Masked"
    ],
    texture_paths: {
        // Relative paths from index.html
        weapons: "./textures/weaponcase1/weapons/",
        knives: "./textures/weaponcase1/knives/",
        common: "./textures/common/" // For gold icon, error icon etc.
    }
};

// --- Probabilities and Distributions ---
export const ODDS = { "Mil-Spec": 79.92, "Restricted": 15.98, "Classified": 3.2, "Covert": 0.64, "Gold": 0.26 };
export const FLOAT_DISTRIBUTION = { "Factory New": 3, "Minimal Wear": 24, "Field-Tested": 33, "Well-Worn": 24, "Battle-Scarred": 16 };
export const FLOAT_RANGES = [
    { name: "Factory New", min: 0.00, max: 0.07 },
    { name: "Minimal Wear", min: 0.07, max: 0.15 },
    { name: "Field-Tested", min: 0.15, max: 0.38 },
    { name: "Well-Worn", min: 0.38, max: 0.45 },
    { name: "Battle-Scarred", min: 0.45, max: 1.00 }
];
export const STATTRAK_CHANCE = 0.10; // 10% chance

// --- Configuration ---
export const ROLLER_ITEM_COUNT = 80; // Number of items in the roller animation visual pool
export const ROLLER_ANIMATION_DURATION = 6000; // ms
export const INVENTORY_STORAGE_KEY = 'csgoCaseSimInventory_v3'; // Updated key if structure changes
export const CASE_COUNT_STORAGE_KEY = 'csgoCaseSimTotalCount_v2'; // Updated key
export const MIN_OPEN_UNTIL_INTERVAL = 10; // Minimum interval in ms for Open Until (prevents browser freeze)
export const ROLLER_ITEM_WIDTH = 150; // Must match the CSS width of .roller-item
export const WINNING_ITEM_OFFSET_INDEX = 10; // How many items from the end the winning item visually lands

// --- Paths ---
export const ERROR_IMAGE_PATH = `${WEAPON_CASE_1.texture_paths.common}error.png`;
export const GOLD_ICON_PATH = `${WEAPON_CASE_1.texture_paths.common}gold.png`;

// --- Rarity Order for Sorting ---
export const RARITY_ORDER = { "Mil-Spec": 1, "Restricted": 2, "Classified": 3, "Covert": 4, "Gold": 5 };
