import * as dom from './dom.js';
import { state } from './state.js';
import { WEAPON_CASE_1, ERROR_IMAGE_PATH, RARITY_ORDER } from './constants.js';

// --- Navigation ---
/** Shows the specified page and updates navigation links. */
export function showPage(pageId) {
    dom.pageContainers.forEach(container => container.classList.remove('active-page'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active-page');
        if (dom.mainContent) dom.mainContent.scrollTop = 0;
    } else {
        console.error(`Page container with ID "${pageId}" not found.`);
        dom.pageCaseOpening?.classList.add('active-page'); // Fallback
        pageId = 'page-case-opening';
    }
    dom.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
}

// --- Save Status UI ---
/** Updates the save status indicator in the sidebar footer. */
export function updateSaveStatus() {
     if (dom.saveStatusTextSpan) {
        dom.saveStatusTextSpan.textContent = 'Saved Locally';
        dom.saveStatusTextSpan.style.color = 'var(--color-text-muted)';
    }
}

// --- Counter UI ---
/** Updates the counter display in the sidebar. */
export function updateCounterDisplay() {
    const count = state.totalCasesOpened.toLocaleString();
    if (dom.caseCounterSidebarSpan) dom.caseCounterSidebarSpan.textContent = count;
}

// --- Roller UI ---

/** Creates the HTML structure for a single roller instance. */
function createRollerElement(idSuffix) {
    const container = document.createElement('div');
    container.className = 'roller-container';
    container.id = `rollerContainer_${idSuffix}`;
    const track = document.createElement('div');
    track.className = 'roller-track';
    track.id = `rollerTrack_${idSuffix}`;
    const marker = document.createElement('div');
    marker.className = 'center-marker';
    container.appendChild(track);
    container.appendChild(marker);
    return container;
}

/** Clears existing rollers and creates new ones for multi-open. */
export function setupMultiRollers(count) {
    if (!dom.multiRollerSection) return;
    console.log(`Setting up ${count} rollers.`);
    dom.multiRollerSection.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const rollerElement = createRollerElement(i);
        dom.multiRollerSection.appendChild(rollerElement);
    }
}

/** Populates a specific roller track with item divs. */
export function populateRoller(items, idSuffix) {
    const rollerTrack = document.getElementById(`rollerTrack_${idSuffix}`);
    if (!rollerTrack) return;
    rollerTrack.innerHTML = '';
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const div = document.createElement('div');
        const rarityClass = item.rarity?.toLowerCase().replace(/ /g, '-').replace('-spec', 'spec') || 'unknown';
        div.className = `roller-item rarity-${rarityClass}`;
        const name = item.rarity === "Gold" ? "?? Special Item ??" : (item.name || "Unknown");
        const alt = item.rarity === "Gold" ? "Special Item" : (item.name || "Unknown");
        const imgUrl = item.displayImageUrl || ERROR_IMAGE_PATH;
        div.innerHTML = `<img src="${imgUrl}" alt="${alt}" loading="lazy" onerror="this.src='${ERROR_IMAGE_PATH}'; this.alt='Error';"><span>${name}</span>`;
        fragment.appendChild(div);
    });
    rollerTrack.appendChild(fragment);
}

// --- Result List Area UI ---

/** Displays multiple results in the vertical list area, sorted by rarity. */
export function displayResults(items) {
    if (!dom.resultListArea || !dom.resultList) return;

    dom.resultList.innerHTML = ''; // Clear previous results
    if (!items || items.length === 0) {
         dom.resultList.innerHTML = '<li class="result-list-placeholder">No items opened in the last action.</li>';
        return;
    }
    console.log(`Displaying ${items.length} results in list.`);

    // Sort items by rarity descending before displaying
    const sortedItems = items.slice().sort((a, b) => {
        return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
    });

    const fragment = document.createDocumentFragment();
    sortedItems.forEach(item => {
        const listItem = createResultListItem(item);
        fragment.appendChild(listItem);
    });

    dom.resultList.appendChild(fragment);
    dom.resultList.scrollTop = 0; // Scroll list to top
}

