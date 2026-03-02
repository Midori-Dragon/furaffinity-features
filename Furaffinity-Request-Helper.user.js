// ==UserScript==
// @name        Furaffinity-Request-Helper
// @namespace   Violentmonkey Scripts
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @grant       none
// @version     1.5.0
// @author      Midori Dragon
// @description Library to simplify requests to Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/483952-furaffinity-request-helper
// @supportURL  https://greasyfork.org/scripts/483952-furaffinity-request-helper/feedback
// ==/UserScript==
// jshint esversion: 11
(function () {
    'use strict';

    class Semaphore {
        maxConcurrency;
        currentConcurrency;
        waitingQueue;
        constructor(maxConcurrency) {
            this.maxConcurrency = maxConcurrency;
            this.currentConcurrency = 0;
            this.waitingQueue = [];
        }
        acquire() {
            return new Promise((resolve) => {
                if (this.currentConcurrency < this.maxConcurrency) {
                    // There is room, increment the current concurrency and resolve the promise
                    this.currentConcurrency++;
                    resolve();
                }
                else {
                    // The semaphore is full, add the resolve function to the waiting queue
                    this.waitingQueue.push(resolve);
                }
            });
        }
        release() {
            if (this.waitingQueue.length > 0) {
                // There are waiting tasks, let the next one run
                const nextResolve = this.waitingQueue.shift();
                if (nextResolve != null) {
                    nextResolve();
                }
            }
            else {
                // No waiting tasks, decrement the current concurrency level
                this.currentConcurrency--;
            }
        }
    }

    class PercentHelper {
        static _percentAll = {};
        constructor() {
            throw new Error('The PercentHelper class is static and cannot be instantiated.');
        }
        static setPercentValue(id, value) {
            // Check if the value is provided and if the id exists in percentAll
            if (value && PercentHelper._percentAll.hasOwnProperty(id)) {
                // Set the value for the given id
                PercentHelper._percentAll[id] = value;
                return true;
            }
            // Return false if value is not provided or id doesn't exist
            return false;
        }
        static getPercentValue(id, decimalPlaces = 2) {
            // Check if the id is provided, return -1 if not
            if (id == null) {
                return -1;
            }
            // Retrieve the percent value from the percentAll map using the given id
            const percent = PercentHelper._percentAll[id];
            // If the percent value is not found, return -1
            if (!percent) {
                return -1;
            }
            // Return the percent value rounded to the specified number of decimal places
            return parseFloat(percent.toFixed(decimalPlaces));
        }
        static createPercentValue(uniqueId) {
            // Initialize the percent value at 0 for the given uniqueId
            PercentHelper._percentAll[uniqueId] = 0;
        }
        static deletePercentValue(id) {
            if (PercentHelper._percentAll.hasOwnProperty(id)) {
                // Delete the percent value from the list
                delete PercentHelper._percentAll[id];
            }
        }
        static updatePercentValue(id, value, totalValue) {
            if (id != null && id !== '' && id !== -1) {
                const progress = (value / totalValue) * 100;
                PercentHelper.setPercentValue(id, progress);
            }
        }
    }

    const DEFAULT_ACTION_DELAY = 100;
    class WaitAndCallAction {
        delay = 10;
        _action;
        _intervalId;
        _running = false;
        constructor(action, delay) {
            this._action = action;
            if (delay != null) {
                this.delay = delay;
            }
        }
        start() {
            if (this._action != null && this._running === false) {
                this._running = true;
                this._intervalId = setInterval(() => {
                    this._action(PercentHelper.getPercentValue(this._intervalId?.toString()));
                }, this.delay);
                PercentHelper.createPercentValue(this._intervalId.toString());
                return this._intervalId;
            }
        }
        stop() {
            if (this._running) {
                this._running = false;
                clearInterval(this._intervalId);
                if (this._intervalId != null) {
                    PercentHelper.deletePercentValue(this._intervalId.toString());
                }
            }
        }
        static async callFunctionAsync(fn, action, delay) {
            if (action == null) {
                return await fn();
            }
            const waitAndCallAction = new WaitAndCallAction(action, delay);
            const percentId = waitAndCallAction.start();
            try {
                return await fn(percentId);
            }
            finally {
                waitAndCallAction.stop();
            }
        }
        static callFunction(fn, action, delay) {
            if (action == null) {
                return fn();
            }
            const waitAndCallAction = new WaitAndCallAction(action, delay);
            const percentId = waitAndCallAction.start();
            const result = fn(percentId);
            waitAndCallAction.stop();
            return result;
        }
    }

    function convertToNumber(value) {
        if (value == null) {
            return undefined;
        }
        const number = parseInt(value.toString());
        if (isNaN(number)) {
            return undefined;
        }
        return number;
    }

    class IdArray {
        constructor() { }
        static getTillId(collection, toId, attributeName = 'id') {
            const result = [];
            toId = toId.toString();
            // Iterate over the collection and break when the toId is found.
            for (const elem of collection) {
                // Add the element to the result array.
                result.push(elem);
                // Break the loop if the element ID matches the toId.
                const attribute = elem.getAttribute(attributeName);
                if (attribute?.replace('sid-', '') === toId) {
                    break;
                }
            }
            return result;
        }
        static getSinceId(collection, fromId, attributeName = 'id') {
            // Convert the collection to an array and reverse it for processing from the end
            const array = [...collection];
            array.reverse();
            // Initialize an empty result array to store elements with IDs greater than or equal to fromId
            const result = [];
            fromId = fromId.toString();
            // Iterate over the reversed array
            for (const elem of array) {
                // Add the current element to the result array
                result.push(elem);
                // If the current element's ID matches fromId, stop processing further
                const attribute = elem.getAttribute(attributeName);
                if (attribute?.replace('sid-', '') === fromId) {
                    break;
                }
            }
            // Reverse the result array to maintain the original order
            result.reverse();
            return result;
        }
        static getBetweenIds(collection, fromId, toId, attributeName = 'id') {
            const array = collection;
            let startIndex = -1; // Index of the first element with ID equal to or greater than fromId
            let endIndex = -1; // Index of the last element with ID equal to or less than toId
            fromId = fromId.toString();
            toId = toId.toString();
            // Iterate through the array and find the indices of the first and last elements with IDs within the range
            for (let i = 0; i < array.length; i++) {
                const attribute = array[i].getAttribute(attributeName);
                if (attribute?.replace('sid-', '') === fromId) {
                    startIndex = i;
                }
                if (attribute?.replace('sid-', '') === toId) {
                    endIndex = i;
                }
                // If both indices are found, break the loop
                if (startIndex !== -1 && endIndex !== -1) {
                    break;
                }
            }
            // If both indices are still -1, return the entire array
            if (startIndex === -1 && endIndex === -1) {
                return array;
            }
            // If only one index is -1, set it to the other extreme value
            if (startIndex === -1) {
                startIndex = 0;
            }
            if (endIndex === -1) {
                endIndex = array.length - 1;
            }
            // Extract the elements between the start and end indices
            const result = [];
            for (let i = startIndex; i <= endIndex; i++) {
                result.push(array[i]);
            }
            return result;
        }
        static containsId(collection, id, attributeName = 'id') {
            id = id.toString();
            for (const elem of collection) {
                // The id attribute is a string, so we need to remove the "sid-" prefix to compare it to the given id
                const attribute = elem.getAttribute(attributeName);
                if (attribute?.replace('sid-', '') === id) {
                    return true;
                }
            }
            return false;
        }
    }

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Error"] = 1] = "Error";
        LogLevel[LogLevel["Warning"] = 2] = "Warning";
        LogLevel[LogLevel["Info"] = 3] = "Info";
    })(LogLevel || (LogLevel = {}));
    class Logger {
        static get _logLevel() {
            window.__FF_GLOBAL_LOG_LEVEL__ ??= LogLevel.Error;
            return window.__FF_GLOBAL_LOG_LEVEL__;
        }
        static setLogLevel(logLevel) {
            window.__FF_GLOBAL_LOG_LEVEL__ = logLevel;
        }
        static get logError() {
            return LogLevel.Error <= Logger._logLevel ? console.error.bind(console) : () => { };
        }
        static get logWarning() {
            return LogLevel.Warning <= Logger._logLevel ? console.warn.bind(console) : () => { };
        }
        static get logInfo() {
            return LogLevel.Info <= Logger._logLevel ? console.log.bind(console) : () => { };
        }
    }

    async function elementsTillId(getElements, toId, fromPage) {
        if (toId == null || toId <= 0) {
            Logger.logError('No toId given');
            return [];
        }
        const allElements = [];
        let lastElementId;
        let running = true;
        let i = (fromPage != null && fromPage >= 1) ? fromPage : 1;
        while (running) {
            let elements = [];
            try {
                elements = await getElements(i);
            }
            catch (error) {
                Logger.logError(`Failed to fetch page ${i}:`, error);
                running = false;
                continue;
            }
            let currElementId = lastElementId;
            if (elements.length !== 0) {
                currElementId = elements[0].id;
            }
            if (currElementId === lastElementId) {
                running = false;
            }
            else {
                if (IdArray.containsId(elements, toId)) {
                    allElements.push(IdArray.getTillId(elements, toId));
                    running = false;
                }
                else {
                    allElements.push(elements);
                    i++;
                }
            }
        }
        return allElements;
    }
    async function elementsSinceId(getElements, fromId, toPage) {
        if (fromId == null || fromId <= 0) {
            Logger.logError('No fromId given');
            return [];
        }
        const direction = toPage == null || toPage <= 0 ? -1 : 1;
        let lastElementId;
        let running = true;
        let i = toPage == null || toPage <= 0 ? 1 : toPage;
        if (toPage == null || toPage <= 0) {
            while (running) {
                let elements = [];
                try {
                    elements = await getElements(i);
                }
                catch (error) {
                    Logger.logError(`Failed to fetch page ${i}:`, error);
                    running = false;
                    continue;
                }
                let currElementId = lastElementId;
                if (elements.length !== 0) {
                    currElementId = elements[0].id;
                }
                if (currElementId === lastElementId) {
                    running = false;
                }
                else {
                    if (IdArray.containsId(elements, fromId)) {
                        running = false;
                    }
                    else {
                        i++;
                    }
                }
            }
        }
        const allElements = [];
        lastElementId = undefined;
        running = true;
        while (running) {
            let elements = [];
            try {
                elements = await getElements(i);
            }
            catch (error) {
                Logger.logError(`Failed to fetch page ${i}:`, error);
                running = false;
                continue;
            }
            let currElementId = lastElementId;
            if (elements.length !== 0) {
                currElementId = elements[0].id;
            }
            if (currElementId === lastElementId) {
                running = false;
            }
            else {
                if (IdArray.containsId(elements, fromId)) {
                    const elementsPush = IdArray.getSinceId(elements, fromId);
                    if (direction < 0) {
                        elementsPush.reverse();
                        running = false;
                    }
                    allElements.push(elementsPush);
                }
                else {
                    if (direction < 0) {
                        elements.reverse();
                    }
                    allElements.push(elements);
                }
                i += direction;
            }
        }
        if (direction < 0) {
            allElements.reverse();
        }
        return allElements;
    }
    async function elementsBetweenIds(getElements, fromId, toId, fromPage, toPage, percentId) {
        if (fromId == null || fromId <= 0) {
            Logger.logError('No fromId given');
            return [];
        }
        if (toId == null || toId <= 0) {
            Logger.logError('No toId given');
            return [];
        }
        if (fromPage == null || fromPage <= 0 || toPage == null || toPage <= 1) {
            Logger.logWarning('No fromPage or toPage given. Percentages can not be calculated.');
            percentId = undefined;
        }
        let i = (fromPage != null && fromPage >= 1) ? fromPage : 1;
        const allElements = [];
        let lastElementId;
        let running = true;
        let completedPages = 0;
        while (running) {
            if (toPage != null && toPage >= 1 && i >= toPage) {
                running = false;
            }
            let elements = [];
            try {
                elements = await getElements(i);
            }
            catch (error) {
                Logger.logError(`Failed to fetch page ${i}:`, error);
                running = false;
                continue;
            }
            let currElementId = lastElementId;
            if (elements.length !== 0) {
                currElementId = elements[0].id;
            }
            if (currElementId === lastElementId) {
                running = false;
            }
            else {
                if (IdArray.containsId(elements, fromId)) {
                    allElements.push(IdArray.getSinceId(elements, fromId));
                }
                if (IdArray.containsId(elements, toId)) {
                    allElements.push(IdArray.getBetweenIds(elements, fromId, toId));
                    running = false;
                }
                else {
                    allElements.push(elements);
                    i++;
                }
            }
            completedPages++;
            if (toPage != null && toPage >= 1) {
                PercentHelper.updatePercentValue(percentId, completedPages, toPage);
            }
        }
        return allElements;
    }
    async function elementsTillPage(getElements, toPage, percentId) {
        if (toPage == null || toPage === 0) {
            Logger.logWarning('toPage must be greater than 0. Using default 1 instead.');
            toPage = 1;
        }
        else if (toPage < 0) {
            toPage = Number.MAX_SAFE_INTEGER;
        }
        const allElements = [];
        let completedPages = 0;
        for (let i = 1; i <= toPage; i++) {
            let elements = [];
            try {
                elements = await getElements(i);
            }
            catch (error) {
                Logger.logError(`Failed to fetch page ${i}:`, error);
                break;
            }
            if (elements.length === 0) {
                i = toPage;
            }
            else {
                allElements.push(elements);
            }
            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, toPage);
        }
        return allElements;
    }
    async function elementsSincePage(getElements, fromPage) {
        if (fromPage == null || fromPage <= 0) {
            Logger.logWarning('fromPage must be greater than 0. Using default 1 instead.');
            fromPage = 1;
        }
        const allElements = [];
        let lastElementId;
        let running = true;
        let i = fromPage;
        while (running) {
            let elements = [];
            try {
                elements = await getElements(i);
            }
            catch (error) {
                Logger.logError(`Failed to fetch page ${i}:`, error);
                running = false;
                continue;
            }
            let currElementId = lastElementId;
            if (elements.length !== 0) {
                currElementId = elements[0].id;
            }
            if (currElementId === lastElementId) {
                running = false;
            }
            else {
                allElements.push(elements);
                i++;
            }
        }
        return allElements;
    }
    async function elementsBetweenPages(getElements, fromPage, toPage, percentId) {
        if (fromPage == null || fromPage <= 0) {
            Logger.logWarning('fromPage must be greater than 0. Using default 1 instead.');
            fromPage = 1;
        }
        if (toPage == null || toPage === 0) {
            Logger.logWarning('toPage must be greater than 0. Using default 1 instead.');
            toPage = 1;
        }
        else if (toPage < 0) {
            toPage = Number.MAX_SAFE_INTEGER;
        }
        const allElements = [];
        const direction = fromPage <= toPage ? 1 : -1;
        const totalPages = Math.abs(toPage - fromPage) + 1;
        let completedPages = 0;
        for (let i = fromPage; i <= toPage; i += direction) {
            let elements = [];
            try {
                elements = await getElements(i);
            }
            catch (error) {
                Logger.logError(`Failed to fetch page ${i}:`, error);
                break;
            }
            if (elements.length === 0) {
                i = toPage;
            }
            else {
                allElements.push(elements);
            }
            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
        }
        return allElements;
    }
    async function findElementPageNo(getElements, elementId, idPrefix, fromPage, toPage, percentId) {
        if (elementId == null || elementId <= 0) {
            Logger.logError('No elementId given');
            return -1;
        }
        if (fromPage == null || fromPage <= 0) {
            Logger.logWarning('fromPage must be greater than 0. Using default 1 instead.');
            fromPage = 1;
        }
        if (toPage == null || toPage === 0) {
            Logger.logWarning('toPage must be greater than 0. Using default 1 instead.');
            toPage = 1;
        }
        else if (toPage < 0) {
            toPage = Number.MAX_SAFE_INTEGER;
        }
        const direction = fromPage <= toPage ? 1 : -1;
        const totalPages = Math.abs(toPage - fromPage) + 1;
        let completedPages = 0;
        for (let i = fromPage; i <= toPage; i += direction) {
            let elements = [];
            try {
                elements = await getElements(i);
            }
            catch (error) {
                Logger.logError(`Failed to fetch page ${i}:`, error);
                continue;
            }
            if (elements.length === 0) {
                break;
            }
            else {
                const resultElement = elements.find(el => el.id.trimStart(idPrefix) === elementId.toString());
                if (resultElement != null) {
                    return i;
                }
            }
            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
        }
        return -1;
    }

    function checkTags(element) {
        const userLoggedIn = document.body.getAttribute('data-user-logged-in') === '1';
        if (!userLoggedIn) {
            Logger.logWarning('User is not logged in, skipping tag check');
            setBlockedState(element, false);
            return;
        }
        const tagsHideMissingTags = document.body.getAttribute('data-tag-blocklist-hide-tagless') === '1';
        const tags = element.getAttribute('data-tags')?.trim().split(/\s+/);
        let blockReason = '';
        if (tags != null && tags.length > 0 && tags[0] !== '') {
            // image has tags
            const blockedTags = getBannedTags(tags);
            if (blockedTags.length <= 0) {
                setBlockedState(element, false);
            }
            else {
                setBlockedState(element, true);
                Logger.logInfo(`${element.id} blocked tags: ${blockedTags.join(', ')}`);
                // provide hint
                blockReason = 'Blocked tags:\n';
                for (const tag of blockedTags) {
                    blockReason += '• ' + tag + '\n';
                }
            }
        }
        else {
            // image has no tags
            setBlockedState(element, tagsHideMissingTags);
            // provide hint
            if (tagsHideMissingTags) {
                blockReason = 'Content is missing tags.';
            }
        }
        if (blockReason !== '' && element.id !== 'submissionImg') {
            // apply hint to everything but main image on submission view page
            //element.setAttribute('data-block-reason', block_reason);
            element.setAttribute('title', blockReason);
        }
    }
    function getBannedTags(tags) {
        const blockedTags = document.body.getAttribute('data-tag-blocklist') ?? '';
        const tagsBlocklist = Array.from(blockedTags.split(' '));
        let bTags = [];
        if (tags == null || tags.length === 0) {
            return [];
        }
        for (const tag of tags) {
            for (const blockedTag of tagsBlocklist) {
                if (tag === blockedTag) {
                    bTags.push(blockedTag);
                }
            }
        }
        // Remove dupes and return
        return [...new Set(bTags)];
    }
    function setBlockedState(element, isBlocked) {
        element.classList[isBlocked ? 'add' : 'remove']('blocked-content');
    }

    function checkTagsAll(doc) {
        if (doc == null) {
            return;
        }
        const uploads = doc.querySelectorAll('img[data-tags]');
        uploads.forEach((element) => checkTags(element));
    }

    class Gallery {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/gallery/';
        }
        static async fetchPage(username, folder, pageNumber, semaphore) {
            if (username == null) {
                throw new Error('Cannot fetch gallery page: no username given');
            }
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('No page number given. Using default value of 1.');
                pageNumber = 1;
            }
            if (!username.endsWith('/')) {
                username += '/';
            }
            let url = Gallery.hardLink + username;
            if (folder != null) {
                url += `folder/${folder.id}/`;
                if (folder.name != null) {
                    url += `${folder.name}/`;
                }
            }
            const page = await FuraffinityRequests.getHTML(url + pageNumber, semaphore);
            checkTagsAll(page);
            return page;
        }
        async _fetchFigures(username, folder, pageNumber) {
            if (pageNumber == null || pageNumber <= 0) {
                pageNumber = 1;
            }
            Logger.logInfo(`Getting gallery of "${username}" on page "${pageNumber}".`);
            const galleryDoc = await Gallery.fetchPage(username, folder, pageNumber, this._semaphore);
            if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
                Logger.logInfo(`No images found at gallery of "${username}" on page "${pageNumber}".`);
                return [];
            }
            const figures = galleryDoc.getElementsByTagName('figure');
            if (figures == null || figures.length === 0) {
                Logger.logInfo(`No figures found at gallery of "${username}" on page "${pageNumber}".`);
                return [];
            }
            return Array.from(figures);
        }
        async getSubmissionPageNo(username, submissionId, folder, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            submissionId = convertToNumber(submissionId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            return await WaitAndCallAction.callFunctionAsync((percentId) => findElementPageNo((page) => this._fetchFigures(username, folder, page), submissionId, 'sid-', fromPageNumber, toPageNumber, percentId), action, delay);
        }
        async getFiguresBetweenIds(username, fromId, toId, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((page) => this._fetchFigures(username, undefined, page), toId, undefined), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((page) => this._fetchFigures(username, undefined, page), fromId, undefined), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenIds((page) => this._fetchFigures(username, undefined, page), fromId, toId, undefined, undefined, percentId), action, delay);
            }
        }
        async getFiguresInFolderBetweenIds(username, folder, fromId, toId, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((page) => this._fetchFigures(username, folder, page), toId, undefined), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((page) => this._fetchFigures(username, folder, page), fromId, undefined), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenIds((page) => this._fetchFigures(username, folder, page), fromId, toId, undefined, undefined, percentId), action, delay);
            }
        }
        async getFiguresBetweenIdsBetweenPages(username, fromId, toId, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((page) => this._fetchFigures(username, undefined, page), toId, fromPageNumber), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((page) => this._fetchFigures(username, undefined, page), fromId, toPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenIds((page) => this._fetchFigures(username, undefined, page), fromId, toId, fromPageNumber, toPageNumber, percentId), action, delay);
            }
        }
        async getFiguresInFolderBetweenIdsBetweenPages(username, folder, fromId, toId, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((page) => this._fetchFigures(username, folder, page), toId, fromPageNumber), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((page) => this._fetchFigures(username, folder, page), fromId, toPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenIds((page) => this._fetchFigures(username, folder, page), fromId, toId, fromPageNumber, toPageNumber, percentId), action, delay);
            }
        }
        async getFiguresBetweenPages(username, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromPageNumber == null || fromPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsTillPage((page) => this._fetchFigures(username, undefined, page), toPageNumber, percentId), action, delay);
            }
            else if (toPageNumber == null || toPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSincePage((page) => this._fetchFigures(username, undefined, page), fromPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenPages((page) => this._fetchFigures(username, undefined, page), fromPageNumber, toPageNumber, percentId), action, delay);
            }
        }
        async getFiguresInFolderBetweenPages(username, folder, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromPageNumber == null || fromPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsTillPage((page) => this._fetchFigures(username, folder, page), toPageNumber, percentId), action, delay);
            }
            else if (toPageNumber == null || toPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSincePage((page) => this._fetchFigures(username, folder, page), fromPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenPages((page) => this._fetchFigures(username, folder, page), fromPageNumber, toPageNumber, percentId), action, delay);
            }
        }
        async getFigures(username, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => this._fetchFigures(username, undefined, pageNumber), action, delay);
        }
        async getFiguresInFolder(username, folder, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => this._fetchFigures(username, folder, pageNumber), action, delay);
        }
        async getPage(username, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => Gallery.fetchPage(username, undefined, pageNumber, this._semaphore), action, delay);
        }
        async getPageInFolder(username, folder, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => Gallery.fetchPage(username, folder, pageNumber, this._semaphore), action, delay);
        }
    }

    class Scraps {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/scraps/';
        }
        static async fetchPage(username, pageNumber, semaphore) {
            if (username == null) {
                throw new Error('Cannot fetch scraps page: no username given');
            }
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('No page number given. Using default value of 1.');
                pageNumber = 1;
            }
            if (!username.endsWith('/')) {
                username += '/';
            }
            const page = await FuraffinityRequests.getHTML(Scraps.hardLink + username + pageNumber, semaphore);
            checkTagsAll(page);
            return page;
        }
        async _fetchFigures(username, pageNumber) {
            if (pageNumber == null || pageNumber <= 0) {
                pageNumber = 1;
            }
            Logger.logInfo(`Getting scraps of "${username}" on page "${pageNumber}".`);
            const galleryDoc = await Scraps.fetchPage(username, pageNumber, this._semaphore);
            if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
                Logger.logInfo(`No images found at scraps of "${username}" on page "${pageNumber}".`);
                return [];
            }
            const figures = galleryDoc.getElementsByTagName('figure');
            if (figures == null || figures.length === 0) {
                Logger.logInfo(`No figures found at scraps of "${username}" on page "${pageNumber}".`);
                return [];
            }
            return Array.from(figures);
        }
        async getSubmissionPageNo(username, submissionId, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            submissionId = convertToNumber(submissionId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            return await WaitAndCallAction.callFunctionAsync((percentId) => findElementPageNo((page) => this._fetchFigures(username, page), submissionId, 'sid-', fromPageNumber, toPageNumber, percentId), action, delay);
        }
        async getFiguresBetweenIds(username, fromId, toId, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((page) => this._fetchFigures(username, page), toId, undefined), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((page) => this._fetchFigures(username, page), fromId, undefined), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenIds((page) => this._fetchFigures(username, page), fromId, toId, undefined, undefined, percentId), action, delay);
            }
        }
        async getFiguresBetweenIdsBetweenPages(username, fromId, toId, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((page) => this._fetchFigures(username, page), toId, fromPageNumber), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((page) => this._fetchFigures(username, page), fromId, toPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenIds((page) => this._fetchFigures(username, page), fromId, toId, fromPageNumber, toPageNumber, percentId), action, delay);
            }
        }
        async getFiguresBetweenPages(username, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromPageNumber == null || fromPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsTillPage((page) => this._fetchFigures(username, page), toPageNumber, percentId), action, delay);
            }
            else if (toPageNumber == null || toPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSincePage((page) => this._fetchFigures(username, page), fromPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenPages((page) => this._fetchFigures(username, page), fromPageNumber, toPageNumber, percentId), action, delay);
            }
        }
        async getFigures(username, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => this._fetchFigures(username, pageNumber), action, delay);
        }
        async getPage(username, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => Scraps.fetchPage(username, pageNumber, this._semaphore), action, delay);
        }
    }

    class Favorites {
        semaphore;
        constructor(semaphore) {
            this.semaphore = semaphore;
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/favorites/';
        }
        static async fetchPage(username, dataFavId, direction, semaphore) {
            if (username == null) {
                throw new Error('Cannot fetch favorites page: no username given');
            }
            if (direction == null) {
                Logger.logWarning('No direction given. Using default 1 instead.');
                direction = 1;
            }
            if (!username.endsWith('/')) {
                username += '/';
            }
            let url = Favorites.hardLink;
            if (dataFavId != null && dataFavId >= 0) {
                url += `${username}${dataFavId}/`;
            }
            else {
                Logger.logWarning('No last data fav id given. Using default 1 instead.');
                url += username;
            }
            if (direction >= 0) {
                url += 'next/';
            }
            else {
                url += 'prev/';
            }
            const page = await FuraffinityRequests.getHTML(url, semaphore);
            checkTagsAll(page);
            return page;
        }
        async getSubmissionDataFavId(username, submissionId, fromDataFavId, toDataFavId, maxPageNo, action, delay = DEFAULT_ACTION_DELAY) {
            submissionId = convertToNumber(submissionId);
            fromDataFavId = convertToNumber(fromDataFavId);
            toDataFavId = convertToNumber(toDataFavId);
            maxPageNo = convertToNumber(maxPageNo);
            return await WaitAndCallAction.callFunctionAsync(() => this._getSubmissionDataFavId(username, submissionId, fromDataFavId, toDataFavId, maxPageNo), action, delay);
        }
        async getFiguresBetweenIds(username, fromId, toId, maxPageNo, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            maxPageNo = convertToNumber(maxPageNo);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresTillId(username, toId, undefined, maxPageNo), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresSinceId(username, fromId, undefined, maxPageNo), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresBetweenIds(username, fromId, toId, undefined, undefined, maxPageNo), action, delay);
            }
        }
        /** @deprecated Use `getFiguresBetweenIdsBetweenDataIds` instead. */
        async getFiguresBetweenIdsBetweenPages(username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo, action, delay = DEFAULT_ACTION_DELAY) {
            return await this.getFiguresBetweenIdsBetweenDataIds(username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo, action, delay);
        }
        async getFiguresBetweenIdsBetweenDataIds(username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            fromDataFavId = convertToNumber(fromDataFavId);
            toDataFavId = convertToNumber(toDataFavId);
            maxPageNo = convertToNumber(maxPageNo);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresTillId(username, toId, fromDataFavId, maxPageNo), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresSinceId(username, fromId, toDataFavId, maxPageNo), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresBetweenIds(username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo), action, delay);
            }
        }
        async getFiguresBetweenPages(username, fromDataFavId, toDataFavId, maxPageNo, action, delay = DEFAULT_ACTION_DELAY) {
            fromDataFavId = convertToNumber(fromDataFavId);
            toDataFavId = convertToNumber(toDataFavId);
            maxPageNo = convertToNumber(maxPageNo);
            if (fromDataFavId == null || fromDataFavId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresTillPage(username, toDataFavId, maxPageNo), action, delay);
            }
            else if (toDataFavId == null || toDataFavId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresSincePage(username, fromDataFavId, maxPageNo), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync(() => this._getFiguresBetweenPages(username, fromDataFavId, toDataFavId, maxPageNo), action, delay);
            }
        }
        async getFigures(username, fromDataFavId, direction, action, delay = DEFAULT_ACTION_DELAY) {
            fromDataFavId = convertToNumber(fromDataFavId);
            direction = convertToNumber(direction);
            return await WaitAndCallAction.callFunctionAsync(() => this._getFigures(username, fromDataFavId, direction), action, delay);
        }
        async getPage(username, fromDataFavId, direction, action, delay = DEFAULT_ACTION_DELAY) {
            fromDataFavId = convertToNumber(fromDataFavId);
            direction = convertToNumber(direction);
            return await WaitAndCallAction.callFunctionAsync(() => Favorites.fetchPage(username, fromDataFavId, direction, this.semaphore), action, delay);
        }
        async _getSubmissionDataFavId(username, submissionId, fromDataFavId, toDataFavId, maxPageNo) {
            if (submissionId == null || submissionId <= 0) {
                throw new Error('No submissionId given');
            }
            if (fromDataFavId == null || fromDataFavId <= 0) {
                Logger.logWarning('fromDataFavId must be greater than 0. Using default 1 instead.');
                fromDataFavId = -1;
            }
            if (toDataFavId == null || toDataFavId <= 0) {
                Logger.logWarning('toDataFavId must be greater than 0. Using default 1 instead.');
                toDataFavId = -1;
            }
            if (maxPageNo == null || maxPageNo <= 0) {
                Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
                maxPageNo = Number.MAX_SAFE_INTEGER;
            }
            let dataFavId = fromDataFavId;
            let lastFigureId;
            let running = true;
            let i = 0;
            while (running && i < maxPageNo) {
                const figures = await this._getFigures(username, dataFavId, 1);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                    const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                    const resultFigure = figures.find(figure => figure.id.trimStart('sid-') === submissionId.toString());
                    if (resultFigure != null) {
                        return parseInt(resultFigure.getAttribute('data-fav-id'));
                    }
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                }
                i++;
            }
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            return -1;
        }
        async _getFiguresTillId(username, toId, fromDataFavId, maxPageNo) {
            if (toId == null || toId <= 0) {
                throw new Error('No toId given');
            }
            if (fromDataFavId == null || fromDataFavId <= 0) {
                Logger.logWarning('No fromDataFavId given. Using default 1 instead.');
                fromDataFavId = -1;
            }
            if (maxPageNo == null || maxPageNo <= 0) {
                Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
                maxPageNo = Number.MAX_SAFE_INTEGER;
            }
            let running = true;
            let dataFavId = fromDataFavId;
            const allFigures = [];
            let lastFigureId;
            let i = 0;
            while (running && i < maxPageNo) {
                const figures = await this._getFigures(username, dataFavId, 1);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                    const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                }
                else {
                    if (IdArray.containsId(figures, toId)) {
                        allFigures.push(IdArray.getTillId(figures, toId));
                        running = false;
                    }
                    else {
                        allFigures.push(figures);
                    }
                }
                i++;
            }
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            return allFigures;
        }
        async _getFiguresSinceId(username, fromId, toDataFavId, maxPageNo) {
            if (fromId == null || fromId <= 0) {
                throw new Error('No fromId given');
            }
            if (toDataFavId == null || toDataFavId <= 0) {
                Logger.logWarning('No toDataFavId given. Using default 1 instead.');
                toDataFavId = -1;
            }
            if (maxPageNo == null || maxPageNo <= 0) {
                Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
                maxPageNo = Number.MAX_SAFE_INTEGER;
            }
            let dataFavId = toDataFavId >= 0 ? toDataFavId : -1;
            const direction = toDataFavId >= 0 ? -1 : 1;
            let lastFigureId;
            let running = true;
            let i = 0;
            if (toDataFavId < 0) {
                while (running && i < maxPageNo) {
                    const figures = await this._getFigures(username, dataFavId, direction);
                    let currFigureId = lastFigureId;
                    if (figures.length !== 0) {
                        currFigureId = figures[0].id;
                    }
                    if (currFigureId === lastFigureId) {
                        running = false;
                    }
                    else {
                        if (IdArray.containsId(figures, fromId)) {
                            running = false;
                            const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                            if (dataFavIdString == null) {
                                running = false;
                                break;
                            }
                            dataFavId = parseInt(dataFavIdString);
                        }
                    }
                    i++;
                }
                if (i >= maxPageNo) {
                    Logger.logWarning('Max page number reached. Aborting.');
                }
                running = true;
                i = 0;
            }
            const allFigures = [];
            while (running && i < maxPageNo) {
                const figures = await this._getFigures(username, dataFavId, direction);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                    const dataFavIdString = direction >= 0 ? figures[figures.length - 1].getAttribute('data-fav-id') : figures[0].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                }
                else {
                    if (direction < 0) {
                        if (IdArray.containsId(figures, fromId)) {
                            allFigures.push(IdArray.getSinceId(figures, fromId).reverse());
                            running = false;
                        }
                        else {
                            allFigures.push(Array.from(figures).reverse());
                        }
                    }
                    else {
                        if (IdArray.containsId(figures, toDataFavId, 'data-fav-id')) {
                            allFigures.push(IdArray.getTillId(figures, toDataFavId, 'data-fav-id'));
                            running = false;
                        }
                        else {
                            allFigures.push(figures);
                        }
                    }
                }
                i++;
            }
            if (direction < 0) {
                allFigures.reverse();
            }
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            return allFigures;
        }
        async _getFiguresBetweenIds(username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo) {
            if (fromId == null || fromId <= 0) {
                throw new Error('No fromId given');
            }
            if (toId == null || toId <= 0) {
                throw new Error('No toId given');
            }
            if (fromDataFavId == null || fromDataFavId <= 0) {
                Logger.logWarning('No fromDataFavId given. Using default 1 instead.');
                fromDataFavId = -1;
            }
            if (toDataFavId == null || toDataFavId <= 0) {
                Logger.logWarning('No toDataFavId given. Using default 1 instead.');
                toDataFavId = -1;
            }
            if (maxPageNo == null || maxPageNo <= 0) {
                Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
                maxPageNo = Number.MAX_SAFE_INTEGER;
            }
            const direction = fromDataFavId >= 0 ? 1 : (toDataFavId >= 0 ? -1 : 1);
            let dataFavId = fromDataFavId >= 0 ? fromDataFavId : toDataFavId;
            let lastFigureId;
            let running = true;
            let i = 0;
            if (fromDataFavId < 0 && toDataFavId < 0) {
                while (running && i < maxPageNo) {
                    const figures = await this._getFigures(username, dataFavId, direction);
                    let currFigureId = lastFigureId;
                    if (figures.length !== 0) {
                        currFigureId = figures[0].id;
                        const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                        if (dataFavIdString == null) {
                            running = false;
                            break;
                        }
                        dataFavId = parseInt(dataFavIdString);
                    }
                    if (currFigureId === lastFigureId) {
                        running = false;
                    }
                    else {
                        if (IdArray.containsId(figures, fromId)) {
                            running = false;
                        }
                    }
                    i++;
                }
                if (i >= maxPageNo) {
                    Logger.logWarning('Max page number reached. Aborting.');
                }
                running = true;
                i = 0;
            }
            const allFigures = [];
            lastFigureId = undefined;
            while (running && i < maxPageNo) {
                const figures = await this._getFigures(username, dataFavId, direction);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                    const dataFavIdString = direction >= 0 ? figures[figures.length - 1].getAttribute('data-fav-id') : figures[0].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                }
                else {
                    if (direction < 0) {
                        if (IdArray.containsId(figures, fromId)) {
                            allFigures.push(IdArray.getSinceId(figures, fromId).reverse());
                            running = false;
                        }
                        else if (IdArray.containsId(figures, toId)) {
                            allFigures.push(IdArray.getTillId(figures, toId).reverse());
                        }
                        else {
                            allFigures.push(Array.from(figures).reverse());
                        }
                    }
                    else {
                        if (IdArray.containsId(figures, toId)) {
                            allFigures.push(IdArray.getTillId(figures, toId));
                            running = false;
                        }
                        else if (IdArray.containsId(figures, fromId)) {
                            allFigures.push(IdArray.getSinceId(figures, fromId));
                        }
                        else {
                            allFigures.push(figures);
                        }
                    }
                }
                i++;
            }
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            if (direction < 0) {
                allFigures.reverse();
            }
            return allFigures;
        }
        async _getFiguresTillPage(username, toDataFavId, maxPageNo) {
            if (toDataFavId == null || toDataFavId <= 0) {
                Logger.logWarning('toDataFavId must be greater than 0. Using default 1 instead.');
                toDataFavId = -1;
            }
            if (maxPageNo == null || maxPageNo <= 0) {
                Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
                maxPageNo = Number.MAX_SAFE_INTEGER;
            }
            let dataFavId = toDataFavId;
            const allFigures = [];
            let lastFigureId;
            let running = true;
            let i = 0;
            while (running && i < maxPageNo) {
                const figures = await this._getFigures(username, dataFavId, 1);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                    const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                }
                else {
                    if (IdArray.containsId(figures, toDataFavId, 'data-fav-id')) {
                        allFigures.push(IdArray.getTillId(figures, toDataFavId, 'data-fav-id'));
                        running = false;
                    }
                    else {
                        allFigures.push(figures);
                    }
                }
                i++;
            }
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            return allFigures;
        }
        async _getFiguresSincePage(username, fromDataFavId, maxPageNo) {
            if (fromDataFavId == null || fromDataFavId <= 0) {
                Logger.logWarning('fromDataFavId must be greater than 0. Using default 1 instead.');
                fromDataFavId = -1;
            }
            if (maxPageNo == null || maxPageNo <= 0) {
                Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
                maxPageNo = Number.MAX_SAFE_INTEGER;
            }
            let dataFavId = fromDataFavId;
            const allFigures = [];
            let lastFigureId;
            let running = true;
            let i = 0;
            while (running && i < maxPageNo) {
                const figures = await this._getFigures(username, dataFavId, 1);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                    const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                }
                else {
                    if (IdArray.containsId(figures, fromDataFavId, 'data-fav-id')) {
                        allFigures.push(IdArray.getSinceId(figures, fromDataFavId, 'data-fav-id'));
                    }
                    else {
                        allFigures.push(figures);
                    }
                }
                i++;
            }
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            return allFigures;
        }
        async _getFiguresBetweenPages(username, fromDataFavId, toDataFavId, maxPageNo) {
            if (fromDataFavId == null || fromDataFavId <= 0) {
                Logger.logWarning('fromDataFavId must be greater than 0. Using default 1 instead.');
                fromDataFavId = -1;
            }
            if (toDataFavId == null || toDataFavId <= 0) {
                Logger.logWarning('toDataFavId must be greater than 0. Using default 1 instead.');
                toDataFavId = -1;
            }
            if (maxPageNo == null || maxPageNo <= 0) {
                Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
                maxPageNo = Number.MAX_SAFE_INTEGER;
            }
            let dataFavId = fromDataFavId;
            const allFigures = [];
            let lastFigureId;
            let running = true;
            let i = 0;
            while (running && i < maxPageNo) {
                const figures = await this._getFigures(username, dataFavId, 1);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                    const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                }
                else {
                    if (IdArray.containsId(figures, fromDataFavId, 'data-fav-id')) {
                        allFigures.push(IdArray.getSinceId(figures, fromDataFavId, 'data-fav-id'));
                    }
                    else if (IdArray.containsId(figures, toDataFavId, 'data-fav-id')) {
                        allFigures.push(IdArray.getTillId(figures, toDataFavId, 'data-fav-id'));
                        running = false;
                    }
                    else {
                        allFigures.push(figures);
                    }
                }
                i++;
            }
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            return allFigures;
        }
        async _getFigures(username, dataFavId, direction) {
            Logger.logInfo(`Getting Favorites of "${username}" since id "${dataFavId}" and direction "${direction}".`);
            const galleryDoc = await Favorites.fetchPage(username, dataFavId, direction, this.semaphore);
            if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
                Logger.logInfo(`No images found at favorites of "${username}" on page "${dataFavId}".`);
                return [];
            }
            const figures = galleryDoc.getElementsByTagName('figure');
            if (figures == null || figures.length === 0) {
                Logger.logInfo(`No figures found at favorites of "${username}" on page "${dataFavId}".`);
                return [];
            }
            return Array.from(figures);
        }
    }

    class Journals {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/journals/';
        }
        static async fetchPage(username, pageNumber, semaphore) {
            if (username == null) {
                throw new Error('Cannot fetch journals page: no username given');
            }
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
                pageNumber = 1;
            }
            if (!username.endsWith('/')) {
                username += '/';
            }
            const url = Journals.hardLink + username;
            return await FuraffinityRequests.getHTML(url + pageNumber, semaphore);
        }
        async getJournalPageNo(username, journalId, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            journalId = convertToNumber(journalId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            return await WaitAndCallAction.callFunctionAsync((percentId) => findElementPageNo((pg) => this._getSections(username, pg), journalId, 'jid-', fromPageNumber, toPageNumber, percentId), action, delay);
        }
        async getFiguresBetweenIds(username, fromId, toId, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((pg) => this._getSections(username, pg), toId, undefined), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((pg) => this._getSections(username, pg), fromId, undefined), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync(() => elementsBetweenIds((pg) => this._getSections(username, pg), fromId, toId, undefined, undefined), action, delay);
            }
        }
        async getFiguresBetweenIdsBetweenPages(username, fromId, toId, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsTillId((pg) => this._getSections(username, pg), toId, fromPageNumber), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSinceId((pg) => this._getSections(username, pg), fromId, toPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync(() => elementsBetweenIds((pg) => this._getSections(username, pg), fromId, toId, fromPageNumber, toPageNumber), action, delay);
            }
        }
        async getSectionsBetweenPages(username, fromPageNumber, toPageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromPageNumber == null || fromPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsTillPage((pg) => this._getSections(username, pg), toPageNumber, percentId), action, delay);
            }
            else if (toPageNumber == null || toPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => elementsSincePage((pg) => this._getSections(username, pg), fromPageNumber), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => elementsBetweenPages((pg) => this._getSections(username, pg), fromPageNumber, toPageNumber, percentId), action, delay);
            }
        }
        async getSections(username, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => this._getSections(username, pageNumber), action, delay);
        }
        async getPage(username, pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => Journals.fetchPage(username, pageNumber, this._semaphore), action, delay);
        }
        async _getSections(username, pageNumber) {
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('pageNumber must be greater than 0. Using default 1 instead.');
                pageNumber = 1;
            }
            Logger.logInfo(`Getting Journals of "${username}" on page "${pageNumber}".`);
            const galleryDoc = await Journals.fetchPage(username, pageNumber, this._semaphore);
            if (!galleryDoc) {
                Logger.logWarning(`No journals found at "${username}" on page "${pageNumber}".`);
                return [];
            }
            const columnPage = galleryDoc.getElementById('columnpage');
            if (!columnPage) {
                Logger.logWarning(`No column page found at "${username}" on page "${pageNumber}".`);
                return [];
            }
            const sections = columnPage.getElementsByTagName('section');
            if (sections == null || sections.length === 0) {
                Logger.logWarning(`No journals found at "${username}" on page "${pageNumber}".`);
                return [];
            }
            return Array.from(sections);
        }
    }

    class GalleryRequests {
        Gallery;
        Scraps;
        Favorites;
        Journals;
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
            this.Gallery = new Gallery(this._semaphore);
            this.Scraps = new Scraps(this._semaphore);
            this.Favorites = new Favorites(this._semaphore);
            this.Journals = new Journals(this._semaphore);
        }
    }

    class Browse {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/browse/';
        }
        static async fetchPage(pageNumber, browseOptions, semaphore) {
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
                pageNumber = 1;
            }
            browseOptions ??= new BrowseOptions();
            const payload = {
                'cat': browseOptions.category,
                'atype': browseOptions.type,
                'species': browseOptions.species,
                'gender': browseOptions.gender,
                'perpage': browseOptions.perPage,
                'page': pageNumber,
                'rating_general': browseOptions.ratingGeneral ? 'on' : 'off',
                'rating_mature': browseOptions.ratingMature ? 'on' : 'off',
                'rating_adult': browseOptions.ratingAdult ? 'on' : 'off',
            };
            for (const key in payload) {
                if (payload[key] == null || payload[key] === 0 || payload[key] === 'off') {
                    delete payload[key];
                }
            }
            const payloadArray = Object.entries(payload).map(([key, value]) => [key, value?.toString() ?? '']);
            const url = Browse.hardLink;
            const page = await FuraffinityRequests.postHTML(url, payloadArray, semaphore);
            checkTagsAll(page);
            return page;
        }
        get newBrowseOptions() {
            return new BrowseOptions();
        }
        static get newBrowseOptions() {
            return new BrowseOptions();
        }
        get BrowseOptions() {
            return BrowseOptions;
        }
        static get BrowseOptions() {
            return BrowseOptions;
        }
        async getFiguresBetweenIds(fromId, toId, browseOptions, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getBrowseFiguresTillId(toId, undefined, browseOptions, this._semaphore), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getBrowseFiguresSinceId(fromId, undefined, browseOptions, this._semaphore), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getBrowseFiguresBetweenIds(fromId, toId, undefined, undefined, browseOptions, this._semaphore, percentId), action, delay);
            }
        }
        async getFiguresBetweenIdsBetweenPages(fromId, toId, fromPageNumber, toPageNumber, browseOptions, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getBrowseFiguresTillId(toId, fromPageNumber, browseOptions, this._semaphore), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getBrowseFiguresSinceId(fromId, toPageNumber, browseOptions, this._semaphore), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getBrowseFiguresBetweenIds(fromId, toId, fromPageNumber, toPageNumber, browseOptions, this._semaphore, percentId), action, delay);
            }
        }
        async getFiguresBetweenPages(fromPageNumber, toPageNumber, browseOptions, action, delay = DEFAULT_ACTION_DELAY) {
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromPageNumber == null || fromPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getBrowseFiguresTillPage(toPageNumber, browseOptions, this._semaphore, percentId), action, delay);
            }
            else if (toPageNumber == null || toPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getBrowseFiguresSincePage(fromPageNumber, browseOptions, this._semaphore), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getBrowseFiguresBetweenPages(fromPageNumber, toPageNumber, browseOptions, this._semaphore, percentId), action, delay);
            }
        }
        async getFigures(pageNumber, browseOptions, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getBrowseFigures(pageNumber, browseOptions, this._semaphore), action, delay);
        }
        async getPage(pageNumber, browseOptions, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => Browse.fetchPage(pageNumber, browseOptions, this._semaphore), action, delay);
        }
    }
    class BrowseOptions {
        category;
        type;
        species;
        gender;
        perPage;
        ratingGeneral = true;
        ratingMature = true;
        ratingAdult = true;
        constructor() {
            this.category = BrowseOptions.category['all'];
            this.type = BrowseOptions.type['all'];
            this.species = BrowseOptions.species['any'];
            this.gender = BrowseOptions.gender['any'];
            this.perPage = BrowseOptions.results['72'];
        }
        static category = {
            'all': 1,
            '3d-models': 34,
            'artwork-digital': 2,
            'artwork-traditional': 3,
            'cel-shading': 4,
            'crafting': 5,
            'designs': 6,
            'food-recipes': 32,
            'fursuiting': 8,
            'icons': 9,
            'mosaics': 10,
            'photography': 11,
            'pixel-art': 36,
            'sculpting': 12,
            'virtual-photography': 35,
            '2d-animation': 37,
            '3d-animation': 38,
            'pixel-animation': 39,
            'flash': 7,
            'interactive-media': 40,
            'story': 13,
            'poetry': 14,
            'prose': 15,
            'music': 16,
            'podcasts': 17,
            'skins': 18,
            'handhelds': 19,
            'resources': 20,
            'adoptables': 21,
            'auctions': 22,
            'contests': 23,
            'current-events': 24,
            'desktops': 25,
            'stockart': 26,
            'screenshots': 27,
            'scraps': 28,
            'wallpaper': 29,
            'ych-sale': 30,
            'other': 31
        };
        static type = {
            'all': 1,
            'abstract': 2,
            'animal-related-non-anthro': 3,
            'anime': 4,
            'comics': 5,
            'doodle': 6,
            'fanart': 7,
            'fantasy': 8,
            'human': 9,
            'portraits': 10,
            'scenery': 11,
            'still-life': 12,
            'tutorials': 13,
            'miscellaneous': 14,
            'general-furry-art': 100,
            'abduction': 122,
            'baby-fur': 101,
            'bondage': 102,
            'digimon': 103,
            'fat-furs': 104,
            'fetish-other': 105,
            'fursuit': 106,
            'gore': 119,
            'hyper': 107,
            'hypnosis': 121,
            'inflation': 108,
            'micro': 109,
            'muscle': 110,
            'my-little-pony': 111,
            'paw': 112,
            'pokemon': 113,
            'pregnancy': 114,
            'sonic': 115,
            'transformation': 116,
            'tf-tg': 120,
            'vore': 117,
            'water-sports': 118,
            'techno': 201,
            'trance': 202,
            'house': 203,
            '90s': 204,
            '80s': 205,
            '70s': 206,
            '60s': 207,
            'pre-60s': 208,
            'classical': 209,
            'game-music': 210,
            'rock': 211,
            'pop': 212,
            'rap': 213,
            'industrial': 214,
            'other-music': 200
        };
        static species = {
            'any': 1,
            'airborne-vehicle': 10001,
            'alien': 5001,
            'amphibian': 1000,
            'aquatic': 2000,
            'avian': 3000,
            'bear': 6002,
            'bovine': 6007,
            'canine': 6017,
            'cervine': 6018,
            'dog': 6010,
            'dragon': 4000,
            'equine': 10009,
            'exotic': 5000,
            'feline': 6030,
            'fox': 6075,
            'slime': 10007,
            'hybrid-species': 10002,
            'inanimate': 10006,
            'insect': 8003,
            'land-vehicle': 10003,
            'mammal': 6000,
            'marsupial': 6042,
            'mustelid': 6051,
            'plant': 10008,
            'primate': 6058,
            'reptilian': 7000,
            'robot': 10004,
            'rodent': 6067,
            'sea-vehicle': 10005,
            'taur': 5025,
            'vulpine': 6015,
            'original-species': 11014,
            'character': 11015,
            'aeromorph': 11001,
            'angel-dragon': 11002,
            'avali': 11012,
            'chakat': 5003,
            'citra': 5005,
            'crux': 5006,
            'dracat': 5009,
            'dutch': 11003,
            'felkin': 11011,
            'ferrin': 11004,
            'jogauni': 11005,
            'langurhali': 5014,
            'nevrean': 11006,
            'protogen': 11007,
            'rexouium': 11016,
            'sergal': 5021,
            'synx': 11010,
            'wickerbeast': 11013,
            'yinglet': 11009,
            'zorgoia': 11008,
            'angel': 12001,
            'centaur': 12002,
            'cerberus': 12003,
            'shape-shifter': 12038,
            'chimera': 12004,
            'chupacabra': 12005,
            'cockatrice': 12006,
            'daemon': 5007,
            'demon': 12007,
            'displacer-beast': 12008,
            'dragonborn': 12009,
            'drow': 12010,
            'dwarf': 12011,
            'eastern-dragon': 4001,
            'elf': 5011,
            'gargoyle': 5012,
            'goblin': 12012,
            'golem': 12013,
            'gryphon': 3007,
            'harpy': 12014,
            'hellhound': 12015,
            'hippogriff': 12016,
            'hobbit': 12017,
            'hydra': 4002,
            'imp': 12018,
            'incubus': 12019,
            'jackalope': 12020,
            'kirin': 12021,
            'kitsune': 12022,
            'kobold': 12023,
            'lamia': 12024,
            'manticore': 12025,
            'minotaur': 12026,
            'naga': 5016,
            'nephilim': 12027,
            'orc': 5018,
            'pegasus': 12028,
            'peryton': 12029,
            'phoenix': 3010,
            'sasquatch': 12030,
            'satyr': 5020,
            'sphinx': 12031,
            'succubus': 12032,
            'tiefling': 12033,
            'troll': 12034,
            'unicorn': 5023,
            'water-dragon': 12035,
            'werewolf': 12036,
            'western-dragon': 4004,
            'wyvern': 4005,
            'yokai': 12037,
            'alicorn': 13001,
            'argonian': 5002,
            'asari': 13002,
            'bangaa': 13003,
            'bubble-dragon': 13004,
            'burmecian': 13005,
            'charr': 13006,
            'chiss': 13007,
            'chocobo': 5004,
            'deathclaw': 13008,
            'digimon': 5008,
            'draenei': 5010,
            'drell': 13009,
            'elcor': 13010,
            'ewok': 13011,
            'hanar': 13012,
            'hrothgar': 13013,
            'iksar': 5013,
            'kaiju': 5015,
            'kelpie': 13041,
            'kemonomimi': 13014,
            'khajiit': 13015,
            'koopa': 13016,
            'krogan': 13017,
            'lombax': 13018,
            'mimiga': 13019,
            'mobian': 13020,
            'moogle': 5017,
            'neopet': 13021,
            'nu-mou': 13022,
            'pokemon': 5019,
            'pony-mlp': 13023,
            'protoss': 13024,
            'quarian': 13025,
            'ronso': 13026,
            'salarian': 13027,
            'sangheili': 13028,
            'tauntaun': 13029,
            'tauren': 13030,
            'trandoshan': 13031,
            'transformer': 13032,
            'turian': 13033,
            'twilek': 13034,
            'viera': 13035,
            'wookiee': 13036,
            'xenomorph': 5024,
            'yautja': 13037,
            'yordle': 13038,
            'yoshi': 13039,
            'zerg': 13040,
            'aardvark': 14001,
            'aardwolf': 14002,
            'african-wild-dog': 14003,
            'akita': 14004,
            'albatross': 14005,
            'crocodile': 7001,
            'alpaca': 14006,
            'anaconda': 14007,
            'anteater': 14008,
            'antelope': 6004,
            'arachnid': 8000,
            'arctic-fox': 14009,
            'armadillo': 14010,
            'axolotl': 14011,
            'baboon': 14012,
            'badger': 6045,
            'bat': 6001,
            'beaver': 6064,
            'bee': 14013,
            'binturong': 14014,
            'bison': 14015,
            'blue-jay': 14016,
            'border-collie': 14017,
            'brown-bear': 14018,
            'buffalo': 14019,
            'buffalo-bison': 14020,
            'bull-terrier': 14021,
            'butterfly': 14022,
            'caiman': 14023,
            'camel': 6074,
            'capybara': 14024,
            'caribou': 14025,
            'caterpillar': 14026,
            'cephalopod': 2001,
            'chameleon': 14027,
            'cheetah': 6021,
            'chicken': 14028,
            'chimpanzee': 14029,
            'chinchilla': 14030,
            'chipmunk': 14031,
            'civet': 14032,
            'clouded-leopard': 14033,
            'coatimundi': 14034,
            'cockatiel': 14035,
            'corgi': 14036,
            'corvid': 3001,
            'cougar': 6022,
            'cow': 6003,
            'coyote': 6008,
            'crab': 14037,
            'crane': 14038,
            'crayfish': 14039,
            'crow': 3002,
            'crustacean': 14040,
            'dalmatian': 14041,
            'deer': 14042,
            'dhole': 14043,
            'dingo': 6011,
            'dinosaur': 8001,
            'doberman': 6009,
            'dolphin': 2002,
            'donkey': 6019,
            'duck': 3003,
            'eagle': 3004,
            'eel': 14044,
            'elephant': 14045,
            'falcon': 3005,
            'fennec': 6072,
            'ferret': 6046,
            'finch': 14046,
            'fish': 2005,
            'flamingo': 14047,
            'fossa': 14048,
            'frog': 1001,
            'gazelle': 6005,
            'gecko': 7003,
            'genet': 14049,
            'german-shepherd': 6012,
            'gibbon': 14050,
            'giraffe': 6031,
            'goat': 6006,
            'goose': 3006,
            'gorilla': 6054,
            'gray-fox': 14051,
            'great-dane': 14052,
            'grizzly-bear': 14053,
            'guinea-pig': 14054,
            'hamster': 14055,
            'hawk': 3008,
            'hedgehog': 6032,
            'heron': 14056,
            'hippopotamus': 6033,
            'honeybee': 14057,
            'horse': 6034,
            'housecat': 6020,
            'human': 6055,
            'humanoid': 14058,
            'hummingbird': 14059,
            'husky': 6014,
            'hyena': 6035,
            'iguana': 7004,
            'impala': 14060,
            'jackal': 6013,
            'jaguar': 6023,
            'kangaroo': 6038,
            'kangaroo-mouse': 14061,
            'kangaroo-rat': 14062,
            'kinkajou': 14063,
            'kit-fox': 14064,
            'koala': 6039,
            'kodiak-bear': 14065,
            'komodo-dragon': 14066,
            'labrador': 14067,
            'lemur': 6056,
            'leopard': 6024,
            'liger': 14068,
            'linsang': 14069,
            'lion': 6025,
            'lizard': 7005,
            'llama': 6036,
            'lobster': 14070,
            'longhair-cat': 14071,
            'lynx': 6026,
            'magpie': 14072,
            'maine-coon': 14073,
            'malamute': 14074,
            'mammal-feline': 14075,
            'mammal-herd': 14076,
            'mammal-marsupial': 14077,
            'mammal-mustelid': 14078,
            'mammal-other predator': 14079,
            'mammal-prey': 14080,
            'mammal-primate': 14081,
            'mammal-rodent': 14082,
            'manatee': 14083,
            'mandrill': 14084,
            'maned-wolf': 14085,
            'mantid': 8004,
            'marmoset': 14086,
            'marten': 14087,
            'meerkat': 6043,
            'mink': 6048,
            'mole': 14088,
            'mongoose': 6044,
            'monitor-lizard': 14089,
            'monkey': 6057,
            'moose': 14090,
            'moth': 14091,
            'mouse': 6065,
            'musk-deer': 14092,
            'musk-ox': 14093,
            'newt': 1002,
            'ocelot': 6027,
            'octopus': 14094,
            'okapi': 14095,
            'olingo': 14096,
            'opossum': 6037,
            'orangutan': 14097,
            'orca': 14098,
            'oryx': 14099,
            'ostrich': 14100,
            'otter': 6047,
            'owl': 3009,
            'panda': 6052,
            'pangolin': 14101,
            'panther': 6028,
            'parakeet': 14102,
            'parrot': 14103,
            'peacock': 14104,
            'penguin': 14105,
            'persian-cat': 14106,
            'pig': 6053,
            'pigeon': 14107,
            'pika': 14108,
            'pine-marten': 14109,
            'platypus': 14110,
            'polar-bear': 14111,
            'pony': 6073,
            'poodle': 14112,
            'porcupine': 14113,
            'porpoise': 2004,
            'procyonid': 14114,
            'puffin': 14115,
            'quoll': 6040,
            'rabbit': 6059,
            'raccoon': 6060,
            'rat': 6061,
            'ray': 14116,
            'red-fox': 14117,
            'red-panda': 6062,
            'reindeer': 14118,
            'reptillian': 14119,
            'rhinoceros': 6063,
            'robin': 14120,
            'rottweiler': 14121,
            'sabercats': 14122,
            'sabertooth': 14123,
            'salamander': 1003,
            'scorpion': 8005,
            'seagull': 14124,
            'seahorse': 14125,
            'seal': 6068,
            'secretary-bird': 14126,
            'serpent-dragon': 4003,
            'serval': 14127,
            'shark': 2006,
            'sheep': 14128,
            'shiba-inu': 14129,
            'shorthair-cat': 14130,
            'shrew': 14131,
            'siamese': 14132,
            'sifaka': 14133,
            'silver-fox': 14134,
            'skunk': 6069,
            'sloth': 14135,
            'snail': 14136,
            'snake-serpent': 7006,
            'snow-leopard': 14137,
            'sparrow': 14138,
            'squid': 14139,
            'squirrel': 6070,
            'stoat': 14140,
            'stork': 14141,
            'sugar-glider': 14142,
            'sun-bear': 14143,
            'swan': 3011,
            'swift-fox': 14144,
            'tanuki': 5022,
            'tapir': 14145,
            'tasmanian-devil': 14146,
            'thylacine': 14147,
            'tiger': 6029,
            'toucan': 14148,
            'turtle': 7007,
            'vulture': 14149,
            'wallaby': 6041,
            'walrus': 14150,
            'wasp': 14151,
            'weasel': 6049,
            'whale': 2003,
            'wolf': 6016,
            'wolverine': 6050,
            'zebra': 6071
        };
        static gender = {
            'any': '',
            'male': 'male',
            'female': 'female',
            // 'herm': 'herm',
            'trans-male': 'trans_male',
            'trans-female': 'trans_female',
            'intersex': 'intersex',
            'non-binary': 'non_binary',
            // 'multiple': 'multiple',
            // 'other': 'other',
            // 'not-specified': 'not-specified'
        };
        static results = {
            '24': 24,
            '48': 48,
            '72': 72,
            '96': 96,
            '128': 128
        };
    }

    class Search {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/search/';
        }
        static async fetchPage(pageNumber, searchOptions, semaphore) {
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
                pageNumber = 1;
            }
            searchOptions ??= new SearchOptions();
            const payload = {
                'page': pageNumber,
                'q': searchOptions.input,
                'perpage': searchOptions.perPage,
                'order-by': searchOptions.orderBy,
                'order-direction': searchOptions.orderDirection,
                'category': searchOptions.category,
                'arttype': searchOptions.type,
                'species': searchOptions.species,
                'range': searchOptions.range,
                'range_from': undefined,
                'range_to': undefined,
                'rating-general': searchOptions.ratingGeneral ? 1 : 0,
                'rating-mature': searchOptions.ratingMature ? 1 : 0,
                'rating-adult': searchOptions.ratingAdult ? 1 : 0,
                'type-art': searchOptions.typeArt ? 1 : 0,
                'type-music': searchOptions.typeMusic ? 1 : 0,
                'type-flash': searchOptions.typeFlash ? 1 : 0,
                'type-story': searchOptions.typeStory ? 1 : 0,
                'type-photos': searchOptions.typePhotos ? 1 : 0,
                'type-poetry': searchOptions.typePoetry ? 1 : 0,
                'mode': searchOptions.matching
            };
            if (searchOptions.rangeFrom instanceof Date && searchOptions.rangeFrom != null) {
                const year = searchOptions.rangeFrom.getFullYear();
                const month = (searchOptions.rangeFrom.getMonth() + 1).toString().padStart(2, '0');
                const day = searchOptions.rangeFrom.getDate().toString().padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                payload['range_from'] = formattedDate;
            }
            else if (typeof searchOptions.rangeFrom == 'string' && searchOptions.rangeFrom) {
                payload['range_from'] = searchOptions.rangeFrom;
            }
            if (searchOptions.rangeTo instanceof Date && searchOptions.rangeTo != null) {
                const year = searchOptions.rangeTo.getFullYear();
                const month = (searchOptions.rangeTo.getMonth() + 1).toString().padStart(2, '0');
                const day = searchOptions.rangeTo.getDate().toString().padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                payload['range_to'] = formattedDate;
            }
            else if (typeof searchOptions.rangeTo == 'string' && searchOptions.rangeTo) {
                payload['range_to'] = searchOptions.rangeTo;
            }
            for (const key in payload) {
                if (payload[key] == null || payload[key] === 0 || payload[key] === 'off') {
                    delete payload[key];
                }
            }
            const payloadArray = Object.entries(payload).map(([key, value]) => [key, value?.toString() ?? '']);
            const url = Search.hardLink;
            const page = await FuraffinityRequests.postHTML(url, payloadArray, semaphore);
            checkTagsAll(page);
            return page;
        }
        get newSearchOptions() {
            return new SearchOptions();
        }
        static get newSearchOptions() {
            return new SearchOptions();
        }
        get SearchOptions() {
            return SearchOptions;
        }
        static get SearchOptions() {
            return SearchOptions;
        }
        async getFiguresBetweenIds(fromId, toId, searchOptions, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getSearchFiguresTillId(toId, undefined, searchOptions, this._semaphore), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getSearchFiguresSinceId(fromId, undefined, searchOptions, this._semaphore), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getSearchFiguresBetweenIds(fromId, toId, undefined, undefined, searchOptions, this._semaphore, percentId), action, delay);
            }
        }
        async getFiguresBetweenIdsBetweenPages(fromId, toId, fromPageNumber, toPageNumber, searchOptions, action, delay = DEFAULT_ACTION_DELAY) {
            fromId = convertToNumber(fromId);
            toId = convertToNumber(toId);
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromId == null || fromId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getSearchFiguresTillId(toId, fromPageNumber, searchOptions, this._semaphore), action, delay);
            }
            else if (toId == null || toId <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getSearchFiguresSinceId(fromId, toPageNumber, searchOptions, this._semaphore), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getSearchFiguresBetweenIds(fromId, toId, fromPageNumber, toPageNumber, searchOptions, this._semaphore, percentId), action, delay);
            }
        }
        async getFiguresBetweenPages(fromPageNumber, toPageNumber, searchOptions, action, delay = DEFAULT_ACTION_DELAY) {
            fromPageNumber = convertToNumber(fromPageNumber);
            toPageNumber = convertToNumber(toPageNumber);
            if (fromPageNumber == null || fromPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getSearchFiguresTillPage(toPageNumber, searchOptions, this._semaphore, percentId), action, delay);
            }
            else if (toPageNumber == null || toPageNumber <= 0) {
                return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getSearchFiguresSincePage(fromPageNumber, searchOptions, this._semaphore), action, delay);
            }
            else {
                return await WaitAndCallAction.callFunctionAsync((percentId) => SearchRequests.getSearchFiguresBetweenPages(fromPageNumber, toPageNumber, searchOptions, this._semaphore, percentId), action, delay);
            }
        }
        async getFigures(pageNumber, searchOptions, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => SearchRequests.getSearchFigures(pageNumber, searchOptions, this._semaphore), action, delay);
        }
        async getPage(pageNumber, searchOptions, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => Search.fetchPage(pageNumber, searchOptions, this._semaphore), action, delay);
        }
    }
    class SearchOptions {
        input;
        perPage;
        orderBy;
        orderDirection;
        category;
        type;
        species;
        range;
        rangeFrom;
        rangeTo;
        ratingGeneral = true;
        ratingMature = true;
        ratingAdult = true;
        typeArt = true;
        typeMusic = true;
        typeFlash = true;
        typeStory = true;
        typePhotos = true;
        typePoetry = true;
        matching;
        constructor() {
            this.input = '';
            this.perPage = 72;
            this.orderBy = SearchOptions.orderBy['relevancy'];
            this.orderDirection = SearchOptions.orderDirection['descending'];
            this.category = BrowseOptions.category['all'];
            this.type = BrowseOptions.type['all'];
            this.species = BrowseOptions.species['any'];
            this.range = SearchOptions.range['alltime'];
            this.rangeFrom = undefined;
            this.rangeTo = undefined;
            this.matching = SearchOptions.matching['all'];
        }
        static orderBy = {
            'relevancy': 'relevancy',
            'date': 'date',
            'popularity': 'popularity'
        };
        static orderDirection = {
            'ascending': 'asc',
            'descending': 'desc'
        };
        static range = {
            '1day': '1day',
            '3days': '3days',
            '7days': '7days',
            '30days': '30days',
            '90days': '90days',
            '1year': '1year',
            '3years': '3years',
            '5years': '5years',
            'alltime': 'all',
            'manual': 'manual'
        };
        static matching = {
            'all': 'all',
            'any': 'any',
            'extended': 'extended'
        };
    }

    class SearchRequests {
        Browse;
        Search;
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
            this.Browse = new Browse(this._semaphore);
            this.Search = new Search(this._semaphore);
        }
        //#region Browse
        static async getBrowseFiguresTillId(toId, fromPage, browseOptions, semaphore) {
            return await elementsTillId((page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore), toId, fromPage);
        }
        static async getBrowseFiguresSinceId(fromId, toPage, browseOptions, semaphore) {
            return await elementsSinceId((page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore), fromId, toPage);
        }
        static async getBrowseFiguresBetweenIds(fromId, toId, fromPage, toPage, browseOptions, semaphore, percentId) {
            return await elementsBetweenIds((page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore), fromId, toId, fromPage, toPage, percentId);
        }
        static async getBrowseFiguresTillPage(toPageNumber, browseOptions, semaphore, percentId) {
            return await elementsTillPage((page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore), toPageNumber, percentId);
        }
        static async getBrowseFiguresSincePage(fromPageNumber, browseOptions, semaphore) {
            return await elementsSincePage((page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore), fromPageNumber);
        }
        static async getBrowseFiguresBetweenPages(fromPageNumber, toPageNumber, browseOptions, semaphore, percentId) {
            return await elementsBetweenPages((page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore), fromPageNumber, toPageNumber, percentId);
        }
        static async getBrowseFigures(pageNumber, browseOptions, semaphore) {
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('No pageNumber given. Using default value of 1.');
                pageNumber = 1;
            }
            const galleryDoc = await Browse.fetchPage(pageNumber, browseOptions, semaphore);
            if (galleryDoc == null || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
                Logger.logInfo(`No images found at browse on page "${pageNumber}".`);
                return [];
            }
            const figures = galleryDoc.getElementsByTagName('figure');
            if (figures == null || figures.length === 0) {
                Logger.logInfo(`No figures found at browse on page "${pageNumber}".`);
                return [];
            }
            return Array.from(figures);
        }
        //#endregion
        //#region Search
        static async getSearchFiguresTillId(toId, fromPage, searchOptions, semaphore) {
            return await elementsTillId((page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore), toId, fromPage);
        }
        static async getSearchFiguresSinceId(fromId, toPage, searchOptions, semaphore) {
            return await elementsSinceId((page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore), fromId, toPage);
        }
        static async getSearchFiguresBetweenIds(fromId, toId, fromPage, toPage, searchOptions, semaphore, percentId) {
            return await elementsBetweenIds((page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore), fromId, toId, fromPage, toPage, percentId);
        }
        static async getSearchFiguresTillPage(toPageNumber, searchOptions, semaphore, percentId) {
            return await elementsTillPage((page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore), toPageNumber, percentId);
        }
        static async getSearchFiguresSincePage(fromPageNumber, searchOptions, semaphore) {
            return await elementsSincePage((page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore), fromPageNumber);
        }
        static async getSearchFiguresBetweenPages(fromPageNumber, toPageNumber, searchOptions, semaphore, percentId) {
            return await elementsBetweenPages((page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore), fromPageNumber, toPageNumber, percentId);
        }
        static async getSearchFigures(pageNumber, searchOptions, semaphore) {
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('No pageNumber given. Using default value of 1.');
                pageNumber = 1;
            }
            const galleryDoc = await Search.fetchPage(pageNumber, searchOptions, semaphore);
            if (galleryDoc == null || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
                Logger.logInfo(`No images found at search on page "${pageNumber}".`);
                return [];
            }
            const figures = galleryDoc.getElementsByTagName('figure');
            if (figures == null || figures.length === 0) {
                Logger.logInfo(`No figures found at search on page "${pageNumber}".`);
                return [];
            }
            return Array.from(figures);
        }
    }

    class UserRequests {
        GalleryRequests;
        SearchRequests;
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
            this.GalleryRequests = new GalleryRequests(this._semaphore);
            this.SearchRequests = new SearchRequests(this._semaphore);
        }
        static get hardLinks() {
            return {
                user: FuraffinityRequests.fullUrl + '/user/',
                watch: FuraffinityRequests.fullUrl + '/watch/',
                unwatch: FuraffinityRequests.fullUrl + '/unwatch/',
                block: FuraffinityRequests.fullUrl + '/block/',
                unblock: FuraffinityRequests.fullUrl + '/unblock/',
            };
        }
        async getUserPage(username, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._getUserPage(username), action, delay);
        }
        async watchUser(username, watchKey, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._watchUser(username, watchKey), action, delay);
        }
        async unwatchUser(username, unwatchKey, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._unwatchUser(username, unwatchKey), action, delay);
        }
        async blockUser(username, blockKey, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._blockUser(username, blockKey), action, delay);
        }
        async unblockUser(username, unblockKey, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._unblockUser(username, unblockKey), action, delay);
        }
        async _getUserPage(username) {
            if (username == null) {
                Logger.logWarning('No username given');
                return;
            }
            const url = UserRequests.hardLinks['user'] + username;
            return await FuraffinityRequests.getHTML(url, this._semaphore);
        }
        async _watchUser(username, watchKey) {
            if (username == null || username === '') {
                throw new Error('No username given');
            }
            if (watchKey == null || watchKey === '' || watchKey === -1) {
                throw new Error('No watch key given');
            }
            const url = UserRequests.hardLinks['watch'] + username + '?key=' + watchKey;
            return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
        }
        async _unwatchUser(username, unwatchKey) {
            if (username == null || username === '') {
                throw new Error('No username given');
            }
            if (unwatchKey == null || unwatchKey === '' || unwatchKey === -1) {
                throw new Error('No unwatch key given');
            }
            const url = UserRequests.hardLinks['unwatch'] + username + '?key=' + unwatchKey;
            return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
        }
        async _blockUser(username, blockKey) {
            if (username == null || username === '') {
                throw new Error('No username given');
            }
            if (blockKey == null || blockKey === '' || blockKey === -1) {
                throw new Error('No block key given');
            }
            const url = UserRequests.hardLinks['block'] + username + '?key=' + blockKey;
            return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
        }
        async _unblockUser(username, unblockKey) {
            if (username == null || username === '') {
                throw new Error('No username given');
            }
            if (unblockKey == null || unblockKey === '' || unblockKey === -1) {
                throw new Error('No unblock key given');
            }
            const url = UserRequests.hardLinks['unblock'] + username + '?key=' + unblockKey;
            return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
        }
    }

    class NewSubmissions {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/msg/submissions/';
        }
        async getSubmissionsPage(firstSubmissionId, action, delay = DEFAULT_ACTION_DELAY) {
            firstSubmissionId = convertToNumber(firstSubmissionId);
            return await WaitAndCallAction.callFunctionAsync(() => this._getSubmissionsPage(firstSubmissionId), action, delay);
        }
        async removeSubmissions(submissionIds, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._removeSubmissions(submissionIds), action, delay);
        }
        async nukeSubmissions(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._nukeSubmissions(), action, delay);
        }
        async _getSubmissionsPage(firstSubmissionId) {
            if (firstSubmissionId == null || firstSubmissionId <= 0) {
                return await FuraffinityRequests.getHTML(`${NewSubmissions.hardLink}new@72/`, this._semaphore);
            }
            else {
                return await FuraffinityRequests.getHTML(`${NewSubmissions.hardLink}new~${firstSubmissionId}@72/`, this._semaphore);
            }
        }
        async _removeSubmissions(submissionIds) {
            if (submissionIds == null || submissionIds.length === 0) {
                throw new Error('No submission ids to remove');
            }
            const payload = [
                ['messagecenter-action', Message.hardActions['remove']],
            ];
            for (const submissionId of submissionIds) {
                payload.push(['submissions[]', submissionId.toString()]);
            }
            return await FuraffinityRequests.postHTML(`${NewSubmissions.hardLink}new@72/`, payload, this._semaphore);
        }
        async _nukeSubmissions() {
            const payload = [
                ['messagecenter-action', Message.hardActions['nuke']],
            ];
            return await FuraffinityRequests.postHTML(`${NewSubmissions.hardLink}new@72/`, payload, this._semaphore);
        }
    }

    class MessageTypeRequests {
        _semaphore;
        _removeAction;
        _nukeAction;
        _fieldName;
        get _hardLink() {
            return FuraffinityRequests.fullUrl + '/msg/others/';
        }
        constructor(semaphore, removeAction, nukeAction, fieldName) {
            this._semaphore = semaphore;
            this._removeAction = removeAction;
            this._nukeAction = nukeAction;
            this._fieldName = fieldName;
        }
        async removeMessages(ids, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._removeMessages(ids), action, delay);
        }
        async nukeMessages(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._nukeMessages(), action, delay);
        }
        async _removeMessages(ids) {
            if (ids == null || ids.length === 0) {
                throw new Error('No message ids to remove');
            }
            const payload = [this._removeAction];
            for (const id of ids) {
                payload.push([this._fieldName, id.toString()]);
            }
            return await FuraffinityRequests.postHTML(this._hardLink, payload, this._semaphore);
        }
        async _nukeMessages() {
            const payload = [this._nukeAction];
            return await FuraffinityRequests.postHTML(this._hardLink, payload, this._semaphore);
        }
    }

    class NewMessages {
        Watches;
        JournalComments;
        Shouts;
        Favorites;
        Journals;
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
            this.Watches = new MessageTypeRequests(semaphore, ['remove-watches', 'Remove Selected Watches'], ['nuke-watches', 'Nuke Watches'], 'watches[]');
            this.JournalComments = new MessageTypeRequests(semaphore, ['remove-journal-comments', 'Remove Selected Comments'], ['nuke-journal-comments', 'Nuke Journal Comments'], 'comments-journals[]');
            this.Shouts = new MessageTypeRequests(semaphore, ['remove-shouts', 'Remove Selected Shouts'], ['nuke-shouts', 'Nuke Shouts'], 'shouts[]');
            this.Favorites = new MessageTypeRequests(semaphore, ['remove-favorites', 'Remove Selected Favorites'], ['nuke-favorites', 'Nuke Favorites'], 'favorites[]');
            this.Journals = new MessageTypeRequests(semaphore, ['remove-journals', 'Remove Selected Journals'], ['nuke-journals', 'Nuke Journals'], 'journals[]');
        }
        static get hardLink() {
            return FuraffinityRequests.fullUrl + '/msg/others/';
        }
        static hardActions = {
            remove: ['remove-all', 'Remove Selected'],
            nuke: ['nuke-all', 'Nuke Selected'],
        };
        async getMessagesPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(NewMessages.hardLink, this._semaphore), action, delay);
        }
        async removeMessages(userIds, journalCommentIds, shoutIds, favoriteIds, journalIds, action, delay = DEFAULT_ACTION_DELAY) {
            userIds ??= [];
            journalCommentIds ??= [];
            shoutIds ??= [];
            favoriteIds ??= [];
            journalIds ??= [];
            return await WaitAndCallAction.callFunctionAsync(() => this._removeMessages(userIds, journalCommentIds, shoutIds, favoriteIds, journalIds), action, delay);
        }
        async _removeMessages(userIds, journalCommentIds, shoutIds, favoriteIds, journalIds) {
            const payload = [
                NewMessages.hardActions['remove'],
            ];
            for (const id of userIds)
                payload.push(['watches[]', id.toString()]);
            for (const id of journalCommentIds)
                payload.push(['journalcomments[]', id.toString()]);
            for (const id of shoutIds)
                payload.push(['shouts[]', id.toString()]);
            for (const id of favoriteIds)
                payload.push(['favorites[]', id.toString()]);
            for (const id of journalIds)
                payload.push(['journals[]', id.toString()]);
            if (payload.length === 1) {
                throw new Error('No messages to remove');
            }
            return await FuraffinityRequests.postHTML(NewMessages.hardLink, payload, this._semaphore);
        }
    }

    class Message {
        NewSubmissions;
        NewMessages;
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
            this.NewSubmissions = new NewSubmissions(this._semaphore);
            this.NewMessages = new NewMessages(this._semaphore);
        }
        static get hardActions() {
            return {
                remove: 'remove_checked',
                nuke: 'nuke_notifications',
            };
        }
        ;
    }

    class AccountInformation {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLinks() {
            return {
                settings: FuraffinityRequests.fullUrl + '/controls/settings/',
                siteSettings: FuraffinityRequests.fullUrl + '/controls/site-settings/',
                userSettings: FuraffinityRequests.fullUrl + '/controls/user-settings/',
            };
        }
        async getSettingsPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(AccountInformation.hardLinks['settings'], this._semaphore), action, delay);
        }
        async getSiteSettingsPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(AccountInformation.hardLinks['siteSettings'], this._semaphore), action, delay);
        }
        async getUserSettingsPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(AccountInformation.hardLinks['userSettings'], this._semaphore), action, delay);
        }
    }

    class UserProfile {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLinks() {
            return {
                profile: FuraffinityRequests.fullUrl + '/controls/profile/',
                profilebanner: FuraffinityRequests.fullUrl + '/controls/profilebanner/',
                contacts: FuraffinityRequests.fullUrl + '/controls/contacts/',
                avatar: FuraffinityRequests.fullUrl + '/controls/avatar/',
            };
        }
        async getProfilePage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['profile'], this._semaphore), action, delay);
        }
        async getProfilebannerPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['profilebanner'], this._semaphore), action, delay);
        }
        async getContactsPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['contacts'], this._semaphore), action, delay);
        }
        async getAvatarPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['avatar'], this._semaphore), action, delay);
        }
    }

    class ManageContent {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLinks() {
            return {
                submissions: FuraffinityRequests.fullUrl + '/controls/submissions/',
                folders: FuraffinityRequests.fullUrl + '/controls/folders/submissions/',
                journals: FuraffinityRequests.fullUrl + '/controls/journal/',
                favorites: FuraffinityRequests.fullUrl + '/controls/favorites/',
                buddylist: FuraffinityRequests.fullUrl + '/controls/buddylist/',
                shouts: FuraffinityRequests.fullUrl + '/controls/shouts/',
                badges: FuraffinityRequests.fullUrl + '/controls/badges/',
            };
        }
        async getFoldersPages(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(ManageContent.hardLinks['folders'], this._semaphore), action, delay);
        }
        async getAllWatchesPages(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._getAllWatchesPages(), action, delay);
        }
        async getWatchesPage(pageNumber, action, delay = DEFAULT_ACTION_DELAY) {
            pageNumber = convertToNumber(pageNumber);
            return await WaitAndCallAction.callFunctionAsync(() => this._getWatchesPage(pageNumber), action, delay);
        }
        async _getAllWatchesPages() {
            let usersDoc = await FuraffinityRequests.getHTML(ManageContent.hardLinks['buddylist'] + 'x', this._semaphore);
            const columnPage = usersDoc?.getElementById('columnpage');
            const sectionBody = columnPage?.querySelector('div[class="section-body"');
            const paginationLinks = sectionBody?.querySelector('div[class*="pagination-links"]');
            const pages = paginationLinks?.querySelectorAll(':scope > a');
            const userPageDocs = [];
            if (pages != null) {
                for (let i = 1; i <= pages.length; i++) {
                    usersDoc = await this._getWatchesPage(i);
                    if (usersDoc)
                        userPageDocs.push(usersDoc);
                }
            }
            return userPageDocs;
        }
        async _getWatchesPage(pageNumber) {
            if (pageNumber == null || pageNumber <= 0) {
                Logger.logWarning('No page number given. Using default 1 instead.');
                pageNumber = 1;
            }
            return await FuraffinityRequests.getHTML(ManageContent.hardLinks['buddylist'] + pageNumber, this._semaphore);
        }
    }

    class Security {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLinks() {
            return {
                sessions: FuraffinityRequests.fullUrl + '/controls/sessions/logins/',
                logs: FuraffinityRequests.fullUrl + '/controls/logs/',
                labels: FuraffinityRequests.fullUrl + '/controls/labels/',
            };
        }
        async getSessionsPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(Security.hardLinks['sessions'], this._semaphore), action, delay);
        }
        async getLogsPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(Security.hardLinks['logs'], this._semaphore), action, delay);
        }
        async getLabelsPage(action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(Security.hardLinks['labels'], this._semaphore), action, delay);
        }
    }

    class PersonalUserRequests {
        MessageRequests;
        AccountInformation;
        UserProfile;
        ManageContent;
        Security;
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
            this.MessageRequests = new Message(this._semaphore);
            this.AccountInformation = new AccountInformation(this._semaphore);
            this.UserProfile = new UserProfile(this._semaphore);
            this.ManageContent = new ManageContent(this._semaphore);
            this.Security = new Security(this._semaphore);
        }
    }

    class SubmissionRequests {
        _semaphore;
        constructor(semaphore) {
            this._semaphore = semaphore;
        }
        static get hardLinks() {
            return {
                view: FuraffinityRequests.fullUrl + '/view/',
                fav: FuraffinityRequests.fullUrl + '/fav/',
                unfav: FuraffinityRequests.fullUrl + '/unfav/',
                journal: FuraffinityRequests.fullUrl + '/journal/',
            };
        }
        async getSubmissionPage(submissionId, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._getSubmissionPage(submissionId), action, delay);
        }
        async favSubmission(submissionId, favKey, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._favSubmission(submissionId, favKey), action, delay);
        }
        async unfavSubmission(submissionId, unfavKey, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._unfavSubmission(submissionId, unfavKey), action, delay);
        }
        async getJournalPage(journalId, action, delay = DEFAULT_ACTION_DELAY) {
            return await WaitAndCallAction.callFunctionAsync(() => this._getJournalPage(journalId), action, delay);
        }
        async _getSubmissionPage(submissionId) {
            if (submissionId == null || submissionId === '' || submissionId === -1) {
                throw new Error('No submissionId given');
            }
            const url = SubmissionRequests.hardLinks['view'] + submissionId;
            return await FuraffinityRequests.getHTML(url, this._semaphore);
        }
        async _favSubmission(submissionId, favKey) {
            if (submissionId == null || submissionId === '' || submissionId === -1) {
                throw new Error('No submissionId given');
            }
            if (favKey == null || favKey === '' || favKey === -1) {
                throw new Error('No favKey given');
            }
            const url = SubmissionRequests.hardLinks['fav'] + submissionId + '?key=' + favKey;
            const resultDoc = await FuraffinityRequests.getHTML(url, this._semaphore);
            if (resultDoc == null) {
                throw new Error('Failed to fetch fav page');
            }
            const standardpage = resultDoc.getElementById('standardpage');
            if (standardpage) {
                const blocked = standardpage.querySelector('div[class="redirect-message"]');
                if (blocked != null && (blocked.textContent?.includes('blocked') ?? false)) {
                    throw new Error(blocked.textContent?.trim() ?? 'Cannot fav: you are blocked by this user');
                }
            }
            return this._getFavKey(resultDoc);
        }
        async _unfavSubmission(submissionId, unfavKey) {
            if (submissionId == null || submissionId === '' || submissionId === -1) {
                throw new Error('No submissionId given');
            }
            if (unfavKey == null || unfavKey === '' || unfavKey === -1) {
                throw new Error('No unfavKey given');
            }
            const url = SubmissionRequests.hardLinks['unfav'] + submissionId + '?key=' + unfavKey;
            const resultDoc = await FuraffinityRequests.getHTML(url, this._semaphore);
            if (resultDoc == null) {
                throw new Error('Failed to fetch unfav page');
            }
            return this._getFavKey(resultDoc);
        }
        async _getJournalPage(journalId) {
            if (journalId == null || journalId === '' || journalId === -1) {
                throw new Error('No journalId given');
            }
            const url = SubmissionRequests.hardLinks['journal'] + journalId;
            return await FuraffinityRequests.getHTML(url, this._semaphore);
        }
        _getFavKey(doc) {
            const columnPage = doc.getElementById('columnpage');
            const navbar = columnPage?.querySelector('div[class*="favorite-nav"');
            const buttons = navbar?.querySelectorAll('a[class*="button"][href]');
            if (!buttons || buttons.length === 0) {
                return;
            }
            let favButton;
            for (const button of Array.from(buttons)) {
                if (button?.textContent?.toLowerCase().includes('fav') ?? false) {
                    favButton = button;
                }
            }
            if (favButton != null) {
                return favButton.getAttribute('href')?.split('?key=')[1];
            }
        }
    }

    class FuraffinityRequests {
        UserRequests;
        PersonalUserRequests;
        SubmissionRequests;
        static logLevel = 1;
        static Types = {
            BrowseOptions: BrowseOptions,
            SearchOptions: SearchOptions
        };
        _semaphore;
        static _useHttps = window.location.protocol.includes('https');
        static _httpsString = window.location.protocol.trimEnd(':') + '://';
        static _domain = window.location.hostname;
        constructor(maxAmountRequests = 2) {
            this._semaphore = new Semaphore(maxAmountRequests);
            this.UserRequests = new UserRequests(this._semaphore);
            this.PersonalUserRequests = new PersonalUserRequests(this._semaphore);
            this.SubmissionRequests = new SubmissionRequests(this._semaphore);
        }
        set maxAmountRequests(value) {
            if (this._semaphore.maxConcurrency === value) {
                return;
            }
            this._semaphore.maxConcurrency = value;
        }
        get maxAmountRequests() {
            return this._semaphore.maxConcurrency;
        }
        static set useHttps(value) {
            if (FuraffinityRequests._useHttps === value) {
                return;
            }
            FuraffinityRequests._useHttps = value;
            if (value) {
                FuraffinityRequests._httpsString = 'https://';
            }
            else {
                FuraffinityRequests._httpsString = 'http://';
            }
        }
        static get useHttps() {
            return FuraffinityRequests._useHttps;
        }
        static get fullUrl() {
            return FuraffinityRequests._httpsString + FuraffinityRequests._domain;
        }
        static async getHTML(url, semaphore, action, delay = DEFAULT_ACTION_DELAY) {
            if (url == null || url === '') {
                throw new Error('No url given for GET request');
            }
            return await WaitAndCallAction.callFunctionAsync(() => getHTMLLocal(url, semaphore), action, delay);
        }
        static async postHTML(url, payload, semaphore, action, delay = DEFAULT_ACTION_DELAY) {
            if (url == null || url === '') {
                throw new Error('No url given for POST request');
            }
            return await WaitAndCallAction.callFunctionAsync(() => postHTMLLocal(url, payload, semaphore), action, delay);
        }
    }
    async function getHTMLLocal(url, semaphore) {
        Logger.logInfo(`Requesting '${url}'`);
        const semaphoreActive = semaphore != null && semaphore.maxConcurrency > 0;
        if (semaphoreActive) {
            // Acquire a slot in the semaphore to ensure that the maximum concurrency is not exceeded.
            await semaphore.acquire();
        }
        try {
            // Send the GET request and retrieve the HTML document.
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status} for: ${url}`);
            }
            const html = await response.text();
            // Parse the HTML document using a DOMParser.
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return doc;
        }
        catch (error) {
            // Enrich network-level errors (e.g. "Failed to fetch") with the URL for better diagnostics.
            const message = error instanceof Error ? error.message : String(error);
            const enriched = new Error(`${message} (URL: ${url})`);
            Logger.logError(enriched);
            throw enriched;
        }
        finally {
            // Release the slot in the semaphore.
            if (semaphoreActive) {
                semaphore.release();
            }
        }
    }
    async function postHTMLLocal(url, payload, semaphore) {
        // Check if the semaphore is active and acquire it if necessary
        const semaphoreActive = semaphore != null && semaphore.maxConcurrency > 0;
        if (semaphoreActive) {
            await semaphore.acquire();
        }
        try {
            // Send a POST request with the given payload
            const response = await fetch(url, {
                method: 'POST',
                body: new URLSearchParams(payload).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            // Check if the response is not ok and throw an error
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status} for: ${url}`);
            }
            const responseData = await response.text();
            // Parse the response data as an HTML document
            const parser = new DOMParser();
            const doc = parser.parseFromString(responseData, 'text/html');
            return doc;
        }
        catch (error) {
            // Enrich network-level errors (e.g. "Failed to fetch") with the URL for better diagnostics.
            const message = error instanceof Error ? error.message : String(error);
            const enriched = new Error(`${message} (URL: ${url})`);
            Logger.logError(enriched);
            throw enriched;
        }
        finally {
            // Release the semaphore if it was acquired
            if (semaphoreActive) {
                semaphore.release();
            }
        }
    }

    Object.defineProperties(window, {
        FARequestHelper: { get: () => FuraffinityRequests }
    });

})();
