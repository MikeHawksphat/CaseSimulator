import * as dom from './dom.js';
import { state } from './state.js';
import { WEAPON_CASE_1, ERROR_IMAGE_PATH, RARITY_ORDER } from './constants.js';

// --- Navigation ---
/**
 * Shows the specified page and updates navigation links.
 * @param {string} pageId - The ID of the page container to show (e.g., 'page-inventory').
 */
export function showPage(pageId) {
    // Hide all page containers
    dom.pageContainers.forEach(container => {
        container.classList.remove('active-page');
    });

    // Show the target page container
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active-page');
        // Scroll main content area to top when changing pages
        if (dom.mainContent) {
            dom.mainContent.scrollTop = 0;
        }
    } else {
        console.error(`Page container with ID "${pageId}" not found.`);
        // Show default page as fallback?
        dom.pageCaseOpening?.classList.add('active-page');
        pageId = 'page-case-opening'; // Update pageId for link highlighting
    }

    // Update active state on navigation links
    dom.navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}


// --- Counter UI ---
/** Updates the counter display in the sidebar. */
export function updateCounterDisplay() {
    // Update the counter in the sidebar footer
    if (dom.caseCounterSidebarSpan) {
        dom.caseCounterSidebarSpan.textContent = state.totalCasesOpened.toLocaleString();
    }
    // Keep the original span update in case it's used elsewhere, though it's hidden now
     if (dom.caseCounterSpan) {
        dom.caseCounterSpan.textContent = state.totalCasesOpened.toLocaleString();
    }
}

// --- Roller UI ---
/**
 * Populates the roller track element with item divs.
 * @param {object[]} items - Array of item objects to display in the roller.
 */
export function populateRoller(items) {
    if (!dom.rollerTrack) return;
    dom.rollerTrack.innerHTML = ''; // Clear previous items
    items.forEach(item => {
        const div = document.createElement('div');
        const rarityClass = item.rarity?.toLowerCase().replace(/ /g, '-').replace('-spec', 'spec') || 'unknown';
        div.className = `roller-item rarity-${rarityClass}`;
        const name = item.rarity === "Gold" ? "?? Special Item ??" : (item.name || "Unknown");
        const alt = item.rarity === "Gold" ? "Special Item" : (item.name || "Unknown");
        const imgUrl = item.displayImageUrl || ERROR_IMAGE_PATH;
        div.innerHTML = `
            <img src="${imgUrl}" alt="${alt}" loading="lazy" onerror="this.src='${ERROR_IMAGE_PATH}'; this.alt='Error';">
            <span>${name}</span>`;
        dom.rollerTrack.appendChild(div);
    });
}

// --- Modal UI ---
/**
 * Displays the result item in the modal.
 * @param {object} item - The item object to display.
 */
export function displayResultModal(item) {
    if (!dom.modalBackdrop || !dom.resultName || !dom.resultImage || !dom.resultDetails || !dom.resultDisplay) return;
    let defaultTextColor = '#dde0e3';
    try {
        const computedStyle = getComputedStyle(document.documentElement);
        const cssVarValue = computedStyle.getPropertyValue('--color-text').trim();
        if (cssVarValue) defaultTextColor = cssVarValue;
    } catch (e) { console.warn("Could not get --color-text CSS variable:", e); }

    dom.resultName.style.color = item.rarity_color || defaultTextColor;
    dom.resultName.textContent = `${item.isStatTrak ? 'StatTrak™ ' : ''}${item.name || 'Unknown Item'}`;
    dom.resultImage.src = item.resultImageUrl || ERROR_IMAGE_PATH;
    dom.resultImage.alt = item.name || 'Unknown Item';
    dom.resultImage.onerror = function() { this.src = ERROR_IMAGE_PATH; console.error("Error loading result image:", item.resultImageUrl); };

    let detailsHtml = `
        <span><strong>Rarity:</strong> <span style="color:${item.rarity_color || '#fff'}; font-weight: bold;">${item.rarity || 'N/A'}</span></span>
        <span><strong>Wear:</strong> ${item.wearCondition || 'N/A'}</span>
        <span><strong>Float:</strong> ${item.floatValue || 'N/A'}</span>
        <span><strong>Pattern:</strong> ${item.paintSeed ?? 'N/A'}</span>`;
    if (item.isStatTrak) detailsHtml += `<span class="stattrak">StatTrak™</span>`;
    if (item.isBlueGem) {
        detailsHtml += `<span class="blue-gem">💎 BLUE GEM 💎</span>`;
        dom.resultDisplay.classList.add('blue-gem-result');
    } else {
        dom.resultDisplay.classList.remove('blue-gem-result');
    }
    dom.resultDetails.innerHTML = detailsHtml;
    dom.modalBackdrop.classList.remove('hidden');
    try { dom.closeResultButton?.focus(); } catch (e) { console.warn("Could not focus close button:", e); }
}

/** Hides the result modal. */
export function hideResultDisplay() {
    if (!dom.modalBackdrop) return;
    dom.modalBackdrop.classList.add('hidden');
}