/** Creates a single result list item (<li>) element. */
function createResultListItem(item) {
    const listItem = document.createElement('li');
    const rarityClass = item.rarity?.toLowerCase().replace('-spec', 'spec') || 'unknown';
    listItem.className = `result-list-item rarity-${rarityClass}`;
    listItem.classList.toggle('blue-gem-result', !!item.isBlueGem);
    const itemNameClass = item.isStatTrak ? 'result-list-name stattrak' : 'result-list-name';
    const displayName = `${item.isStatTrak ? 'StatTrak™ ' : ''}${item.name || 'Unknown'}`;
    const floatDisplay = parseFloat(item.floatValue).toFixed(4);
    const wearShort = item.wearCondition?.replace('Factory New', 'FN').replace('Minimal Wear', 'MW').replace('Field-Tested', 'FT').replace('Well-Worn', 'WW').replace('Battle-Scarred', 'BS') || 'N/A';
    listItem.innerHTML = `
        <img src="${item.resultImageUrl || ERROR_IMAGE_PATH}" alt="${item.name || 'Item'}" class="result-list-image" loading="lazy" onerror="this.src='${ERROR_IMAGE_PATH}'; this.alt='Error';">
        <div class="result-list-info">
            <span class="${itemNameClass}" title="${displayName}">${displayName}</span>
            <span class="result-list-details" title="Float: ${item.floatValue} | Pattern: ${item.paintSeed ?? 'N/A'}">
                ${wearShort} | F: ${floatDisplay} | P: ${item.paintSeed ?? 'N/A'}
            </span>
        </div>`;
    return listItem;
}

/** Clears the result list area. */
export function hideResultDisplay() {
    if (dom.resultList) {
        dom.resultList.innerHTML = '<li class="result-list-placeholder">Open a case to see results here...</li>';
    }
}

// --- Inventory Item Popup Modal ---

/** Shows the item popup modal with details of the clicked item. */
export function showItemPopup(item) {
    if (!dom.itemPopupBackdrop || !dom.itemPopupCard || !dom.itemPopupImage || !dom.itemPopupName || !dom.itemPopupDetails) return;

    // Populate content
    dom.itemPopupImage.src = item.resultImageUrl || ERROR_IMAGE_PATH;
    dom.itemPopupImage.alt = item.name || 'Item Image';
    dom.itemPopupName.textContent = `${item.isStatTrak ? 'StatTrak™ ' : ''}${item.name || 'Unknown Item'}`;
    dom.itemPopupName.style.color = item.rarity_color || 'var(--color-text)'; // Use rarity color

    let detailsHtml = `
        <span><strong>Rarity:</strong> <span style="color:${item.rarity_color || '#fff'}; font-weight: bold;">${item.rarity || 'N/A'}</span></span>
        <span><strong>Wear:</strong> ${item.wearCondition || 'N/A'}</span>
        <span><strong>Float:</strong> ${item.floatValue || 'N/A'}</span>
        <span><strong>Pattern:</strong> ${item.paintSeed ?? 'N/A'}</span>
    `;
    if (item.isStatTrak) detailsHtml += `<span class="stattrak">StatTrak™</span>`;
    if (item.isBlueGem) detailsHtml += `<span class="blue-gem">💎 BLUE GEM 💎</span>`;
    dom.itemPopupDetails.innerHTML = detailsHtml;

    // Add/Remove blue gem glow class on the card itself
    dom.itemPopupCard.classList.toggle('blue-gem-result', !!item.isBlueGem);

    // Show modal
    dom.itemPopupBackdrop.classList.remove('hidden');
    try { dom.closeItemPopupButton?.focus(); } catch(e) {} // Focus close button
}

/** Hides the item popup modal. */
export function hideItemPopup() {
    dom.itemPopupBackdrop?.classList.add('hidden');
}


