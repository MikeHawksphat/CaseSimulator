// --- DOM Element Selections ---

// General Layout
export const appLayout = document.querySelector('.app-layout');
export const sidebar = document.querySelector('.sidebar');
export const mainContent = document.querySelector('.main-content');

// Sidebar Navigation & Footer
export const navLinks = document.querySelectorAll('.nav-link');
export const caseCounterSidebarSpan = document.querySelector('.sidebar-footer #caseCounter');
export const saveStatusTextSpan = document.getElementById('saveStatusText');

// Page Containers
export const pageContainers = document.querySelectorAll('.page-container');
export const pageCaseOpening = document.getElementById('page-case-opening');
export const pageInventory = document.getElementById('page-inventory');
export const pageSettings = document.getElementById('page-settings');

// Case Opening Page Elements
export const multiRollerSection = document.getElementById('multiRollerSection');
export const multiOpenCountInput = document.getElementById('multiOpenCount');
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

// Result Display List (Right Column)
export const resultListArea = document.getElementById('resultListArea');
export const resultList = document.getElementById('resultList');

// Inventory Page Elements
export const inventorySection = document.getElementById('inventorySection');
export const inventoryGrid = document.getElementById('inventoryGrid');
export const filterNameInput = document.getElementById('filterName');
export const rarityFilter = document.getElementById('rarityFilter');
export const wearFilter = document.getElementById('wearFilter');
export const statTrakFilter = document.getElementById('statTrakFilter');
export const sortOrder = document.getElementById('sortOrder');
export const clearInventoryButton = document.getElementById('clearInventoryButton');
export const emptyInventoryMessage = document.getElementById('emptyInventoryMessage');

// Inventory Pagination Elements
export const inventoryPagination = document.getElementById('inventoryPagination');
export const prevPageButton = document.getElementById('prevPageButton');
export const nextPageButton = document.getElementById('nextPageButton');
export const pageInfo = document.getElementById('pageInfo');

// Inventory Item Popup Modal Elements
export const itemPopupBackdrop = document.getElementById('itemPopupBackdrop');
export const itemPopupCard = document.getElementById('itemPopupCard');
export const closeItemPopupButton = document.getElementById('closeItemPopupButton');
export const itemPopupImage = document.getElementById('itemPopupImage');
export const itemPopupName = document.getElementById('itemPopupName');
export const itemPopupDetails = document.getElementById('itemPopupDetails');


// Settings Page Elements
export const settingsContent = document.querySelector('#page-settings .settings-content');
export const settingAnimationToggle = document.getElementById('settingAnimationToggle');
export const settingDefaultOpenSpeed = document.getElementById('settingDefaultOpenSpeed');
export const settingSpeedValueSpan = document.getElementById('settingSpeedValue');
export const resetAllDataButton = document.getElementById('resetAllDataButton');
