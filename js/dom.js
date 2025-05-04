// --- DOM Element Selections ---

// General Layout
export const appLayout = document.querySelector('.app-layout');
export const sidebar = document.querySelector('.sidebar');
export const mainContent = document.querySelector('.main-content');

// Sidebar Navigation & Auth
export const navLinks = document.querySelectorAll('.nav-link');
export const caseCounterSidebarSpan = document.querySelector('.sidebar-footer #caseCounter');
export const saveStatusTextSpan = document.getElementById('saveStatusText'); // Save status indicator
export const authLoggedOutDiv = document.getElementById('auth-logged-out');
export const authLoggedInDiv = document.getElementById('auth-logged-in');
export const loginButton = document.getElementById('loginButton');
export const signupButton = document.getElementById('signupButton');
export const userEmailDisplay = document.getElementById('userEmailDisplay');
export const logoutButton = document.getElementById('logoutButton');

// Page Containers
export const pageContainers = document.querySelectorAll('.page-container');
export const pageCaseOpening = document.getElementById('page-case-opening');
export const pageInventory = document.getElementById('page-inventory');
export const pageSettings = document.getElementById('page-settings');

// Auth Modals
export const authModalBackdrop = document.getElementById('authModalBackdrop');
export const loginModal = document.getElementById('loginModal');
export const signupModal = document.getElementById('signupModal');
export const closeAuthModalButtons = document.querySelectorAll('.close-auth-modal');
export const loginForm = document.getElementById('loginForm');
export const signupForm = document.getElementById('signupForm');
export const loginEmailInput = document.getElementById('loginEmail');
export const loginPasswordInput = document.getElementById('loginPassword');
export const loginErrorP = document.getElementById('loginError');
export const signupEmailInput = document.getElementById('signupEmail');
export const signupPasswordInput = document.getElementById('signupPassword');
export const signupConfirmPasswordInput = document.getElementById('signupConfirmPassword');
export const signupErrorP = document.getElementById('signupError');

// Case Opening Page Elements (No changes needed from previous version)
export const caseCounterSpan = document.getElementById('caseCounter'); // Original counter
export const rollerTrack = document.getElementById('rollerTrack');
export const rollerContainer = document.querySelector('.roller-container');
export const modalBackdrop = document.getElementById('modalBackdrop'); // Result modal
export const resultDisplay = document.getElementById('resultDisplay');
export const resultImage = document.getElementById('resultImage');
export const resultName = document.getElementById('resultName');
export const resultDetails = document.getElementById('resultDetails');
export const closeResultButton = document.getElementById('closeResultButton'); // Result modal close
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

// Inventory Page Elements (No changes needed from previous version)
export const inventorySection = document.getElementById('inventorySection');
export const inventoryGrid = document.getElementById('inventoryGrid');
export const rarityFilter = document.getElementById('rarityFilter');
export const sortOrder = document.getElementById('sortOrder');
export const clearInventoryButton = document.getElementById('clearInventoryButton');
export const emptyInventoryMessage = document.getElementById('emptyInventoryMessage');

// Settings Page Elements (No changes needed from previous version)
export const settingsContent = document.querySelector('#page-settings .settings-content');
export const themeSelect = document.getElementById('themeSelect');