// --- Inventory UI ---
/** Renders the inventory grid for the current page based on filters and sort order. */
export function renderInventoryGrid() {
    if (!dom.inventoryGrid || !dom.emptyInventoryMessage || !dom.rarityFilter || !dom.sortOrder || !dom.wearFilter || !dom.statTrakFilter || !dom.filterNameInput) return;

    dom.inventoryGrid.innerHTML = ''; // Clear previous page's items

    // --- Filtering ---
    const selectedRarity = dom.rarityFilter.value;
    const selectedWear = dom.wearFilter.value;
    const selectedStatTrak = dom.statTrakFilter.value;
    const nameFilter = dom.filterNameInput.value.toLowerCase().trim();
    let filteredInventory = state.inventory.filter(item => {
        if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
        if (selectedWear !== 'all') {
            if (selectedWear === 'Vanilla') { if (!item.is_knife || item.finish !== 'Vanilla') return false; }
            else { if (item.wearCondition !== selectedWear) return false; }
        }
        if (selectedStatTrak !== 'all') {
            const isStat = item.isStatTrak === true;
            if (selectedStatTrak === 'yes' && !isStat) return false;
            if (selectedStatTrak === 'no' && isStat) return false;
        }
        if (nameFilter && !(item.name || '').toLowerCase().includes(nameFilter)) return false;
        return true;
    });

    // Update empty message based on filtered results
    dom.emptyInventoryMessage.classList.toggle('hidden', filteredInventory.length > 0);

    // --- Sorting ---
    const selectedSort = dom.sortOrder.value;
    filteredInventory.sort((a, b) => {
        switch (selectedSort) {
            case 'newest': return (b.timestamp || b.id) - (a.timestamp || a.id);
            case 'rarity_desc': return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
            case 'rarity_asc': return (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
            case 'float_asc': return (parseFloat(a.floatValue) || 0) - (parseFloat(b.floatValue) || 0);
            case 'float_desc': return (parseFloat(b.floatValue) || 0) - (parseFloat(a.floatValue) || 0);
            default: return 0;
        }
    });

    // --- Pagination Calculation ---
    const totalItems = filteredInventory.length;
    const totalPages = Math.ceil(totalItems / state.inventoryItemsPerPage);
    // Ensure currentPage is valid
    if (state.inventoryCurrentPage > totalPages) {
        state.inventoryCurrentPage = totalPages || 1;
    }
    if (state.inventoryCurrentPage < 1) {
        state.inventoryCurrentPage = 1;
    }
    const startIndex = (state.inventoryCurrentPage - 1) * state.inventoryItemsPerPage;
    const endIndex = startIndex + state.inventoryItemsPerPage;
    const itemsToDisplay = filteredInventory.slice(startIndex, endIndex);

    // --- Rendering Items for Current Page ---
    if (itemsToDisplay.length > 0) {
        const fragment = document.createDocumentFragment();
        itemsToDisplay.forEach(item => {
            const itemCard = createInventoryItemCard(item); // Use helper function
            fragment.appendChild(itemCard);
        });
        dom.inventoryGrid.appendChild(fragment);
    }

    // --- Update Pagination Controls ---
    updatePaginationControls(totalItems, totalPages);
}

/** Updates the pagination controls (buttons, page info). */
function updatePaginationControls(totalItems, totalPages) {
    if (!dom.inventoryPagination || !dom.pageInfo || !dom.prevPageButton || !dom.nextPageButton) return;

    if (totalPages <= 1) {
        dom.inventoryPagination.classList.add('hidden'); // Hide if only one page or empty
        return;
    }

    dom.inventoryPagination.classList.remove('hidden');
    dom.pageInfo.textContent = `Page ${state.inventoryCurrentPage} of ${totalPages}`;
    dom.prevPageButton.disabled = state.inventoryCurrentPage <= 1;
    dom.nextPageButton.disabled = state.inventoryCurrentPage >= totalPages;
}


/** Creates a single inventory item card element. */
function createInventoryItemCard(item) {
    const itemCard = document.createElement('div');
    const rarityClass = item.rarity?.toLowerCase().replace('-spec', 'spec') || 'unknown';
    itemCard.className = `inventory-item-card rarity-${rarityClass}`;
    itemCard.classList.toggle('has-blue-gem', !!item.isBlueGem);
    itemCard.dataset.itemId = item.id; itemCard.tabIndex = 0;
    const itemNameClass = item.isStatTrak ? 'inventory-item-name stattrak' : 'inventory-item-name';
    const displayName = `${item.isStatTrak ? 'StatTrak™ ' : ''}${item.name || 'Unknown'}`;
    const floatDisplay = parseFloat(item.floatValue).toFixed(4);
    itemCard.innerHTML = `<div class="inventory-item-image-container"><img src="${item.resultImageUrl || ERROR_IMAGE_PATH}" alt="${item.name || 'Item'}" loading="lazy" onerror="this.src='${ERROR_IMAGE_PATH}'; this.alt='Error';"></div><div class="${itemNameClass}" title="${displayName}">${displayName}</div><div class="inventory-item-details"><span class="detail-wear">${item.wearCondition || 'N/A'}</span><span class="detail-float" title="Float: ${item.floatValue}">F: ${floatDisplay}</span><span class="detail-seed" title="Pattern Index: ${item.paintSeed ?? 'N/A'}">P: ${item.paintSeed ?? 'N/A'}</span>${item.isBlueGem ? '<span class="blue-gem" title="Blue Gem!">BG</span>' : ''}</div>`;
    // *** MODIFIED: Click listener now opens the item popup modal ***
    itemCard.addEventListener('click', () => handleInventoryItemClick(item.id));
    itemCard.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInventoryItemClick(item.id); } });
    return itemCard;
}

