// ==UserScript==
// @name        Furaffinity-Features-Browser
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @require     https://greasyfork.org/scripts/458971-fa-embedded-image-viewer/code/458971-fa-embedded-image-viewer.js
// @require     https://greasyfork.org/scripts/457759-fa-webcomic-auto-loader/code/457759-fa-webcomic-auto-loader.js
// @require     https://greasyfork.org/scripts/462632-fa-infini-gallery/code/462632-fa-infini-gallery.js
// @require     https://greasyfork.org/scripts/527752-fa-instant-nuker/code/527752-fa-instant-nuker.js
// @require     https://greasyfork.org/scripts/463464-fa-watches-favorites-viewer/code/463464-fa-watches-favorites-viewer.js
// @grant       GM_info
// @version     1.2.13
// @author      Midori Dragon
// @description Browser Extension for Furaffinity Features
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
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

    Logger.logInfo('Furaffinity Features Loaded');

})();
