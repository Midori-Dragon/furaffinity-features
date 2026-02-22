// ==UserScript==
// @name        Furaffinity-Custom-Pages
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     1.2.2
// @author      Midori Dragon
// @description Library to create Custom pages on Furaffinitiy
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/476762-furaffinity-custom-settings
// @supportURL  https://greasyfork.org/scripts/476762-furaffinity-custom-settings/feedback
// ==/UserScript==
// jshint esversion: 11
(function () {
    'use strict';

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

    function extractParameterFromURL (url, parameterName) {
        const parts = url.split('?');
        if (parts.length > 1) {
            const params = parts[parts.length - 1].split('&');
            for (const param of params) {
                const [key, value] = param.split('=');
                if (key === parameterName) {
                    return { key, value: decodeURIComponent(value) };
                }
            }
        }
    }

    class CustomData {
        parameterValue;
        document;
        constructor(document) {
            this.document = document;
        }
        removeDocumentSiteContent() {
            const siteContent = this.document.getElementById('site-content');
            if (siteContent != null) {
                siteContent.remove();
            }
            return siteContent;
        }
    }

    class CustomPage extends EventTarget {
        parameterName;
        pageUrl;
        _onOpen;
        static customPages = [];
        constructor(pageUrl, parameterName = '') {
            super();
            Object.setPrototypeOf(this, CustomPage.prototype);
            this.pageUrl = pageUrl;
            this.parameterName = parameterName;
            CustomPage.customPages.push(this);
            if (parameterName !== '') {
                Logger.logInfo(`New CustomPage at '${pageUrl}'='${parameterName}'`);
            }
            else {
                Logger.logInfo(`New CustomPage at '${pageUrl}'`);
            }
        }
        get isOpen() {
            const url = window.location.toString();
            if (!url.includes(this.pageUrl)) {
                return false;
            }
            else if (this.parameterName === '') {
                return true;
            }
            const parameter = extractParameterFromURL(url, this.parameterName);
            const isOpen = parameter?.key === this.parameterName;
            if (isOpen) {
                Logger.logInfo(`CustomPage '${this.pageUrl}'='${this.parameterName}' is open`);
            }
            return isOpen;
        }
        get parameterValue() {
            const url = window.location.toString();
            const parameter = extractParameterFromURL(url, this.parameterName);
            return parameter?.value;
        }
        get onOpen() {
            return this._onOpen;
        }
        set onOpen(handler) {
            this._onOpen = handler;
        }
        static checkAllPages() {
            CustomPage.customPages.forEach((page) => page.checkPageOpened());
        }
        checkPageOpened() {
            if (this.isOpen) {
                this.pageOpened(this.parameterValue, document);
            }
        }
        pageOpened(parameterValue, openedPage) {
            const customData = new CustomData(openedPage);
            customData.parameterValue = parameterValue;
            const event = new CustomEvent('onOpen', { detail: customData });
            this.dispatchEvent(event);
        }
        invokeOpen(doc, parameterValue) {
            const customData = new CustomData(doc);
            customData.parameterValue = parameterValue;
            this._onOpen?.(customData);
            this.dispatchEvent(new CustomEvent('open', { detail: customData }));
        }
    }

    Object.defineProperties(window, {
        FACustomPage: { get: () => CustomPage }
    });

})();
