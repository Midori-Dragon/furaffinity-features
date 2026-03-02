// ==UserScript==
// @name        FA Embedded Image Viewer
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @require     https://greasyfork.org/scripts/483952-furaffinity-request-helper/code/483952-furaffinity-request-helper.js
// @require     https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer/code/492931-furaffinity-submission-image-viewer.js
// @require     https://greasyfork.org/scripts/485827-furaffinity-match-list/code/485827-furaffinity-match-list.js
// @require     https://greasyfork.org/scripts/528997-furaffinity-message-box/code/528997-furaffinity-message-box.js
// @require     https://greasyfork.org/scripts/485153-furaffinity-loading-animations/code/485153-furaffinity-loading-animations.js
// @require     https://greasyfork.org/scripts/476762-furaffinity-custom-pages/code/476762-furaffinity-custom-pages.js
// @require     https://greasyfork.org/scripts/475041-furaffinity-custom-settings/code/475041-furaffinity-custom-settings.js
// @grant       GM_info
// @version     2.5.8
// @author      Midori Dragon
// @description Embeds the clicked Image on the Current Site, so you can view it without loading the submission Page
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/458971-fa-embedded-image-viewer
// @supportURL  https://greasyfork.org/scripts/458971-fa-embedded-image-viewer/feedback
// ==/UserScript==
// jshint esversion: 11
(function (exports) {
    'use strict';

    class EmbeddedHTML {
        static get html() {
            return `
<div id="eiv-background">
    <a id="eiv-submission-container"></a>
    <div id="eiv-button-container">
        <div id="eiv-button-wrapper">
            <a id="eiv-fav-button" type="button" class="eiv-button button standard mobile-fix">⠀⠀</a>
            <a id="eiv-download-button" type="button" class="eiv-button button standard mobile-fix">Download</a>
            <a id="eiv-open-button" type="button" class="eiv-button button standard mobile-fix">Open</a>
            <a id="eiv-open-gallery-button" type="button" class="eiv-button button standard mobile-fix" style="display: none;">Open Gallery</a>
            <a id="eiv-remove-sub-button" type="button" class="eiv-button button standard mobile-fix" style="display: none;">Remove</a>
            <a id="eiv-close-button" type="button" class="eiv-button button standard mobile-fix">Close</a>
        </div>
        <div id="eiv-preview-spinner-container"></div>
    </div>
    <div id="eiv-additional-info-container">
        <a>by </a>
        <a id="eiv-additional-info">unknown</a>
        <a id="eiv-additional-info-watching"></a>
    </div>
</div>`;
        }
    }

    function getByLinkFromFigcaption(figcaption) {
        if (figcaption != null) {
            const infos = figcaption.querySelectorAll('i');
            let userLink = null;
            for (const info of Array.from(infos)) {
                if (info.textContent?.toLowerCase().includes('by') ?? false) {
                    const linkElem = info.parentNode?.querySelector('a[href][title]');
                    if (linkElem) {
                        userLink = linkElem.getAttribute('href');
                    }
                }
            }
            return userLink;
        }
        return null;
    }
    function getUserFromFigcaption(figcaption) {
        if (figcaption != null) {
            const infos = figcaption.querySelectorAll('i');
            let userLink = null;
            for (const info of Array.from(infos)) {
                if (info.textContent?.toLowerCase().includes('by') ?? false) {
                    const linkElem = info.parentNode?.querySelector('a[href][title]');
                    if (linkElem) {
                        userLink = linkElem.getAttribute('href');
                        userLink = userLink?.trimEnd('/');
                        userLink = userLink?.split('/').pop() ?? null;
                    }
                }
            }
            return userLink;
        }
        return null;
    }
    function getFavKey(doc) {
        // Get the column page element
        const columnPage = doc.getElementById('columnpage');
        // Find the navbar within the column page that contains favorite navigation
        const navbar = columnPage?.querySelector('div[class*="favorite-nav"]');
        // Select all buttons with a href attribute within the navbar
        const buttons = navbar?.querySelectorAll('a[class*="button"][href]') ?? [];
        let favButton;
        // Iterate through the buttons to find the one related to favorites
        for (const button of Array.from(buttons)) {
            if (button.textContent?.toLowerCase().includes('fav') ?? false) {
                favButton = button;
            }
        }
        // If a favorite button is found, extract the favorite key and status
        if (favButton != null) {
            const favKey = favButton.getAttribute('href')?.split('?key=')[1] ?? null;
            const isFav = !(favButton.getAttribute('href')?.toLowerCase().includes('unfav') ?? true);
            return { favKey, isFav };
        }
        // Return null if no favorite button is found
        return null;
    }
    function downloadImage() {
        let url = window.location.toString();
        // If the url contains a query string, remove it
        if (url.includes('?')) {
            const parts = url.split('?');
            url = parts[0];
        }
        // Create an anchor element to download the image
        const download = document.createElement('a');
        download.href = url;
        download.download = url.substring(url.lastIndexOf('/') + 1);
        download.style.display = 'none';
        document.body.appendChild(download);
        download.click();
        document.body.removeChild(download);
        window.close();
    }
    function getFigureId(figure) {
        if (figure.id.includes('-')) {
            return figure.id.split('-').pop();
        }
        else if (figure.id.includes('_')) {
            return figure.id.split('_').pop();
        }
        return figure.id;
    }
    function getPreviewQuality(figure) {
        const img = figure.querySelector('img[src]');
        const match = img?.src.match(/@(\d+)/);
        return match ? match[1] : null;
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

    var css_248z = "#eiv-main {\n    position: fixed;\n    width: 100vw;\n    height: 100vh;\n    max-width: 1850px;\n    z-index: 999999;\n    background: rgba(30, 33, 38, .65);\n}\n\n#eiv-background {\n    position: fixed;\n    display: flex;\n    flex-direction: column;\n    left: 50%;\n    transform: translate(-50%, 0%);\n    margin-top: 20px;\n    padding: 20px;\n    background: rgba(30, 33, 38, .90);\n    border-radius: 10px;\n}\n\n#eiv-submission-container {\n    -webkit-user-drag: none;\n}\n\n.eiv-submission-img {\n    max-width: inherit;\n    max-height: inherit;\n    border-radius: 10px;\n    user-select: none;\n}\n\n#eiv-button-container {\n    position: relative;\n    margin-top: 20px;\n    margin-bottom: 6px;\n    margin-left: 20px;\n}\n\n#eiv-button-wrapper {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n#eiv-preview-spinner-container {\n    position: absolute;\n    top: 50%;\n    right: 0;\n    transform: translateY(-50%);\n}\n\n.eiv-button {\n    margin-left: 4px;\n    margin-right: 4px;\n    user-select: none;\n}\n\n#eiv-additional-info {\n    color: #afc6e1;\n}\n";
    styleInject(css_248z);

    class string {
        static isNullOrWhitespace(str) {
            return str == null || str.trim() === '';
        }
        static isNullOrEmpty(str) {
            return str == null || str === '';
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

    async function showError(error, caption) {
        const message = error instanceof Error ? error.message : String(error);
        await window.FAMessageBox.show(message, caption, window.FAMessageBoxButtons.OK, window.FAMessageBoxIcon.Error);
    }

    const embeddedModes = {
        watchesFavoriteViewer: 'wfv-favorites',
    };
    class EmbeddedImage extends EventTarget {
        embeddedElem;
        submissionImg;
        favRequestRunning = false;
        downloadRequestRunning = false;
        faImageViewer;
        _imageLoaded = false;
        _onRemove;
        loadingSpinner;
        previewLoadingSpinner;
        constructor(figure) {
            super();
            Object.setPrototypeOf(this, EmbeddedImage.prototype);
            this.embeddedElem = document.createElement('div');
            this.createElements(figure);
            const submissionContainer = document.getElementById('eiv-submission-container');
            const previewLoadingSpinnerContainer = document.getElementById('eiv-preview-spinner-container');
            this.loadingSpinner = new window.FALoadingSpinner(submissionContainer);
            this.loadingSpinner.delay = loadingSpinSpeedSetting.value;
            this.loadingSpinner.spinnerThickness = 6;
            this.loadingSpinner.visible = true;
            this.previewLoadingSpinner = new window.FALoadingSpinner(previewLoadingSpinnerContainer);
            this.previewLoadingSpinner.delay = loadingSpinSpeedSetting.value;
            this.previewLoadingSpinner.spinnerThickness = 4;
            this.previewLoadingSpinner.size = 40;
            // Add click event to remove the embedded element when clicked outside
            document.addEventListener('click', this.onDocumentClick.bind(this));
            void this.fillSubDocInfos(figure).catch(async (error) => {
                this.loadingSpinner.visible = false;
                this.previewLoadingSpinner.visible = false;
                await showError(error, scriptName);
            });
            void this.fillUserInfos(figure).catch((error) => {
                Logger.logError('Failed to load watching info:', error);
            });
        }
        static get embeddedExists() {
            return document.getElementById('eiv-main') != null;
        }
        get onRemove() {
            return this._onRemove;
        }
        set onRemove(handler) {
            this._onRemove = handler;
        }
        onDocumentClick(event) {
            if (event.target === document.documentElement) {
                this.remove();
            }
        }
        onOpenClick() {
            if (closeEmbedAfterOpenSetting.value) {
                this.remove();
            }
        }
        async onRemoveSubClick(figure) {
            const sid = figure.id.trimStart('sid-');
            this.remove();
            figure.remove();
            try {
                await requestHelper.PersonalUserRequests.MessageRequests.NewSubmissions.removeSubmissions([sid]);
            }
            catch (error) {
                await showError(error, scriptName);
            }
        }
        invokeRemove() {
            this._onRemove?.();
            this.dispatchEvent(new Event('remove'));
        }
        remove() {
            this.faImageViewer?.destroy();
            this.embeddedElem.parentNode?.removeChild(this.embeddedElem);
            document.removeEventListener('click', this.onDocumentClick);
            this.invokeRemove();
        }
        createElements(figure) {
            // Create the main container for the embedded element
            this.embeddedElem.id = 'eiv-main';
            this.embeddedElem.setAttribute('eiv-sid', figure.id.trimStart('sid-'));
            this.embeddedElem.innerHTML = EmbeddedHTML.html;
            const ddmenu = document.getElementById('ddmenu');
            ddmenu.appendChild(this.embeddedElem);
            // Add click event to remove the embedded element when clicked outside
            this.embeddedElem.addEventListener('click', (event) => {
                if (event.target === this.embeddedElem) {
                    this.remove();
                }
            });
            // Get the submission container element
            const submissionContainer = document.getElementById('eiv-submission-container');
            // Set target attribute for opening in new tab based on settings
            if (openInNewTabSetting.value) {
                submissionContainer.setAttribute('target', '_blank');
            }
            // Add click event to close the embed after opening, if setting is enabled
            submissionContainer.addEventListener('click', this.onOpenClick.bind(this));
            // Extract user gallery and scraps links from the figure caption
            const userLink = getByLinkFromFigcaption(figure.querySelector('figcaption'));
            if (userLink != null) {
                const galleryLink = userLink.trimEnd('/').replace('user', 'gallery');
                const scrapsLink = userLink.trimEnd('/').replace('user', 'scraps');
                if (!window.location.toString().includes(userLink) && !window.location.toString().includes(galleryLink) && !window.location.toString().includes(scrapsLink)) {
                    const openGalleryButton = document.getElementById('eiv-open-gallery-button');
                    openGalleryButton.style.display = 'block';
                    openGalleryButton.setAttribute('href', galleryLink);
                    if (openInNewTabSetting.value) {
                        openGalleryButton.setAttribute('target', '_blank');
                    }
                    openGalleryButton.addEventListener('click', this.onOpenClick.bind(this));
                }
            }
            const link = figure.querySelector('a[href]')?.getAttribute('href');
            const openButton = document.getElementById('eiv-open-button');
            openButton.setAttribute('href', link ?? '');
            if (openInNewTabSetting.value) {
                openButton.setAttribute('target', '_blank');
            }
            openButton.addEventListener('click', this.onOpenClick.bind(this));
            const closeButton = document.getElementById('eiv-close-button');
            closeButton.addEventListener('click', this.remove.bind(this));
            const embeddedModesValues = Object.values(embeddedModes);
            if (window.location.toString().toLowerCase().includes('msg/submissions') && embeddedModesValues.every(mode => !window.location.toString().toLocaleLowerCase().includes(mode))) {
                const removeSubButton = document.getElementById('eiv-remove-sub-button');
                removeSubButton.style.display = 'block';
                removeSubButton.addEventListener('click', () => void this.onRemoveSubClick(figure));
            }
            const additionalInfo = document.getElementById('eiv-additional-info');
            const figcaption = figure.querySelector('figcaption');
            const userElems = figcaption?.querySelectorAll('a[href*="user/"]');
            const byElem = userElems?.[userElems.length - 1];
            if (byElem != null && additionalInfo != null) {
                additionalInfo.textContent = `${byElem.textContent}`;
                additionalInfo.setAttribute('href', byElem.getAttribute('href') ?? '');
            }
            else {
                try {
                    additionalInfo.parentElement.style.display = 'none';
                }
                catch { }
            }
            const previewLoadingSpinnerContainer = document.getElementById('eiv-preview-spinner-container');
            previewLoadingSpinnerContainer.addEventListener('click', () => {
                this.previewLoadingSpinner.visible = false;
            });
        }
        async fillSubDocInfos(figure) {
            const sid = getFigureId(figure);
            if (sid == null) {
                Logger.logError('Could not extract SID from figure with id ' + figure.id);
                return;
            }
            const ddmenu = document.getElementById('ddmenu');
            const doc = await requestHelper.SubmissionRequests.getSubmissionPage(sid);
            if (doc != null) {
                this.submissionImg = doc.getElementById('submissionImg');
                const imgSrc = this.submissionImg.src;
                let prevSrc;
                let prevQuality;
                if (previewQualitySetting.value === 0) {
                    prevQuality = getPreviewQuality(figure);
                    if (prevQuality != null) {
                        prevSrc = this.submissionImg.getAttribute('data-preview-src')?.replace('@600', '@' + prevQuality);
                    }
                }
                else {
                    prevQuality = previewQualitySetting.value.toString();
                    prevSrc = this.submissionImg.getAttribute('data-preview-src')?.replace('@600', '@' + prevQuality);
                }
                Logger.logInfo('Preview quality @' + prevQuality);
                const submissionContainer = document.getElementById('eiv-submission-container');
                this.faImageViewer = new window.FAImageViewer(submissionContainer, imgSrc, prevSrc);
                this.faImageViewer.faImage.imgElem.id = 'eiv-submission-img';
                this.faImageViewer.faImagePreview.imgElem.id = 'eiv-preview-submission-img';
                this.faImageViewer.faImage.imgElem.classList.add('eiv-submission-img');
                this.faImageViewer.faImagePreview.imgElem.classList.add('eiv-submission-img');
                this.faImageViewer.faImage.imgElem.style.maxWidth = this.faImageViewer.faImagePreview.imgElem.style.maxWidth = window.innerWidth - 20 * 2 + 'px';
                this.faImageViewer.faImage.imgElem.style.maxHeight = this.faImageViewer.faImagePreview.imgElem.style.maxHeight = window.innerHeight - ddmenu.clientHeight - 38 * 2 - 20 * 2 - 100 + 'px';
                this.faImageViewer.addEventListener('image-load-start', () => {
                    this._imageLoaded = false;
                });
                this.faImageViewer.addEventListener('image-load', () => {
                    this._imageLoaded = true;
                    this.loadingSpinner.visible = false;
                    this.previewLoadingSpinner.visible = false;
                });
                this.faImageViewer.addEventListener('preview-image-load', () => {
                    this.loadingSpinner.visible = false;
                    if (!this._imageLoaded) {
                        this.previewLoadingSpinner.visible = true;
                    }
                });
                void this.faImageViewer.load();
                const url = doc.querySelector('meta[property="og:url"]')?.getAttribute('content');
                submissionContainer.setAttribute('href', url ?? '');
                const result = getFavKey(doc);
                const favButton = document.getElementById('eiv-fav-button');
                if (result == null) {
                    favButton.style.display = 'none';
                }
                else {
                    favButton.textContent = result.isFav ? '+Fav' : '-Fav';
                    favButton.setAttribute('isFav', result.isFav.toString());
                    favButton.setAttribute('key', result.favKey ?? '');
                    favButton.addEventListener('click', () => {
                        if (!this.favRequestRunning) {
                            void this.doFavRequest(sid);
                        }
                    });
                }
                const downloadButton = document.getElementById('eiv-download-button');
                downloadButton.addEventListener('click', () => {
                    if (this.downloadRequestRunning) {
                        return;
                    }
                    this.downloadRequestRunning = true;
                    const loadingTextSpinner = new window.FALoadingTextSpinner(downloadButton);
                    loadingTextSpinner.delay = loadingSpinSpeedFavSetting.value;
                    loadingTextSpinner.visible = true;
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = this.submissionImg.src + '?eiv-download';
                    iframe.addEventListener('load', () => {
                        this.downloadRequestRunning = false;
                        loadingTextSpinner.visible = false;
                        setTimeout(() => iframe.parentNode?.removeChild(iframe), 100);
                    });
                    document.body.appendChild(iframe);
                });
            }
        }
        async fillUserInfos(figure) {
            if (showWatchingInfoSetting.value) {
                const additionalInfoWatching = document.getElementById('eiv-additional-info-watching');
                const figcaption = figure.querySelector('figcaption');
                if (figcaption != null && additionalInfoWatching != null) {
                    const userLink = getUserFromFigcaption(figcaption);
                    console.log(userLink);
                    if (userLink != null) {
                        const userPage = await requestHelper.UserRequests.getUserPage(userLink);
                        if (userPage != null) {
                            const siteContent = userPage.getElementById('site-content');
                            const navInterfaceButtons = siteContent?.querySelector('userpage-nav-interface-buttons');
                            if (navInterfaceButtons != null) {
                                const watchButton = navInterfaceButtons?.querySelector('a[href^="/watch/"]');
                                console.log(watchButton?.outerHTML);
                                if (watchButton == null) {
                                    additionalInfoWatching.textContent = ' (watching)';
                                }
                                else {
                                    additionalInfoWatching.textContent = ' (not watching)';
                                }
                            }
                        }
                    }
                }
            }
        }
        async doFavRequest(sid) {
            const favButton = document.getElementById('eiv-fav-button');
            // Set the favorite request running flag to true
            this.favRequestRunning = true;
            // Create a loading spinner for the favorite button
            const loadingTextSpinner = new window.FALoadingTextSpinner(favButton);
            loadingTextSpinner.delay = loadingSpinSpeedFavSetting.value;
            loadingTextSpinner.visible = true;
            // Get the favorite key and status from the favorite button
            let favKey = favButton.getAttribute('key') ?? '';
            let isFav = favButton.getAttribute('isFav') === 'true';
            if (string.isNullOrWhitespace(favKey)) {
                this.favRequestRunning = false;
                favButton.textContent = 'x';
                return;
            }
            try {
                if (isFav) {
                    // Send the favorite request to the server
                    favKey = await requestHelper.SubmissionRequests.favSubmission(sid, favKey) ?? '';
                    loadingTextSpinner.visible = false;
                    // If the request was successful, set the favorite status to false and update the button text
                    if (!string.isNullOrWhitespace(favKey)) {
                        favButton.setAttribute('key', favKey);
                        isFav = false;
                        favButton.setAttribute('isFav', isFav.toString());
                        favButton.textContent = '-Fav';
                    }
                    else {
                        // If the request was not successful, set the button text to "x" and restore the original text after a short delay
                        favButton.textContent = 'x';
                        setTimeout(() => favButton.textContent = '+Fav', 1000);
                    }
                }
                else {
                    // Send the unfavorite request to the server
                    favKey = await requestHelper.SubmissionRequests.unfavSubmission(sid, favKey) ?? '';
                    loadingTextSpinner.visible = false;
                    // If the request was successful, set the favorite status to true and update the button text
                    if (!string.isNullOrWhitespace(favKey)) {
                        favButton.setAttribute('key', favKey);
                        isFav = true;
                        favButton.setAttribute('isFav', isFav.toString());
                        favButton.textContent = '+Fav';
                    }
                    else {
                        // If the request was not successful, set the button text to "x" and restore the original text after a short delay
                        favButton.textContent = 'x';
                        setTimeout(() => favButton.textContent = '-Fav', 1000);
                    }
                }
                // Set the favorite request running flag back to false
            }
            catch (error) {
                loadingTextSpinner.visible = false;
                await showError(error, scriptName);
            }
            finally {
                this.favRequestRunning = false;
            }
        }
        static async addEmbeddedEventForAllFigures() {
            const nonEmbeddedFigures = document.querySelectorAll('figure:not([embedded])') ?? [];
            for (const figure of Array.from(nonEmbeddedFigures)) {
                // Set the attribute to mark this element as embedded
                figure.setAttribute('embedded', 'true');
                // Add the event listener to the figure element
                figure.addEventListener('click', (event) => {
                    // If the event is a mouse event and the target is an HTML element
                    if (event instanceof MouseEvent && event.target instanceof HTMLElement) {
                        // If the event is not a Ctrl+Click event and the target is not a favorite button
                        // and the target is not a checkbox
                        if (!event.ctrlKey && !event.target.id.includes('favbutton') && event.target.getAttribute('type') !== 'checkbox') {
                            // If the target has a href attribute, return
                            if (!string.isNullOrWhitespace(event.target.getAttribute('href'))) {
                                return;
                            }
                            // Prevent the default action of the event
                            event.preventDefault();
                            // If an embedded image viewer does not exist, create one
                            if (!EmbeddedImage.embeddedExists && figure instanceof HTMLElement) {
                                new EmbeddedImage(figure);
                            }
                        }
                    }
                });
            }
        }
    }

    const scriptName = 'FA Embedded Image Viewer';
    const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);
    const openInNewTabSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Open in new Tab');
    openInNewTabSetting.description = 'Wether to open links in a new Tab or the current one.';
    openInNewTabSetting.defaultValue = true;
    const loadingSpinSpeedFavSetting = customSettings.newSetting(window.FASettingType.Number, 'Fav Loading Animation');
    loadingSpinSpeedFavSetting.description = 'The duration that the loading animation, for faving a submission, takes for a full rotation in milliseconds.';
    loadingSpinSpeedFavSetting.defaultValue = 600;
    const loadingSpinSpeedSetting = customSettings.newSetting(window.FASettingType.Number, 'Embedded Loading Animation');
    loadingSpinSpeedSetting.description = 'The duration that the loading animation of the Embedded element to load takes for a full rotation in milliseconds.';
    loadingSpinSpeedSetting.defaultValue = 1000;
    const closeEmbedAfterOpenSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Close Embed after open');
    closeEmbedAfterOpenSetting.description = 'Wether to close the current embedded Submission after it is opened in a new Tab (also for open Gallery).';
    closeEmbedAfterOpenSetting.defaultValue = true;
    const previewQualitySetting = customSettings.newSetting(window.FASettingType.Option, 'Preview Quality');
    previewQualitySetting.description = 'The quality of the preview image. (Higher values will be slower, Auto will pick the quality that is already used by the gallery and therefore should be the fastest)';
    previewQualitySetting.defaultValue = 0;
    previewQualitySetting.options = {
        0: 'Auto detect',
        200: 'Lower (200px)',
        300: 'Low (300px)',
        400: 'Medium (400px)',
        500: 'High (500px)',
        600: 'Higher (600px)',
    };
    const enableInMinigallerySetting = customSettings.newSetting(window.FASettingType.Boolean, 'Enable in Minigallery');
    enableInMinigallerySetting.description = 'Wether to enable the Embedded Image Viewer in the Mini-Gallery on the Submission page.';
    enableInMinigallerySetting.defaultValue = true;
    const showWatchingInfoSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Show Watching Info');
    showWatchingInfoSetting.description = 'Wether to show if the user is watching the Submissions Author. (Will be slower)';
    showWatchingInfoSetting.defaultValue = false;
    customSettings.loadSettings();
    const requestHelper = new window.FARequestHelper(2);
    if (customSettings.isFeatureEnabled) {
        const matchList = new window.FAMatchList(customSettings);
        matchList.matches = ['net/browse', 'net/user', 'net/gallery', 'net/search', 'net/favorites', 'net/scraps', 'net/controls/favorites', 'net/controls/submissions', 'net/msg/submissions', 'd.furaffinity.net'];
        if (enableInMinigallerySetting.value) {
            matchList.matches.push('net/view');
        }
        matchList.runInIFrame = true;
        if (matchList.hasMatch) {
            const page = new window.FACustomPage('d.furaffinity.net', 'eiv-download');
            let pageDownload = false;
            page.addEventListener('onOpen', () => {
                downloadImage();
                pageDownload = true;
            });
            page.checkPageOpened();
            if (!pageDownload && !matchList.isWindowIFrame) {
                void EmbeddedImage.addEmbeddedEventForAllFigures();
                window.addEventListener('ei-update-embedded', () => {
                    void EmbeddedImage.addEmbeddedEventForAllFigures();
                });
            }
        }
    }

    exports.closeEmbedAfterOpenSetting = closeEmbedAfterOpenSetting;
    exports.enableInMinigallerySetting = enableInMinigallerySetting;
    exports.loadingSpinSpeedFavSetting = loadingSpinSpeedFavSetting;
    exports.loadingSpinSpeedSetting = loadingSpinSpeedSetting;
    exports.openInNewTabSetting = openInNewTabSetting;
    exports.previewQualitySetting = previewQualitySetting;
    exports.requestHelper = requestHelper;
    exports.scriptName = scriptName;
    exports.showWatchingInfoSetting = showWatchingInfoSetting;

    return exports;

})({});