/** Handles clicking on an inventory item card - shows item popup modal. */
function handleInventoryItemClick(itemId) {
     const clickedItemData = state.inventory.find(invItem => invItem.id === itemId);
     if (clickedItemData) {
         showItemPopup(clickedItemData); // Show the dedicated popup
     } else {
         console.error("Inventory item data not found for ID:", itemId);
     }
}


// --- Open Until UI ---
/** Populates the target item dropdown select. */
export function populateTargetItemSelect() { if (!dom.targetItemSelect) return; const fragment = document.createDocumentFragment(); WEAPON_CASE_1.items.filter(item => !item.is_knife && item.name).sort((a, b) => a.name.localeCompare(b.name)).forEach(item => { const option = document.createElement('option'); option.value = item.name; option.textContent = item.name; fragment.appendChild(option); }); dom.targetItemSelect.appendChild(fragment); }
/** Updates the status message in the "Open Until" panel. */
export function updateOpenUntilStatus(message, type = '') { if (!dom.openUntilStatus) return; dom.openUntilStatus.textContent = message; dom.openUntilStatus.className = 'open-until-status'; if (type) dom.openUntilStatus.classList.add(type); }
/** Toggles the enabled/disabled state of controls. */
export function toggleOpenUntilControls(enable) { const panelControls = [dom.targetItemSelect, dom.targetWearSelect, dom.targetStatTrakSelect, dom.targetSeedInput, dom.openSpeedSlider]; panelControls.forEach(el => { if (el) el.disabled = !enable; }); const mainActionButtons = [dom.openCaseButton, dom.quickOpenButton, dom.toggleOpenUntilButton, dom.multiOpenCountInput]; mainActionButtons.forEach(el => { if (el) el.disabled = !enable; }); if (dom.startOpenUntilButton && dom.stopOpenUntilButton) { dom.startOpenUntilButton.classList.toggle('hidden', !enable); dom.stopOpenUntilButton.classList.toggle('hidden', enable); dom.startOpenUntilButton.disabled = !enable || state.isOpening; } }
/** Updates the ARIA attributes for accordion headers. */
export function updateAccordionARIA() { dom.accordionHeaders?.forEach(header => { const detailsElement = header.parentElement; if (detailsElement) header.setAttribute('aria-expanded', detailsElement.open); }); }

// --- Settings UI ---
/** Applies loaded settings to the UI elements. */
export function applySettingsToUI() {
    if (dom.settingAnimationToggle) {
        dom.settingAnimationToggle.checked = state.settings.playAnimation;
    }
     if (dom.settingDefaultOpenSpeed) {
        dom.settingDefaultOpenSpeed.value = state.settings.defaultOpenSpeed;
    }
     if (dom.settingSpeedValueSpan) {
        dom.settingSpeedValueSpan.textContent = state.settings.defaultOpenSpeed;
    }
    // Apply to the actual open until slider as well
     if (dom.openSpeedSlider) {
        dom.openSpeedSlider.value = state.settings.defaultOpenSpeed;
    }
    if (dom.speedValueSpan) {
         dom.speedValueSpan.textContent = state.settings.defaultOpenSpeed;
    }
}
