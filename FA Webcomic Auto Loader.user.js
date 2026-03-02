// ==UserScript==
// @name        FA Webcomic Auto Loader
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @require     https://greasyfork.org/scripts/483952-furaffinity-request-helper/code/483952-furaffinity-request-helper.js
// @require     https://greasyfork.org/scripts/485827-furaffinity-match-list/code/485827-furaffinity-match-list.js
// @require     https://greasyfork.org/scripts/528997-furaffinity-message-box/code/528997-furaffinity-message-box.js
// @require     https://greasyfork.org/scripts/485153-furaffinity-loading-animations/code/485153-furaffinity-loading-animations.js
// @require     https://greasyfork.org/scripts/475041-furaffinity-custom-settings/code/475041-furaffinity-custom-settings.js
// @grant       GM_info
// @version     2.2.11
// @author      Midori Dragon
// @description Gives you the option to load all the subsequent comic pages on a FurAffinity comic page automatically. Even for pages without given Links
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/457759-fa-webcomic-auto-loader
// @supportURL  https://greasyfork.org/scripts/457759-fa-webcomic-auto-loader/feedback
// ==/UserScript==
// jshint esversion: 11
(function (exports) {
    'use strict';

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

    function getCurrViewSid (doc) {
        let ogUrl = doc.querySelector('meta[property="og:url"]').getAttribute('content');
        if (ogUrl == null) {
            return -1;
        }
        ogUrl = ogUrl.trimEnd('/');
        return parseInt(ogUrl.split('/').pop());
    }

    class string {
        static isNullOrWhitespace(str) {
            return str == null || str.trim() === '';
        }
        static isNullOrEmpty(str) {
            return str == null || str === '';
        }
    }

    class ComicNavigation {
        prevId = -1;
        firstId = -1;
        nextId = -1;
        constructor(prevId, firstId, nextId) {
            this.prevId = prevId;
            this.firstId = firstId;
            this.nextId = nextId;
        }
        static fromElement(elem) {
            const comicNav = new ComicNavigation(-1, -1, -1);
            const navElems = elem.querySelectorAll('a[href*="view"]');
            if (navElems == null || navElems.length === 0) {
                return null;
            }
            for (const navElem of Array.from(navElems)) {
                const navText = navElem?.textContent?.toLowerCase();
                if (string.isNullOrWhitespace(navText)) {
                    continue;
                }
                let idText = navElem.getAttribute('href');
                if (string.isNullOrWhitespace(idText)) {
                    continue;
                }
                const i = idText.search(/[?#]/);
                idText = i === -1 ? idText : idText.slice(0, i);
                idText = idText.trimEnd('/');
                idText = idText.split('/').pop();
                if (navText.includes('prev')) {
                    comicNav.prevId = parseInt(idText);
                }
                else if (navText.includes('next')) {
                    comicNav.nextId = parseInt(idText);
                }
                else if (navText.includes('start') || navText.includes('first')) {
                    comicNav.firstId = parseInt(idText);
                }
            }
            return comicNav;
        }
    }

    class AutoLoaderSearch {
        rootImg;
        rootSid;
        currComicNav;
        currImgIndex = 1;
        currSid = -1;
        constructor(rootImg, rootSid, comicNav) {
            this.rootImg = rootImg;
            this.rootSid = rootSid;
            this.currComicNav = comicNav;
        }
        async search() {
            const loadedImgs = {};
            loadedImgs[this.rootSid] = this.rootImg;
            Logger.logInfo(`${scriptName}: starting search...`);
            do {
                try {
                    if (this.currComicNav == null) {
                        break;
                    }
                    const img = await this.getPage(this.currComicNav.nextId);
                    if (img == null) {
                        break;
                    }
                    if (this.currSid in loadedImgs) {
                        break;
                    }
                    Logger.logInfo(`${scriptName}: found image with sid '${this.currSid}'`);
                    loadedImgs[this.currSid] = img;
                    this.currImgIndex++;
                }
                catch (error) {
                    Logger.logError(error);
                    break;
                }
            } while (this.currComicNav?.nextId !== -1);
            Logger.logInfo(`${scriptName}: finished search. Found ${Object.keys(loadedImgs).length} images.`);
            return loadedImgs;
        }
        async getPage(sid) {
            if (sid <= 0) {
                return undefined;
            }
            const page = (await requestHelper.SubmissionRequests.getSubmissionPage(sid));
            const img = page.getElementById('submissionImg');
            img.setAttribute('wal-index', this.currImgIndex.toString());
            img.setAttribute('wal-sid', sid.toString());
            this.currSid = getCurrViewSid(page);
            const descriptionElem = page.getElementById('columnpage')?.querySelector('div[class*="submission-description"]');
            if (descriptionElem != null) {
                this.currComicNav = ComicNavigation.fromElement(descriptionElem);
            }
            else {
                this.currComicNav = null;
            }
            return img;
        }
    }

    function isSubmissionPageInGallery (doc) {
        const columnPage = doc.getElementById('columnpage');
        const favNav = columnPage?.querySelector('div[class*="favorite-nav"]');
        const mainGalleryButton = favNav?.querySelector('a[title*="submissions"]');
        if (mainGalleryButton != null && mainGalleryButton.href.includes('gallery')) {
            return true;
        }
        return false;
    }

    function isSubmissionPageInScraps (doc) {
        const columnPage = doc.getElementById('columnpage');
        const favNav = columnPage?.querySelector('div[class*="favorite-nav"]');
        const mainGalleryButton = favNav?.querySelector('a[title*="submissions"]');
        if (mainGalleryButton != null && mainGalleryButton.href.includes('scraps')) {
            return true;
        }
        return false;
    }

    function getCurrGalleryFolder () {
        const url = window.location.toString().toLowerCase();
        if (!url.includes('/gallery/') || !url.includes('/folder/')) {
            return null;
        }
        const folderId = getFolderIdFromUrl(url);
        const folderName = getFolderNameFromUrl(url);
        if (folderId == null || folderName == null) {
            return null;
        }
        return [parseInt(folderId), folderName];
    }
    function getFolderIdFromUrl(url) {
        const match = url.match(/\/folder\/(\d+)(?=\/|$)/);
        return match ? match[1] : null;
    }
    function getFolderNameFromUrl(url) {
        const match = url.match(/\/folder\/\d+\/([^\/\?]+)(?=\/|$)/);
        return match ? match[1] : null;
    }

    function generalizeString (inputString, textToNumbers, removeCommonPhrases, removeSpecialChars, removeNumbers, removeSpaces, removeRoman) {
        let outputString = inputString.toLowerCase();
        {
            const commonPhrases = ['page', 'part', 'book', 'episode'];
            outputString = outputString.replace(new RegExp(`(?:^|\\s)(${commonPhrases.join('|')})(?:\\s|$)`, 'g'), '');
        }
        {
            const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx']; //Checks only up to 20
            outputString = outputString.replace(new RegExp(`(?:^|[^a-zA-Z])(${roman.join('|')})(?:[^a-zA-Z]|$)`, 'g'), '');
        }
        {
            const numbers = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };
            outputString = outputString.replace(new RegExp(Object.keys(numbers).join('|'), 'gi'), match => numbers[match.toLowerCase()].toString());
        }
        {
            outputString = outputString.replace(/[^a-zA-Z0-9 ]/g, '');
        }
        {
            outputString = outputString.replace(/[^a-zA-Z ]/g, '');
        }
        {
            outputString = outputString.replace(/\s/g, '');
        }
        return outputString;
    }

    function figureTitleIsGenerallyEqual (figure, title) {
        const figCaption = figure.querySelector('figcaption');
        const titleElem = figCaption?.querySelector('a[href*="view"]');
        if (titleElem != null) {
            const figTitle = titleElem.title.toLowerCase();
            const figTitleGeneralized = generalizeString(figTitle);
            const currTitleGeneralized = generalizeString(title);
            if (string.isNullOrWhitespace(figTitleGeneralized) || string.isNullOrWhitespace(currTitleGeneralized)) {
                return false;
            }
            return figTitleGeneralized.includes(currTitleGeneralized) || currTitleGeneralized.includes(figTitleGeneralized);
        }
        return false;
    }

    function getDocUsername (doc) {
        const columnPage = doc.getElementById('columnpage');
        const submissionIdContainer = columnPage?.querySelector('div[class*="submission-id-container"]');
        const usernameContainer = submissionIdContainer?.querySelector('a[href*="user"]');
        if (usernameContainer != null) {
            let username = usernameContainer.href;
            username = username.trimEnd('/');
            username = username.split('/').pop();
            return username;
        }
    }

    class BackwardSearch {
        currSubmissionPageNo;
        sidToIgnore = [];
        _currSid;
        _amount;
        constructor(currSid, amount, currSubmissionPageNo) {
            this._currSid = currSid;
            this._amount = amount;
            this.currSubmissionPageNo = currSubmissionPageNo;
            this.sidToIgnore.push(currSid);
        }
        async search() {
            const isInGallery = isSubmissionPageInGallery(document);
            const isInScraps = isSubmissionPageInScraps(document);
            if (!isInGallery && !isInScraps) {
                return {};
            }
            const columnpage = document.getElementById('columnpage');
            const submissionIdContainer = columnpage?.querySelector('div[class*="submission-id-container"]');
            const submissionTitle = submissionIdContainer?.querySelector('div[class*="submission-title"]');
            const currTitle = submissionTitle?.querySelector('h2')?.querySelector('p')?.textContent;
            if (string.isNullOrWhitespace(currTitle)) {
                return {};
            }
            const currUsername = getDocUsername(document);
            const galleryFolder = getCurrGalleryFolder();
            const folder = galleryFolder != null ? { id: galleryFolder[0], name: galleryFolder[1] } : undefined;
            Logger.logInfo(`${scriptName}: finding submission page...`);
            if (this.currSubmissionPageNo == null || this.currSubmissionPageNo < 1) {
                if (isInGallery) {
                    this.currSubmissionPageNo = await requestHelper.UserRequests.GalleryRequests.Gallery.getSubmissionPageNo(currUsername, this._currSid, folder, -1, -1);
                }
                else if (isInScraps) {
                    this.currSubmissionPageNo = await requestHelper.UserRequests.GalleryRequests.Scraps.getSubmissionPageNo(currUsername, this._currSid, -1, -1);
                }
            }
            Logger.logInfo(`${scriptName}: found submission on page '${this.currSubmissionPageNo}'`);
            Logger.logInfo(`${scriptName}: searching figures backward...`);
            let figures = [];
            if (isInGallery) {
                figures = await requestHelper.UserRequests.GalleryRequests.Gallery.getFiguresInFolderBetweenPages(currUsername, folder, this.currSubmissionPageNo, this.currSubmissionPageNo + this._amount);
            }
            else if (isInScraps) {
                figures = await requestHelper.UserRequests.GalleryRequests.Scraps.getFiguresBetweenPages(currUsername, this.currSubmissionPageNo, this.currSubmissionPageNo + this._amount);
            }
            let figuresFlattend = figures.flat();
            figuresFlattend = figuresFlattend.filter(figure => !this.sidToIgnore.includes(parseInt(figure.id.trimStart('sid-'))));
            figuresFlattend = figuresFlattend.filter(figure => figureTitleIsGenerallyEqual(figure, currTitle));
            figuresFlattend.reverse();
            Logger.logInfo(`${scriptName}: searching figures backward found '${figuresFlattend.length}' figures`);
            Logger.logInfo(`${scriptName}: loading submission pages...`);
            const result = {};
            for (let i = 0; i < figuresFlattend.length; i++) {
                const figureSid = figuresFlattend[i].id.trimStart('sid-');
                const subDoc = await requestHelper.SubmissionRequests.getSubmissionPage(parseInt(figureSid));
                const img = subDoc?.getElementById('submissionImg');
                if (img == null) {
                    continue;
                }
                img.setAttribute('wal-index', (-(figuresFlattend.length - i)).toString());
                img.setAttribute('wal-sid', figureSid);
                result[parseInt(figureSid)] = img;
                Logger.logInfo(`${scriptName}: loaded submission '${figureSid}' with index '${(-(figuresFlattend.length - i)).toString()}'`);
            }
            return result;
        }
    }

    class ForwardSearch {
        currSubmissionPageNo;
        sidToIgnore = [];
        _currSid;
        constructor(currSid, currSubmissionPageNo) {
            this._currSid = currSid;
            this.currSubmissionPageNo = currSubmissionPageNo;
            this.sidToIgnore.push(currSid);
        }
        async search() {
            const isInGallery = isSubmissionPageInGallery(document);
            const isInScraps = isSubmissionPageInScraps(document);
            if (!isInGallery && !isInScraps) {
                return {};
            }
            const columnpage = document.getElementById('columnpage');
            const submissionIdContainer = columnpage?.querySelector('div[class*="submission-id-container"]');
            const submissionTitle = submissionIdContainer?.querySelector('div[class*="submission-title"]');
            const currTitle = submissionTitle?.querySelector('h2')?.querySelector('p')?.textContent;
            if (string.isNullOrWhitespace(currTitle)) {
                return {};
            }
            const currUsername = getDocUsername(document);
            const galleryFolder = getCurrGalleryFolder();
            const folder = galleryFolder != null ? { id: galleryFolder[0], name: galleryFolder[1] } : undefined;
            Logger.logInfo(`${scriptName}: finding submission page...`);
            if (this.currSubmissionPageNo == null || this.currSubmissionPageNo < 1) {
                if (isInGallery) {
                    this.currSubmissionPageNo = await requestHelper.UserRequests.GalleryRequests.Gallery.getSubmissionPageNo(currUsername, this._currSid, folder, -1, -1);
                }
                else if (isInScraps) {
                    this.currSubmissionPageNo = await requestHelper.UserRequests.GalleryRequests.Scraps.getSubmissionPageNo(currUsername, this._currSid, -1, -1);
                }
            }
            Logger.logInfo(`${scriptName}: found submission on page '${this.currSubmissionPageNo}'`);
            Logger.logInfo(`${scriptName}: searching figures forward...`);
            let figures = [];
            if (isInGallery) {
                figures = await requestHelper.UserRequests.GalleryRequests.Gallery.getFiguresInFolderBetweenIds(currUsername, folder, undefined, this._currSid);
            }
            else if (isInScraps) {
                figures = await requestHelper.UserRequests.GalleryRequests.Scraps.getFiguresBetweenIds(currUsername, undefined, this._currSid);
            }
            let figuresFlattend = figures.flat();
            figuresFlattend = figuresFlattend.filter(figure => !this.sidToIgnore.includes(parseInt(figure.id.trimStart('sid-'))));
            figuresFlattend = figuresFlattend.filter(figure => figureTitleIsGenerallyEqual(figure, currTitle));
            figuresFlattend.reverse();
            Logger.logInfo(`${scriptName}: searching figures forward found '${figuresFlattend.length}' figures`);
            Logger.logInfo(`${scriptName}: loading submission pages...`);
            const result = {};
            for (let i = 0; i < figuresFlattend.length; i++) {
                const figureSid = figuresFlattend[i].id.trimStart('sid-');
                const subDoc = await requestHelper.SubmissionRequests.getSubmissionPage(parseInt(figureSid));
                const img = subDoc?.getElementById('submissionImg');
                if (img == null) {
                    continue;
                }
                img.setAttribute('wal-index', (i + 1).toString());
                img.setAttribute('wal-sid', figureSid);
                result[parseInt(figureSid)] = img;
                Logger.logInfo(`${scriptName}: loaded submission '${figureSid}' with index '${(i + 1).toString()}'`);
            }
            return result;
        }
    }

    class LightboxHTML {
        static get html() {
            return `
<div class="viewer-container viewer-backdrop viewer-fixed viewer-fade viewer-in hidden" tabindex="-1" touch-action="none"
    id="viewer0" style="z-index: 999999900;" role="dialog" aria-labelledby="viewerTitle0" aria-modal="true">
    <div class="viewer-canvas" data-viewer-action="hide">
    </div>
</div>`;
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = ".wal-lightbox-nav {\n    position: fixed;\n    left: 50%;\n    bottom: 10px;\n    transform: translateX(-50%);\n    opacity: 0.7;\n    transition: opacity 0.2s linear;\n    z-index: 100000000;\n}\n\n.wal-lightbox-nav:hover {\n    opacity: 1;\n}\n\n.wal-no-select {\n    user-select: none;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n}";
    styleInject(css_248z);

    class Lightbox {
        currWalIndex = 0;
        _lightboxContainer;
        _lightboxNavContainer;
        _imgCount = -1;
        _boundHandleArrowKeys;
        constructor(orgSid, imgs) {
            this.initializeViewerCanvas();
            this._lightboxContainer = document.body.querySelector('div[class*="viewer-canvas"]');
            this._imgCount = Object.keys(imgs).length;
            const columnpage = document.getElementById('columnpage');
            const orgImg = columnpage.querySelector(`img[wal-sid="${orgSid}"]`);
            const orgImgClone = orgImg.readdToDom();
            imgs[orgSid] = orgImgClone;
            this.prepareOrgLightbox();
            this.addSubmissionToLightbox(imgs);
            if (customLightboxShowNavSetting.value) {
                this._lightboxNavContainer = this.createNavigationButtons();
                this._lightboxContainer.insertAfterThis(this._lightboxNavContainer);
            }
            this._boundHandleArrowKeys = this.handleArrowKeys.bind(this);
        }
        get isHidden() {
            return this._lightboxContainer.parentElement?.classList.contains('hidden') ?? false;
        }
        set isHidden(value) {
            if (this.isHidden === value) {
                return;
            }
            if (value) {
                window.removeEventListener('keydown', this._boundHandleArrowKeys);
                this._lightboxContainer.parentElement?.classList.add('hidden');
                this._lightboxNavContainer?.classList.add('hidden');
                for (const child of Array.from(this._lightboxContainer.children)) {
                    child.classList.add('hidden');
                }
            }
            else {
                window.addEventListener('keydown', this._boundHandleArrowKeys);
                this._lightboxContainer.children[this.currWalIndex]?.classList.remove('hidden');
                this._lightboxContainer.parentElement?.classList.remove('hidden');
                this._lightboxNavContainer?.classList.remove('hidden');
            }
        }
        navigateLeft() {
            if (this.currWalIndex > 0) {
                Logger.logInfo(`${scriptName}: navigating left '${this.currWalIndex} -> ${this.currWalIndex - 1}'`);
                const currImg = this._lightboxContainer.children[this.currWalIndex];
                const prevImg = this._lightboxContainer.children[this.currWalIndex - 1];
                if (currImg != null && prevImg != null) {
                    currImg.classList.add('hidden');
                    prevImg.classList.remove('hidden');
                }
                this.currWalIndex--;
            }
        }
        navigateRight() {
            if (this.currWalIndex + 1 < this._imgCount) {
                Logger.logInfo(`${scriptName}: navigating right '${this.currWalIndex} -> ${this.currWalIndex + 1}'`);
                const currImg = this._lightboxContainer.children[this.currWalIndex];
                const nextImg = this._lightboxContainer.children[this.currWalIndex + 1];
                if (currImg != null && nextImg != null) {
                    currImg.classList.add('hidden');
                    nextImg.classList.remove('hidden');
                }
                this.currWalIndex++;
            }
        }
        handleArrowKeys(event) {
            switch (event.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    this.navigateLeft();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    this.navigateRight();
                    break;
            }
            event.preventDefault();
        }
        getIndexOfClickedImage(img) {
            let clickedWalIndex = img.getAttribute('wal-index');
            if (!string.isNullOrWhitespace(clickedWalIndex)) {
                this.currWalIndex = parseInt(clickedWalIndex);
                const clickedImg = this._lightboxContainer.querySelector(`img[wal-index="${this.currWalIndex}"]`);
                const clickedIndex = clickedImg?.getIndexOfThis();
                return clickedIndex;
            }
        }
        prepareOrgLightbox() {
            this._lightboxContainer.innerHTML = '';
            this._lightboxContainer = this._lightboxContainer.readdToDom();
            this._lightboxContainer.addEventListener('click', () => {
                this.isHidden = true;
            });
        }
        addSubmissionToLightbox(imgs) {
            // Convert record to array and sort by wal-index
            const sortedImages = Object.values(imgs)
                .sort((a, b) => {
                const indexA = parseInt(a.getAttribute('wal-index') ?? '0');
                const indexB = parseInt(b.getAttribute('wal-index') ?? '0');
                return indexA - indexB;
            });
            for (const img of sortedImages) {
                img.addEventListener('click', () => {
                    this.currWalIndex = this.getIndexOfClickedImage(img) ?? 0;
                    this.isHidden = false;
                });
                const clone = img.cloneNode(false);
                clone.classList.add('hidden');
                clone.style.height = '100%';
                clone.style.width = '100%';
                clone.style.objectFit = 'contain';
                this._lightboxContainer.appendChild(clone);
            }
        }
        createNavigationButtons() {
            const container = document.createElement('div');
            container.classList.add('wal-lightbox-nav', 'hidden', 'wal-no-select');
            const leftButton = document.createElement('a');
            leftButton.classList.add('button', 'standard', 'mobile-fix');
            leftButton.textContent = '<---';
            leftButton.style.marginRight = '4px';
            leftButton.addEventListener('click', this.navigateLeft.bind(this));
            container.appendChild(leftButton);
            const closeButton = document.createElement('a');
            closeButton.classList.add('button', 'standard', 'mobile-fix');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                this.isHidden = true;
            });
            container.appendChild(closeButton);
            const rightButton = document.createElement('a');
            rightButton.classList.add('button', 'standard', 'mobile-fix');
            rightButton.textContent = '--->';
            rightButton.style.marginLeft = '4px';
            rightButton.addEventListener('click', this.navigateRight.bind(this));
            container.appendChild(rightButton);
            return container;
        }
        initializeViewerCanvas() {
            const viewerCanvas = document.body.querySelector('div[class*="viewer-canvas"]');
            if (!viewerCanvas) {
                const viewerTemp = document.createElement('div');
                viewerTemp.innerHTML = LightboxHTML.html;
                const viewerContainer = viewerTemp.firstElementChild;
                document.body.appendChild(viewerContainer);
                Logger.logInfo(`${scriptName}: Created viewer canvas structure in hidden state`);
            }
        }
    }

    async function showError(error, caption) {
        const message = error instanceof Error ? error.message : String(error);
        await window.FAMessageBox.show(message, caption, window.FAMessageBoxButtons.OK, window.FAMessageBoxIcon.Error);
    }

    class AutoLoader {
        submissionImg;
        currComicNav = null;
        currSid = -1;
        _loadingSpinner;
        _comicNavExists = false;
        _searchButton;
        constructor() {
            this.currSid = getCurrViewSid(document);
            this.submissionImg = document.getElementById('submissionImg');
            this.submissionImg.setAttribute('wal-index', '0');
            this.submissionImg.setAttribute('wal-sid', this.currSid.toString());
            this._searchButton = document.createElement('a');
            this._searchButton.id = 'wal-search-button';
            this._searchButton.classList.add('wal-button', 'button', 'standard', 'mobile-fix');
            this._searchButton.type = 'button';
            this._searchButton.style.margin = '20px 0 10px 0';
            this.submissionImg.parentNode.appendChild(document.createElement('br'));
            this.submissionImg.parentNode.appendChild(this._searchButton);
            const descriptionElem = document.getElementById('columnpage')?.querySelector('div[class*="submission-description"]');
            if (descriptionElem != null) {
                this.currComicNav = ComicNavigation.fromElement(descriptionElem);
                if (this.currComicNav != null) {
                    if (this.currComicNav.prevId !== -1 || this.currComicNav.firstId !== -1 || this.currComicNav.nextId !== -1) {
                        this._comicNavExists = true;
                        if (overwriteNavButtonsSetting.value) {
                            this.overwriteNavButtons();
                        }
                    }
                }
            }
            this.updateSearchButton(this.comicNavExists);
            const loadingSpinnerContainer = document.createElement('div');
            loadingSpinnerContainer.classList.add('wal-loading-spinner');
            loadingSpinnerContainer.style.margin = '20px 0 20px 0';
            this._loadingSpinner = new window.FALoadingSpinner(loadingSpinnerContainer);
            this._loadingSpinner.delay = loadingSpinSpeedSetting.value;
            this._loadingSpinner.spinnerThickness = 6;
            this.submissionImg.parentNode.appendChild(loadingSpinnerContainer);
        }
        get comicNavExists() {
            return this._comicNavExists;
        }
        set comicNavExists(value) {
            if (value === this.comicNavExists) {
                return;
            }
            this._comicNavExists = value;
            this.updateSearchButton(value);
        }
        startAutoloader() {
            void this.startAutoLoaderAsync();
        }
        async startAutoLoaderAsync() {
            this._loadingSpinner.visible = true;
            try {
                const autoLoader = new AutoLoaderSearch(this.submissionImg, this.currSid, this.currComicNav);
                const submissions = await autoLoader.search();
                const submissionIds = Object.keys(submissions).map(Number);
                if (submissionIds.length === 0 || (submissionIds.length === 1 && submissionIds[0] === this.currSid)) {
                    this.comicNavExists = false;
                }
                else {
                    this.addLoadedSubmissions(submissions);
                    if (useCustomLightboxSetting.value) {
                        new Lightbox(this.currSid, submissions);
                    }
                }
            }
            catch (error) {
                await showError(error, scriptName);
            }
            finally {
                this._loadingSpinner.visible = false;
            }
        }
        startSimilarSearch() {
            void this.startSimilarSearchAsync();
        }
        async startSimilarSearchAsync() {
            this._loadingSpinner.visible = true;
            try {
                const forwardSearch = new ForwardSearch(this.currSid);
                const submissionsAfter = await forwardSearch.search();
                const backwardSearch = new BackwardSearch(this.currSid, backwardSearchSetting.value, forwardSearch.currSubmissionPageNo);
                backwardSearch.sidToIgnore.push(...Object.keys(submissionsAfter).map(Number));
                const submissionsBefore = await backwardSearch.search();
                this.addLoadedSubmissions(submissionsBefore, submissionsAfter);
                if (useCustomLightboxSetting.value) {
                    new Lightbox(this.currSid, { ...submissionsBefore, ...submissionsAfter });
                }
            }
            catch (error) {
                await showError(error, scriptName);
            }
            finally {
                this._loadingSpinner.visible = false;
            }
        }
        addLoadedSubmissions(...imgsArr) {
            const columnpage = document.getElementById('columnpage');
            for (const imgs of imgsArr) {
                Logger.logInfo(`${scriptName}: adding '${Object.keys(imgs).length}' submissions...`);
                let prevSid = this.currSid;
                for (const sid of Object.keys(imgs).map(Number)) {
                    if (imgs[sid].getAttribute('wal-sid') === this.currSid.toString()) {
                        continue;
                    }
                    const lastImg = columnpage.querySelector(`img[wal-sid="${prevSid}"]`);
                    const lastIndex = parseInt(lastImg.getAttribute('wal-index'));
                    const currIndex = parseInt(imgs[sid].getAttribute('wal-index'));
                    if (currIndex < lastIndex) {
                        lastImg.insertBeforeThis(imgs[sid]);
                        imgs[sid].insertAfterThis(document.createElement('br'));
                        imgs[sid].insertAfterThis(document.createElement('br'));
                        checkTags(imgs[sid]);
                        Logger.logInfo(`${scriptName}: added submission ${sid} before submission ${prevSid}`);
                    }
                    else {
                        lastImg.insertAfterThis(imgs[sid]);
                        imgs[sid].insertBeforeThis(document.createElement('br'));
                        imgs[sid].insertBeforeThis(document.createElement('br'));
                        checkTags(imgs[sid]);
                        Logger.logInfo(`${scriptName}: added submission ${sid} after submission ${prevSid}`);
                    }
                    prevSid = sid;
                }
            }
        }
        overwriteNavButtons() {
            if (!this.comicNavExists) {
                return;
            }
            const columnpage = document.getElementById('columnpage');
            const favoriteNav = columnpage?.querySelector('div[class*="favorite-nav"]');
            let prevButton = favoriteNav?.children[0];
            if (prevButton != null && this.currComicNav.prevId !== -1) {
                if (prevButton.textContent?.toLowerCase()?.includes('prev') ?? false) {
                    prevButton.href = `/view/${this.currComicNav.prevId}/`;
                }
                else {
                    const prevButtonReal = document.createElement('a');
                    prevButtonReal.href = `/view/${this.currComicNav.prevId}/`;
                    prevButtonReal.classList.add('button', 'standard', 'mobile-fix');
                    prevButtonReal.textContent = 'Prev';
                    prevButtonReal.style.marginRight = '4px';
                    prevButton.insertBeforeThis(prevButtonReal);
                }
            }
            let nextButton = favoriteNav?.children[favoriteNav.children.length - 1];
            if (nextButton != null && this.currComicNav.nextId !== -1) {
                if (nextButton.textContent?.toLowerCase()?.includes('next') ?? false) {
                    nextButton.href = `/view/${this.currComicNav.nextId}/`;
                }
                else {
                    const nextButtonReal = document.createElement('a');
                    nextButtonReal.href = `/view/${this.currComicNav.nextId}/`;
                    nextButtonReal.classList.add('button', 'standard', 'mobile-fix');
                    nextButtonReal.textContent = 'Next';
                    nextButtonReal.style.marginLeft = '4px';
                    nextButton.insertAfterThis(nextButtonReal);
                }
            }
        }
        updateSearchButton(showAutoLoader) {
            this._searchButton.style.display = 'inline-block';
            this._searchButton.textContent = showAutoLoader ? 'Auto load Pages' : 'Search for similar Pages';
            if (showAutoLoader) {
                this._searchButton.onclick = () => {
                    this.startAutoloader();
                    this._searchButton.style.display = 'none';
                };
            }
            else {
                this._searchButton.onclick = () => {
                    this.startSimilarSearch();
                    this._searchButton.style.display = 'none';
                };
            }
        }
    }

    const scriptName = 'FA Webcomic Auto Loader';
    const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);
    const showSearchButtonSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Similar Search Button');
    showSearchButtonSetting.description = 'Sets wether the search for similar Pages button is show.';
    showSearchButtonSetting.defaultValue = true;
    const loadingSpinSpeedSetting = customSettings.newSetting(window.FASettingType.Number, 'Loading Animation');
    loadingSpinSpeedSetting.description = 'Sets the duration that the loading animation takes for a full rotation in milliseconds.';
    loadingSpinSpeedSetting.defaultValue = 1000;
    const backwardSearchSetting = customSettings.newSetting(window.FASettingType.Number, 'Backward Search Amount');
    backwardSearchSetting.description = 'Sets the amount of similar pages to search backward. (More Pages take longer)';
    backwardSearchSetting.defaultValue = 3;
    const overwriteNavButtonsSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Overwrite Nav Buttons');
    overwriteNavButtonsSetting.description = 'Sets wether the default Navigation Buttons (next/prev) are overwritten by the Auto-Loader. (Works only if comic navigation is present)';
    overwriteNavButtonsSetting.defaultValue = true;
    const useCustomLightboxSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Use Custom Lightbox');
    useCustomLightboxSetting.description = 'Sets wether the default Lightbox (fullscreen view) is overwritten by the Auto-Loader.';
    useCustomLightboxSetting.defaultValue = true;
    const customLightboxShowNavSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Custom Lightbox Show Nav');
    customLightboxShowNavSetting.description = 'Sets wether the Lightbox Navigation (next/prev) is shown in the Custom Lightbox.';
    customLightboxShowNavSetting.defaultValue = true;
    customSettings.loadSettings();
    const requestHelper = new window.FARequestHelper(2);
    if (customSettings.isFeatureEnabled) {
        const matchList = new window.FAMatchList(customSettings);
        matchList.matches = ['net/view'];
        matchList.runInIFrame = false;
        if (matchList.hasMatch) {
            new AutoLoader();
        }
    }

    exports.backwardSearchSetting = backwardSearchSetting;
    exports.customLightboxShowNavSetting = customLightboxShowNavSetting;
    exports.loadingSpinSpeedSetting = loadingSpinSpeedSetting;
    exports.overwriteNavButtonsSetting = overwriteNavButtonsSetting;
    exports.requestHelper = requestHelper;
    exports.scriptName = scriptName;
    exports.showSearchButtonSetting = showSearchButtonSetting;
    exports.useCustomLightboxSetting = useCustomLightboxSetting;

    return exports;

})({});
