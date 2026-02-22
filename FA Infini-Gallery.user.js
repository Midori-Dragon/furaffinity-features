// ==UserScript==
// @name        FA Infini-Gallery
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @require     https://greasyfork.org/scripts/483952-furaffinity-request-helper/code/483952-furaffinity-request-helper.js
// @require     https://greasyfork.org/scripts/485827-furaffinity-match-list/code/485827-furaffinity-match-list.js
// @require     https://greasyfork.org/scripts/485153-furaffinity-loading-animations/code/485153-furaffinity-loading-animations.js
// @require     https://greasyfork.org/scripts/475041-furaffinity-custom-settings/code/475041-furaffinity-custom-settings.js
// @grant       GM_info
// @version     2.2.7
// @author      Midori Dragon
// @description Automatically loads the next page of the gallery as you reach the bottom
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/462632-fa-infini-gallery
// @supportURL  https://greasyfork.org/scripts/462632-fa-infini-gallery/feedback
// ==/UserScript==
// jshint esversion: 11
(function (exports) {
    'use strict';

    function createSeparatorElem(pageNo) {
        // Create the main container for the separator
        const nextPageDescContainer = document.createElement('div');
        nextPageDescContainer.className = 'folder-description';
        nextPageDescContainer.style.marginTop = '6px';
        nextPageDescContainer.style.marginBottom = '6px';
        // Create the inner container for the page description
        const nextPageDesc = document.createElement('div');
        nextPageDesc.className = 'container-item-top';
        // Create the text element for the page number
        const nextPageDescText = document.createElement('h3');
        const regex = /%page%/g;
        const pageString = pageSeparatorTextSetting.value.replace(regex, pageNo.toString());
        nextPageDescText.textContent = pageString;
        // Append text element to the inner container
        nextPageDesc.appendChild(nextPageDescText);
        // Append inner container to the main container
        nextPageDescContainer.appendChild(nextPageDesc);
        // Return the complete separator element
        return nextPageDescContainer;
    }
    function getFiguresFromPage(page) {
        const figures = page.querySelectorAll('figure[class*="t"]');
        return figures == null ? [] : Array.from(figures).map(figure => figure);
    }
    function getUserNameFromUrl(url) {
        if (url.includes('?')) {
            url = url.substring(0, url.indexOf('?'));
        }
        url = url.trimEnd('/');
        return url.substring(url.lastIndexOf('/') + 1);
    }
    function isElementOnScreen(element) {
        // Get the bounding rectangle of the element
        const rect = element.getBoundingClientRect();
        // Calculate the window height, considering both window and document height
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight) * 2;
        // Check if the element is within the visible area of the screen
        return (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    }

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Error"] = 1] = "Error";
        LogLevel[LogLevel["Warning"] = 2] = "Warning";
        LogLevel[LogLevel["Info"] = 3] = "Info";
    })(LogLevel || (LogLevel = {}));
    class Logger {
        static log(logLevel = LogLevel.Warning, ...args) {
            if (window.__FF_GLOBAL_LOG_LEVEL__ == null) {
                window.__FF_GLOBAL_LOG_LEVEL__ = LogLevel.Error;
            }
            if (logLevel > window.__FF_GLOBAL_LOG_LEVEL__) {
                return;
            }
            switch (logLevel) {
                case LogLevel.Error:
                    console.error(...args);
                    break;
                case LogLevel.Warning:
                    console.warn(...args);
                    break;
                case LogLevel.Info:
                    console.log(...args);
                    break;
            }
        }
        static setLogLevel(logLevel) {
            window.__FF_GLOBAL_LOG_LEVEL__ = logLevel;
        }
        static logError(...args) {
            Logger.log(LogLevel.Error, ...args);
        }
        static logWarning(...args) {
            Logger.log(LogLevel.Warning, ...args);
        }
        static logInfo(...args) {
            Logger.log(LogLevel.Info, ...args);
        }
    }

    class BrowsePage {
        pageNo;
        gallery;
        constructor(pageNo) {
            this.pageNo = pageNo;
            this.gallery = document.querySelector('section[id*="gallery"]');
        }
        async getPage() {
            Logger.logInfo(`Getting page BrowsePage '${this.pageNo}'`);
            const page = await requestHelper.UserRequests.SearchRequests.Browse.getPage(this.pageNo, this.getBrowseOptions());
            return page;
        }
        getBrowseOptions() {
            const currBrowseOptions = requestHelper.UserRequests.SearchRequests.Browse.newBrowseOptions;
            const sideBar = document.getElementById('sidebar-options');
            // Get the option containers
            const optionContainers = sideBar?.querySelectorAll('div[class*="browse-search-flex-item"]');
            for (const optionContainer of Array.from(optionContainers ?? [])) {
                try {
                    // Get the name of the option from the strong element
                    let optionName = optionContainer?.querySelector('strong')?.textContent?.toLowerCase() ?? '';
                    optionName = optionName.trimEnd(':');
                    // Get the value of the option from the selected option element
                    const optionValue = optionContainer?.querySelector('option[selected]')?.getAttribute('value');
                    // Set the option in the browse options object
                    if (optionValue == null) {
                        continue;
                    }
                    switch (optionName) {
                        case 'category':
                            currBrowseOptions.category = parseInt(optionValue);
                            break;
                        case 'type':
                            currBrowseOptions.type = parseInt(optionValue);
                            break;
                        case 'species':
                            currBrowseOptions.species = parseInt(optionValue);
                            break;
                        case 'gender':
                            currBrowseOptions.gender = optionValue;
                            break;
                        case 'results':
                            currBrowseOptions.perPage = parseInt(optionValue);
                            break;
                        case 'ratingGeneral':
                            currBrowseOptions.ratingGeneral = optionValue === 'true';
                            break;
                        case 'ratingMature':
                            currBrowseOptions.ratingMature = optionValue === 'true';
                            break;
                        case 'ratingAdult':
                            currBrowseOptions.ratingAdult = optionValue === 'true';
                            break;
                    }
                }
                catch { }
            }
            // Get the checkbox elements
            const checkBoxes = sideBar?.querySelectorAll('input[type="checkbox"]');
            for (const checkbox of Array.from(checkBoxes ?? [])) {
                // Set the option in the browse options object
                switch (checkbox.getAttribute('name')) {
                    case 'rating_general':
                        currBrowseOptions.ratingGeneral = checkbox.hasAttribute('checked');
                        break;
                    case 'rating_mature':
                        currBrowseOptions.ratingMature = checkbox.hasAttribute('checked');
                        break;
                    case 'rating_adult':
                        currBrowseOptions.ratingAdult = checkbox.hasAttribute('checked');
                        break;
                }
            }
            return currBrowseOptions;
        }
        async loadPage(prevFigures) {
            const page = await this.getPage();
            if (page == null) {
                throw new Error('No page found');
            }
            prevFigures ??= [];
            const prevSids = prevFigures.map(figure => figure.id);
            let figures = getFiguresFromPage(page);
            figures = figures.filter(figure => !prevSids.includes(figure.id));
            if (figures.length !== 0) {
                // Check if we should show a page separator
                if (showPageSeparatorSetting.value) {
                    const separator = createSeparatorElem(this.pageNo);
                    this.gallery.appendChild(separator);
                }
                // Add the figures to the gallery
                for (const figure of figures) {
                    this.gallery.appendChild(figure);
                }
            }
            else {
                throw new Error('No figures found');
            }
            window.dispatchEvent(new CustomEvent('ei-update-embedded')); //Embedded Image Viewer Integration
            return figures;
        }
    }

    class FavoritesPage {
        dataFavId;
        pageNo;
        gallery;
        constructor(dataFavId, pageNo) {
            this.dataFavId = dataFavId;
            this.pageNo = pageNo;
            this.gallery = document.querySelector('section[id*="gallery"]');
        }
        async getPage() {
            Logger.logInfo(`Getting page FavoritesPage '${this.pageNo}'`);
            const username = getUserNameFromUrl(window.location.toString());
            const page = await requestHelper.UserRequests.GalleryRequests.Favorites.getPage(username, this.dataFavId);
            return page;
        }
        async loadPage(prevFigures) {
            const page = await this.getPage();
            if (page == null) {
                throw new Error('No page found');
            }
            prevFigures ??= [];
            const prevSids = prevFigures.map(figure => figure.id);
            let figures = getFiguresFromPage(page);
            figures = figures.filter(figure => !prevSids.includes(figure.id));
            if (figures.length !== 0) {
                // Check if on last page
                if (this.dataFavId === figures[figures.length - 1].getAttribute('data-fav-id')) {
                    throw new Error('Last page reached');
                }
                // Check if we should show a page separator
                if (showPageSeparatorSetting.value) {
                    const separator = createSeparatorElem(this.pageNo);
                    this.gallery.appendChild(separator);
                }
                // Add the figures to the gallery
                for (const figure of figures) {
                    this.gallery.appendChild(figure);
                }
            }
            else {
                throw new Error('No figures found');
            }
            window.dispatchEvent(new CustomEvent('ei-update-embedded')); //Embedded Image Viewer Integration
            return figures;
        }
    }

    class GalleryPage {
        pageNo;
        gallery;
        isInFolder;
        constructor(pageNo) {
            this.pageNo = pageNo;
            this.gallery = document.querySelector('section[id*="gallery"]');
            this.isInFolder = window.location.toString().includes('/folder/');
        }
        async getPage() {
            Logger.logInfo(`Getting page GalleryPage '${this.pageNo}'`);
            const username = getUserNameFromUrl(window.location.toString());
            let page;
            if (this.isInFolder === true) {
                let folderId;
                page = await requestHelper.UserRequests.GalleryRequests.Gallery.getPageInFolder(username, folderId, this.pageNo);
            }
            else {
                page = await requestHelper.UserRequests.GalleryRequests.Gallery.getPage(username, this.pageNo);
            }
            return page;
        }
        async loadPage(prevFigures) {
            const page = await this.getPage();
            if (page == null) {
                throw new Error('No page found');
            }
            prevFigures ??= [];
            const prevSids = prevFigures.map(figure => figure.id);
            let figures = getFiguresFromPage(page);
            figures = figures.filter(figure => !prevSids.includes(figure.id));
            if (figures.length !== 0) {
                // Check if we should show a page separator
                if (showPageSeparatorSetting.value) {
                    const separator = createSeparatorElem(this.pageNo);
                    this.gallery.appendChild(separator);
                }
                // Add the figures to the gallery
                for (const figure of figures) {
                    this.gallery.appendChild(figure);
                }
            }
            else {
                throw new Error('No figures found');
            }
            window.dispatchEvent(new CustomEvent('ei-update-embedded')); //Embedded Image Viewer Integration
            return figures;
        }
    }

    class ScrapsPage {
        pageNo;
        gallery;
        constructor(pageNo) {
            this.pageNo = pageNo;
            this.gallery = document.querySelector('section[id*="gallery"]');
        }
        async getPage() {
            Logger.logInfo(`Getting page ScrapsPage '${this.pageNo}'`);
            const username = getUserNameFromUrl(window.location.toString());
            const page = await requestHelper.UserRequests.GalleryRequests.Scraps.getPage(username, this.pageNo);
            return page;
        }
        async loadPage(prevFigures) {
            const page = await this.getPage();
            if (page == null) {
                throw new Error('No page found');
            }
            prevFigures ??= [];
            const prevSids = prevFigures.map(figure => figure.id);
            let figures = getFiguresFromPage(page);
            figures = figures.filter(figure => !prevSids.includes(figure.id));
            if (figures.length !== 0) {
                // Check if we should show a page separator
                if (showPageSeparatorSetting.value) {
                    const separator = createSeparatorElem(this.pageNo);
                    this.gallery.appendChild(separator);
                }
                // Add the figures to the gallery
                for (const figure of figures) {
                    this.gallery.appendChild(figure);
                }
            }
            else {
                throw new Error('No figures found');
            }
            window.dispatchEvent(new CustomEvent('ei-update-embedded')); //Embedded Image Viewer Integration
            return figures;
        }
    }

    class SearchPage {
        pageNo;
        gallery;
        constructor(pageNo) {
            this.pageNo = pageNo;
            this.gallery = document.querySelector('section[id*="gallery"]');
        }
        async getPage() {
            Logger.logInfo(`Getting page SearchPage '${this.pageNo}'`);
            const page = await requestHelper.UserRequests.SearchRequests.Search.getPage(this.pageNo, this.getSearchOptionsNew());
            return page;
        }
        getSearchOptionsNew() {
            const searchOptions = requestHelper.UserRequests.SearchRequests.Search.newSearchOptions;
            const sideBarOptions = document.getElementById('sidebar-options');
            if (sideBarOptions == null) {
                return searchOptions;
            }
            const searchInput = sideBarOptions.querySelector('textarea[class*="search-query"]');
            if (searchInput != null && searchInput instanceof HTMLTextAreaElement) {
                searchOptions.input = searchInput.value;
            }
            const searchContainer = document.getElementById('search-advanced');
            if (searchContainer == null) {
                return searchOptions;
            }
            // Get the option values
            const options = searchContainer.querySelectorAll('option[selected]');
            for (const option of Array.from(options)) {
                let name = option.parentElement?.getAttribute('name');
                name ??= option.parentElement?.parentElement?.getAttribute('name');
                const value = option.getAttribute('value');
                if (value == null) {
                    continue;
                }
                switch (name) {
                    case 'order-by':
                        searchOptions.orderBy = value;
                        break;
                    case 'order-direction':
                        searchOptions.orderDirection = value;
                        break;
                    case 'perpage':
                        searchOptions.perPage = parseInt(value);
                        break;
                    case 'category':
                        searchOptions.category = parseInt(value);
                        break;
                    case 'arttype':
                        searchOptions.type = parseInt(value);
                        break;
                    case 'species':
                        searchOptions.species = parseInt(value);
                        break;
                }
            }
            // Get the radio button values
            const radioButtons = searchContainer.querySelectorAll('input[type="radio"][checked]');
            for (const radioButton of Array.from(radioButtons)) {
                const name = radioButton.getAttribute('name');
                const value = radioButton.getAttribute('value');
                switch (name) {
                    case 'range':
                        searchOptions.range = value ?? undefined;
                        if (value === 'manual') {
                            const rangeContainer = searchContainer.querySelector('div[class*="jsManualRangeContainer"]');
                            const rangeFrom = rangeContainer?.querySelector('input[type="date"][name="range_from"]');
                            searchOptions.rangeFrom = rangeFrom?.getAttribute('value') ?? undefined;
                            const rangeTo = rangeContainer?.querySelector('input[type="date"][name="range_to"]');
                            searchOptions.rangeTo = rangeTo?.getAttribute('value') ?? undefined;
                        }
                        break;
                    case 'mode':
                        searchOptions.matching = value ?? undefined;
                        break;
                }
            }
            // Get the checkbox values
            const checkBoxes = searchContainer?.querySelectorAll('input[type="checkbox"]');
            for (const checkBox of Array.from(checkBoxes ?? [])) {
                switch (checkBox.getAttribute('name')) {
                    case 'rating-general':
                        searchOptions.ratingGeneral = checkBox.hasAttribute('checked');
                        break;
                    case 'rating-mature':
                        searchOptions.ratingMature = checkBox.hasAttribute('checked');
                        break;
                    case 'rating-adult':
                        searchOptions.ratingAdult = checkBox.hasAttribute('checked');
                        break;
                    case 'type-art':
                        searchOptions.typeArt = checkBox.hasAttribute('checked');
                        break;
                    case 'type-music':
                        searchOptions.typeMusic = checkBox.hasAttribute('checked');
                        break;
                    case 'type-flash':
                        searchOptions.typeFlash = checkBox.hasAttribute('checked');
                        break;
                    case 'type-story':
                        searchOptions.typeStory = checkBox.hasAttribute('checked');
                        break;
                    case 'type-photo':
                        searchOptions.typePhotos = checkBox.hasAttribute('checked');
                        break;
                    case 'type-poetry':
                        searchOptions.typePoetry = checkBox.hasAttribute('checked');
                        break;
                }
            }
            return searchOptions;
        }
        getSearchOptions() {
            const searchOptions = requestHelper.UserRequests.SearchRequests.Search.newSearchOptions;
            // Get the input value
            const input = document.getElementById('q');
            searchOptions.input = input?.getAttribute('value') ?? '';
            // Get the selected options
            const searchContainer = document.getElementById('search-advanced');
            const options = searchContainer?.querySelectorAll('option[selected]');
            for (const option of Array.from(options ?? [])) {
                const name = option.parentNode.getAttribute('name');
                const value = option.getAttribute('value');
                switch (name) {
                    case 'order-by':
                        searchOptions.orderBy = value ?? undefined;
                        break;
                    case 'order-direction':
                        searchOptions.orderDirection = value ?? undefined;
                        break;
                }
            }
            // Get the selected radio buttons
            const radioButtons = searchContainer?.querySelectorAll('input[type="radio"][checked]');
            for (const radioButton of Array.from(radioButtons ?? [])) {
                const name = radioButton.getAttribute('name');
                const value = radioButton.getAttribute('value');
                switch (name) {
                    case 'range':
                        searchOptions.range = value ?? undefined;
                        break;
                    case 'mode':
                        searchOptions.matching = value ?? undefined;
                        break;
                }
                if (value === 'manual') {
                    // Get the range values
                    const rangeFrom = searchContainer?.querySelector('input[type="date"][name="range_from"]');
                    searchOptions.rangeFrom = rangeFrom?.getAttribute('value') ?? undefined;
                    const rangeTo = searchContainer?.querySelector('input[type="date"][name="range_to"]');
                    searchOptions.rangeTo = rangeTo?.getAttribute('value') ?? undefined;
                }
            }
            // Get the selected checkboxes
            const checkBoxes = searchContainer?.querySelectorAll('input[type="checkbox"]');
            for (const checkBox of Array.from(checkBoxes ?? [])) {
                switch (checkBox.getAttribute('name')) {
                    case 'rating-general':
                        searchOptions.ratingGeneral = checkBox.hasAttribute('checked');
                        break;
                    case 'rating-mature':
                        searchOptions.ratingMature = checkBox.hasAttribute('checked');
                        break;
                    case 'rating-adult':
                        searchOptions.ratingAdult = checkBox.hasAttribute('checked');
                        break;
                    case 'type-art':
                        searchOptions.typeArt = checkBox.hasAttribute('checked');
                        break;
                    case 'type-music':
                        searchOptions.typeMusic = checkBox.hasAttribute('checked');
                        break;
                    case 'type-flash':
                        searchOptions.typeFlash = checkBox.hasAttribute('checked');
                        break;
                    case 'type-story':
                        searchOptions.typeStory = checkBox.hasAttribute('checked');
                        break;
                    case 'type-photo':
                        searchOptions.typePhotos = checkBox.hasAttribute('checked');
                        break;
                    case 'type-poetry':
                        searchOptions.typePoetry = checkBox.hasAttribute('checked');
                        break;
                }
            }
            return searchOptions;
        }
        async loadPage(prevFigures) {
            const page = await this.getPage();
            if (page == null) {
                throw new Error('No page found');
            }
            prevFigures ??= [];
            const prevSids = prevFigures.map(figure => figure.id);
            let figures = getFiguresFromPage(page);
            figures = figures.filter(figure => !prevSids.includes(figure.id));
            if (figures.length !== 0) {
                // Check if we should show a page separator
                if (showPageSeparatorSetting.value) {
                    const separator = createSeparatorElem(this.pageNo);
                    this.gallery.appendChild(separator);
                }
                // Add the figures to the gallery
                for (const figure of figures) {
                    this.gallery.appendChild(figure);
                }
            }
            else {
                throw new Error('No figures found');
            }
            window.dispatchEvent(new CustomEvent('ei-update-embedded')); //Embedded Image Viewer Integration
            return figures;
        }
    }

    function getWatchesFromPage (page) {
        try {
            const watchList = [];
            const pageColumnPage = page.getElementById('columnpage');
            const pageSectionBody = pageColumnPage.querySelector('div[class="section-body"]');
            const pageWatches = pageSectionBody.querySelector('div[class="flex-watchlist"]');
            const watches = pageWatches.querySelectorAll('div[class="flex-item-watchlist aligncenter"]');
            for (const watch of Array.from(watches).map(elem => elem)) {
                watchList.push(watch);
            }
            return watchList;
        }
        catch {
            return [];
        }
    }

    class WatchesPage {
        pageNo;
        gallery;
        constructor(pageNo) {
            this.pageNo = pageNo;
            const columnpage = document.getElementById('columnpage');
            this.gallery = columnpage.querySelector('div[class="section-body"]');
            this.gallery.style.display = 'flex';
            this.gallery.style.flexWrap = 'wrap';
        }
        async getPage() {
            Logger.logInfo(`Getting page WatchesPage '${this.pageNo}'`);
            const page = await requestHelper.PersonalUserRequests.ManageContent.getWatchesPage(this.pageNo);
            return page;
        }
        async loadPage(prevWatches) {
            const page = await this.getPage();
            if (page == null) {
                throw new Error('No page found');
            }
            prevWatches ??= [];
            const prevHrefs = prevWatches.map(watch => watch.querySelector('a[href]')?.href);
            let watches = getWatchesFromPage(page);
            watches = watches.filter(watch => !prevHrefs.includes(watch.querySelector('a[href]')?.href));
            if (watches.length !== 0) {
                // Check if we should show a page separator
                if (showPageSeparatorSetting.value) {
                    const separator = createSeparatorElem(this.pageNo);
                    separator.style.width = 'fit-content';
                    separator.style.margin = '14px auto';
                    this.gallery.appendChild(document.createElement('br'));
                    this.gallery.appendChild(separator);
                    this.gallery.appendChild(document.createElement('br'));
                }
                // Add the watches to the gallery
                const watchesContainer = document.createElement('div');
                watchesContainer.className = 'flex-watchlist';
                this.gallery.appendChild(watchesContainer);
                watchesContainer.append(...watches);
            }
            else {
                throw new Error('No watches found');
            }
            return watches;
        }
    }

    class GalleryManager {
        pageNo = 1;
        prevFigures = [];
        currDataFavId = '';
        isGallery;
        isFavorites;
        isScraps;
        isBrowse;
        isSearch;
        isWatches;
        constructor() {
            this.isGallery = window.location.toString().toLowerCase().includes('net/gallery');
            this.isFavorites = window.location.toString().toLowerCase().includes('net/favorites');
            this.isScraps = window.location.toString().toLowerCase().includes('net/scraps');
            this.isBrowse = window.location.toString().toLowerCase().includes('net/browse');
            if (this.isBrowse) {
                const pageOption = document.getElementById('manual-page');
                if (pageOption instanceof HTMLInputElement) {
                    this.pageNo = parseInt(pageOption.value);
                }
            }
            this.isSearch = window.location.toString().toLowerCase().includes('net/search');
            if (this.isSearch) {
                const searchAdvanced = document.getElementById('search-advanced');
                const pageStartInput = searchAdvanced?.querySelector('input[class*="js-pageNumInput"]');
                if (pageStartInput != null && pageStartInput instanceof HTMLInputElement) {
                    this.pageNo = parseInt(pageStartInput.value);
                }
            }
            this.isWatches = window.location.toString().toLowerCase().includes('net/controls/buddylist');
            if (this.isWatches) {
                const columnpage = document.getElementById('columnpage');
                const gallery = columnpage?.querySelector('div[class="section-body"]');
                const paginationLinks = gallery?.querySelector('div[class*="pagination-links"]');
                if (paginationLinks != null) {
                    const paginationLinksElem = paginationLinks;
                    paginationLinksElem.style.display = 'none';
                    paginationLinksElem.insertBeforeThis(document.createElement('br'));
                }
            }
        }
        async loadNextPage() {
            this.pageNo++;
            if (this.isFavorites) {
                const gallery = document.body.querySelector('section[id*="gallery"]');
                const figures = gallery?.getElementsByTagName('figure');
                if (figures != null && figures.length !== 0) {
                    const lastFigureFavId = figures[figures.length - 1].getAttribute('data-fav-id');
                    if (lastFigureFavId != null) {
                        this.currDataFavId = lastFigureFavId;
                    }
                }
            }
            let nextPage;
            if (this.isGallery) {
                nextPage = new GalleryPage(this.pageNo);
            }
            else if (this.isFavorites) {
                nextPage = new FavoritesPage(this.currDataFavId, this.pageNo);
            }
            else if (this.isScraps) {
                nextPage = new ScrapsPage(this.pageNo);
            }
            else if (this.isBrowse) {
                nextPage = new BrowsePage(this.pageNo);
            }
            else if (this.isSearch) {
                nextPage = new SearchPage(this.pageNo);
            }
            else if (this.isWatches) {
                nextPage = new WatchesPage(this.pageNo);
            }
            if (nextPage != null) {
                const spacer = document.createElement('div');
                spacer.style.height = '20px';
                nextPage.gallery.appendChild(spacer);
                const loadingSpinner = new window.FALoadingSpinner(nextPage.gallery);
                loadingSpinner.spinnerThickness = 5;
                loadingSpinner.size = 50;
                loadingSpinner.visible = true;
                try {
                    this.prevFigures = await nextPage.loadPage(this.prevFigures);
                }
                finally {
                    loadingSpinner.visible = false;
                    loadingSpinner.dispose();
                    nextPage.gallery.removeChild(spacer);
                }
            }
        }
    }

    class InfiniGallery {
        scanElem;
        galleryManager;
        scanInterval = -1;
        constructor() {
            this.scanElem = document.getElementById('footer');
            this.galleryManager = new GalleryManager();
            window.addEventListener('ig-stop-detection', () => {
                this.stopScrollDetection();
            });
        }
        startScrollDetection() {
            this.scanInterval = setInterval(() => {
                // Check if the scan element is visible on the screen
                if (isElementOnScreen(this.scanElem)) {
                    // Stop scroll detection and load the next page
                    this.stopScrollDetection();
                    void this.loadNextPage();
                }
            }, 100);
        }
        stopScrollDetection() {
            clearInterval(this.scanInterval);
        }
        async loadNextPage() {
            try {
                await this.galleryManager.loadNextPage();
                this.startScrollDetection();
            }
            catch {
                this.stopScrollDetection();
            }
        }
    }

    const scriptName = 'FA Infini-Gallery';
    const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);
    const showPageSeparatorSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Page Separator');
    showPageSeparatorSetting.description = 'Set wether a Page Separator is shown for each new Page loaded. Default: Show Page Separators';
    showPageSeparatorSetting.defaultValue = true;
    const pageSeparatorTextSetting = customSettings.newSetting(window.FASettingType.Text, 'Page Separator Text');
    pageSeparatorTextSetting.description = 'The Text that is displayed when a new Infini-Gallery Page is loaded (if shown). Number of Page gets inserted instead of: %page% .';
    pageSeparatorTextSetting.defaultValue = 'Infini-Gallery Page: %page%';
    pageSeparatorTextSetting.verifyRegex = /%page%/;
    customSettings.loadSettings();
    const requestHelper = new window.FARequestHelper(2);
    if (customSettings.isFeatureEnabled) {
        const matchList = new window.FAMatchList(customSettings);
        matchList.matches = ['net/gallery', 'net/favorites', 'net/scraps', 'net/browse', 'net/search', 'net/controls/buddylist'];
        matchList.runInIFrame = false;
        if (matchList.hasMatch) {
            const infiniGallery = new InfiniGallery();
            infiniGallery.startScrollDetection();
        }
    }

    exports.pageSeparatorTextSetting = pageSeparatorTextSetting;
    exports.requestHelper = requestHelper;
    exports.scriptName = scriptName;
    exports.showPageSeparatorSetting = showPageSeparatorSetting;

    return exports;

})({});
