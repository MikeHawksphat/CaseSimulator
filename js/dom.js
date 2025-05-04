// --- DOM Element Selections ---

// General Layout
export const appLayout = document.querySelector('.app-layout');
export const sidebar = document.querySelector('.sidebar');
export const mainContent = document.querySelector('.main-content');

// Sidebar Navigation
export const navLinks = document.querySelectorAll('.nav-link'); // Get all nav links
export const caseCounterSidebarSpan = document.querySelector('.sidebar-footer #caseCounter'); // Counter in sidebar

// Page Containers
export const pageContainers = document.querySelectorAll('.page-container'); // Get all page divs
export const pageCaseOpening = document.getElementById('page-case-opening');
export const pageInventory = document.getElementById('page-inventory');
export const pageSettings = document.getElementById('page-settings');

// Case Opening Page Elements
export const caseCounterSpan = document.getElementById('caseCounter'); // Original counter (now in sidebar footer)
export const rollerTrack = document.getElementById('rollerTrack');
export const rollerContainer = document.querySelector('.roller-container');
export const modalBackdrop = document.getElementById('modalBackdrop');
export const resultDisplay = document.getElementById('resultDisplay');
export const resultImage = document.getElementById('resultImage');
export const resultName = document.getElementById('resultName');
export const resultDetails = document.getElementById('resultDetails');
export const closeResultButton = document.getElementById('closeResultButton');
export const openCaseButton = document.getElementById('openCaseButton');
export const quickOpenButton = document.getElementById('quickOpenButton');
export const toggleOpenUntilButton = document.getElementById('toggleOpenUntilButton');
export const openUntilPanel = document.getElementById('openUntilPanel');
export const targetItemSelect = document.getElementById('targetItem');
export const targetWearSelect = document.getElementById('targetWear');
export const targetStatTrakSelect = document.getElementById('targetStatTrak');
export const targetSeedInput = document.getElementById('targetSeed');
export const openSpeedSlider = document.getElementById('openSpeed');
export const speedValueSpan = document.getElementById('speedValue');
export const startOpenUntilButton = document.getElementById('startOpenUntilButton');
export const stopOpenUntilButton = document.getElementById('stopOpenUntilButton');
export const openUntilStatus = document.getElementById('openUntilStatus');
export const accordionHeaders = document.querySelectorAll('.accordion-header');

// Inventory Page Elements
export const inventorySection = document.getElementById('inventorySection'); // Now within pageInventory
export const inventoryGrid = document.getElementById('inventoryGrid');
export const rarityFilter = document.getElementById('rarityFilter');
export const sortOrder = document.getElementById('sortOrder');
export const clearInventoryButton = document.getElementById('clearInventoryButton');
export const emptyInventoryMessage = document.getElementById('emptyInventoryMessage');

// Settings Page Elements (Add more as needed)
export const settingsContent = document.querySelector('#page-settings .settings-content');
export const themeSelect = document.getElementById('themeSelect'); // Example setting