// --- Inventory UI ---
/** Renders the inventory grid based on current filters and sort order. */
export function renderInventoryGrid() {
    if (!dom.inventoryGrid || !dom.emptyInventoryMessage || !dom.rarityFilter || !dom.sortOrder) return;

    dom.inventoryGrid.innerHTML = '';
    dom.emptyInventoryMessage.classList.toggle('hidden', state.inventory.length > 0);
    if (state.inventory.length === 0) return;

    const selectedRarity = dom.rarityFilter.value;
    let filteredInventory = state.inventory.filter(item => selectedRarity === 'all' || item.rarity === selectedRarity);

    const selectedSort = dom.sortOrder.value;
    filteredInventory.sort((a, b) => {
        switch (selectedSort) {
            case 'newest': return (b.timestamp || b.id) - (a.timestamp || a.id);
            case 'rarity_desc': return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
            case 'rarity_asc': return (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
            default: return 0;
        }
    });

    const fragment = document.createDocumentFragment();
    filteredInventory.forEach(item => {
        const itemCard = document.createElement('div');
        const rarityClass = item.rarity?.toLowerCase().replace('-spec', 'spec') || 'unknown';
        itemCard.className = `inventory-item-card rarity-${rarityClass}`;
        if (item.isBlueGem) itemCard.classList.add('has-blue-gem');
        itemCard.dataset.itemId = item.id;
        itemCard.tabIndex = 0;

        const itemNameClass = item.isStatTrak ? 'inventory-item-name stattrak' : 'inventory-item-name';
        const displayName = `${item.isStatTrak ? 'StatTrak™ ' : ''}${item.name || 'Unknown'}`;
        const floatDisplay = parseFloat(item.floatValue).toFixed(4);

        itemCard.innerHTML = `
            <div class="inventory-item-image-container">
                <img src="${item.resultImageUrl || ERROR_IMAGE_PATH}" alt="${item.name || 'Item'}" loading="lazy" onerror="this.src='${ERROR_IMAGE_PATH}'; this.alt='Error loading image';">
            </div>
            <div class="${itemNameClass}" title="${displayName}">${displayName}</div>
            <div class="inventory-item-details">
                <span class="detail-wear">${item.wearCondition || 'N/A'}</span>
                <span class="detail-float" title="Float: ${item.floatValue}">F: ${floatDisplay}</span>
                <span class="detail-seed" title="Pattern Index: ${item.paintSeed ?? 'N/A'}">P: ${item.paintSeed ?? 'N/A'}</span>
                ${item.isBlueGem ? '<span class="blue-gem" title="Blue Gem!">BG</span>' : ''}
            </div>`;

        itemCard.addEventListener('click', () => handleInventoryItemClick(item.id));
        itemCard.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleInventoryItemClick(item.id);
            }
        });
        fragment.appendChild(itemCard);
    });
    dom.inventoryGrid.appendChild(fragment);
}

/** Handles clicking on an inventory item card. */
function handleInventoryItemClick(itemId) {
     const clickedItemData = state.inventory.find(invItem => invItem.id === itemId);
     if (clickedItemData) {
         displayResultModal(clickedItemData); // Use the modal display function
     } else {
         console.error("Could not find inventory item data for ID:", itemId);
     }
}

// --- Open Until UI ---
/** Populates the target item dropdown select. */
export function populateTargetItemSelect() {
    if (!dom.targetItemSelect) return;
    const fragment = document.createDocumentFragment();
    WEAPON_CASE_1.items
        .filter(item => !item.is_knife && item.name)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;
            option.textContent = item.name;
            fragment.appendChild(option);
        });
    dom.targetItemSelect.appendChild(fragment);
}

/** Updates the status message in the "Open Until" panel. */
export function updateOpenUntilStatus(message, type = '') {
    if (!dom.openUntilStatus) return;
    dom.openUntilStatus.textContent = message;
    dom.openUntilStatus.className = 'open-until-status'; // Reset classes
    if (type) dom.openUntilStatus.classList.add(type);
}

/** Toggles the enabled/disabled state of Open Until settings controls and main action buttons. */
export function toggleOpenUntilControls(enable) {
    // Toggle controls within the panel/accordions
    const panelControls = [
        dom.targetItemSelect, dom.targetWearSelect, dom.targetStatTrakSelect,
        dom.targetSeedInput, dom.openSpeedSlider
    ];
    panelControls.forEach(el => { if (el) el.disabled = !enable; });

    // Toggle main action buttons outside the panel
    const mainActionButtons = [
        dom.openCaseButton, dom.quickOpenButton, dom.toggleOpenUntilButton
    ];
     mainActionButtons.forEach(el => { if (el) el.disabled = !enable; });


    // Handle start/stop button visibility/state within the panel
    if (dom.startOpenUntilButton && dom.stopOpenUntilButton) {
        dom.startOpenUntilButton.classList.toggle('hidden', !enable);
        dom.stopOpenUntilButton.classList.toggle('hidden', enable);
        // Start button should be enabled only when controls are generally enabled AND not already opening
        dom.startOpenUntilButton.disabled = !enable || state.isOpening;
    }
}

/** Updates the ARIA attributes for accordion headers. */
export function updateAccordionARIA() {
    dom.accordionHeaders?.forEach(header => {
        const detailsElement = header.parentElement;
        if (detailsElement) {
             header.setAttribute('aria-expanded', detailsElement.open);
        }
    });
}
