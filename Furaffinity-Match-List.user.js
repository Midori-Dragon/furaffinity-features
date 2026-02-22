// ==UserScript==
// @name        Furaffinity-Match-List
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.1.2
// @author      Midori Dragon
// @description Library to create a matchlist for your Furaffinity Script
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/485827-furaffinity-match-list
// @supportURL  https://greasyfork.org/scripts/485827-furaffinity-match-list/feedback
// ==/UserScript==
// jshint esversion: 11
(function () {
    'use strict';

    class GMInfo {
        static isBrowserEnvironment() {
            return (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') || (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined');
        }
        static getBrowserAPI() {
            if (typeof GM_info !== 'undefined' && GM_info != null) {
                // For userscripts
                return GM_info;
            }
            else if (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') {
                // Firefox or browsers using WebExtension API
                return browser;
            }
            else if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
                // Chrome or Chromium-based browsers
                return chrome;
            }
            else {
                throw new Error('Unsupported browser for SyncedStorage.');
            }
        }
        static get scriptName() {
            if (GMInfo.isBrowserEnvironment()) {
                return GMInfo.getBrowserAPI().runtime.getManifest().name;
            }
            else {
                return GMInfo.getBrowserAPI().script.name;
            }
        }
        static get scriptVersion() {
            if (GMInfo.isBrowserEnvironment()) {
                return GMInfo.getBrowserAPI().runtime.getManifest().version;
            }
            else {
                return GMInfo.getBrowserAPI().script.version;
            }
        }
        static get scriptDescription() {
            if (GMInfo.isBrowserEnvironment()) {
                return GMInfo.getBrowserAPI().runtime.getManifest().description;
            }
            else {
                return GMInfo.getBrowserAPI().script.description;
            }
        }
        static get scriptAuthor() {
            if (GMInfo.isBrowserEnvironment()) {
                return GMInfo.getBrowserAPI().runtime.getManifest().author;
            }
            else {
                return GMInfo.getBrowserAPI().script.author;
            }
        }
        static get scriptNamespace() {
            if (GMInfo.isBrowserEnvironment()) {
                return undefined; // Browser extensions don't have namespace
            }
            else {
                return GMInfo.getBrowserAPI().script.namespace;
            }
        }
        static get scriptSource() {
            if (GMInfo.isBrowserEnvironment()) {
                return undefined; // Browser extensions don't have source
            }
            else {
                return GMInfo.getBrowserAPI().script.source;
            }
        }
        static get scriptIcon() {
            if (GMInfo.isBrowserEnvironment()) {
                const manifest = GMInfo.getBrowserAPI().runtime.getManifest();
                let largestIcon = 0;
                for (const key of Object.keys(manifest.icons)) {
                    const size = parseInt(key);
                    if (size > largestIcon) {
                        largestIcon = size;
                    }
                }
                return manifest.icons[largestIcon.toString()];
            }
            else {
                return GMInfo.getBrowserAPI().script.icon;
            }
        }
        static get scriptIcon64() {
            if (GMInfo.isBrowserEnvironment()) {
                const manifest = GMInfo.getBrowserAPI().runtime.getManifest();
                return manifest.icons == null ? undefined : manifest.icons['64'];
            }
            else {
                return GMInfo.getBrowserAPI().script.icon64;
            }
        }
        static get scriptAntifeature() {
            if (GMInfo.isBrowserEnvironment()) {
                return undefined; // Browser extensions don't have antifeature
            }
            else {
                return GMInfo.getBrowserAPI().script.antifeature;
            }
        }
        static get scriptOptions() {
            if (GMInfo.isBrowserEnvironment()) {
                return undefined; // Browser extensions don't have script options
            }
            else {
                return GMInfo.getBrowserAPI().script.options;
            }
        }
        static get scriptMetaStr() {
            if (GMInfo.isBrowserEnvironment()) {
                return JSON.stringify(GMInfo.getBrowserAPI().runtime.getManifest());
            }
            else {
                return GMInfo.getBrowserAPI().scriptMetaStr;
            }
        }
        static get scriptHandler() {
            if (GMInfo.isBrowserEnvironment()) {
                return typeof browser !== 'undefined' ? 'Firefox' : 'Chrome';
            }
            else {
                return GMInfo.getBrowserAPI().scriptHandler;
            }
        }
        static get scriptUpdateURL() {
            if (GMInfo.isBrowserEnvironment()) {
                return GMInfo.getBrowserAPI().runtime.getManifest().update_url;
            }
            else {
                return GMInfo.getBrowserAPI().scriptUpdateURL;
            }
        }
        static get scriptWillUpdate() {
            if (GMInfo.isBrowserEnvironment()) {
                return undefined; // Browser extensions handle updates differently
            }
            else {
                return GMInfo.getBrowserAPI().scriptWillUpdate;
            }
        }
        static get scriptResources() {
            if (GMInfo.isBrowserEnvironment()) {
                return undefined; // Browser extensions don't have script resources
            }
            else {
                return GMInfo.getBrowserAPI().scriptResources;
            }
        }
        static get downloadMode() {
            if (GMInfo.isBrowserEnvironment()) {
                return undefined; // Browser extensions don't have download mode
            }
            else {
                return GMInfo.getBrowserAPI().downloadMode;
            }
        }
    }

    class MatchList {
        matches;
        runInIFrame;
        logRunning;
        customSettings;
        get hasMatch() {
            if (!this.runInIFrame && this.isWindowIFrame) {
                return false;
            }
            if (!this.matches.some(x => window.location.toString().includes(x))) {
                return false;
            }
            let color = 'color: blue';
            if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
                color = 'color: aqua';
            }
            let runString = this.logRunning ? `${GMInfo.scriptName} v${GMInfo.scriptVersion}` : '';
            let run = true;
            if (window.location.toString().includes('settings?extension')) {
                runString = `Settings: ${GMInfo.scriptName} v${GMInfo.scriptVersion}`;
                run = false;
            }
            else if (this.customSettings != null) {
                runString = `${this.customSettings.headerName}: ${this.customSettings.toString()}`;
            }
            else {
                runString = `Running: ${GMInfo.scriptName} v${GMInfo.scriptVersion}`;
            }
            if (this.logRunning) {
                console.info(`%c${runString}`, color);
            }
            return run;
        }
        get match() {
            if (!this.runInIFrame && window.parent !== window) {
                return;
            }
            return this.matches.find(x => window.location.toString().includes(x));
        }
        get isWindowIFrame() {
            return window !== window.parent;
        }
        constructor(customSettings) {
            this.matches = [];
            this.runInIFrame = false;
            this.logRunning = true;
            this.customSettings = customSettings;
        }
        addMatch(match) {
            this.matches.push(match);
        }
        removeMatch(match) {
            this.matches = this.matches.filter(m => m !== match);
        }
    }

    Object.defineProperties(window, {
        FAMatchList: { get: () => MatchList },
    });

})();
