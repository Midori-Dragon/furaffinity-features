// ==UserScript==
// @name        Furaffinity-Custom-Settings
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     4.3.3
// @author      Midori Dragon
// @description Library to create Custom settings on Furaffinitiy
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/475041-furaffinity-custom-settings
// @supportURL  https://greasyfork.org/scripts/475041-furaffinity-custom-settings/feedback
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

    var SettingType;
    (function (SettingType) {
        SettingType[SettingType["Number"] = 0] = "Number";
        SettingType[SettingType["Boolean"] = 1] = "Boolean";
        SettingType[SettingType["Action"] = 2] = "Action";
        SettingType[SettingType["Text"] = 3] = "Text";
        SettingType[SettingType["Option"] = 4] = "Option";
    })(SettingType || (SettingType = {}));

    function makeIdCompatible(id) {
        const sanitizedString = id
            .replace(/[^a-zA-Z0-9-_\.]/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/^-*(?=\d)/, 'id-');
        return /^[0-9]/.test(sanitizedString) ? 'id-' + sanitizedString : sanitizedString;
    }

    class SettingAction extends EventTarget {
        id;
        type;
        name;
        description = '';
        defaultValue;
        settingElem;
        _onInput;
        _settingInputElem;
        constructor(providerId, name) {
            super();
            Object.setPrototypeOf(this, SettingAction.prototype);
            this.name = name;
            this.id = providerId + '-' + makeIdCompatible(this.name);
            this.type = SettingType.Action;
            this.defaultValue = '';
            this.loadFromSyncedStorage();
            this.settingElem = this._settingInputElem = this.create();
        }
        get value() {
            return this._settingInputElem.textContent ?? '';
        }
        set value(newValue) {
            this._settingInputElem.textContent = newValue;
        }
        get onInput() {
            return this._onInput;
        }
        set onInput(handler) {
            this._onInput = handler;
        }
        create() {
            const settingElem = document.createElement('button');
            settingElem.id = this.id;
            settingElem.type = 'button';
            settingElem.className = 'button standard mobile-fix';
            settingElem.textContent = this.name;
            settingElem.addEventListener('click', this.invokeInput.bind(this));
            return settingElem;
        }

        loadFromSyncedStorage() { }
        toString() {
            return `${this.name} = ${this.value}`;
        }
        invokeInput() {
            this._onInput?.(this._settingInputElem);
            this.dispatchEvent(new Event('input'));
        }
    }

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

    
    class SyncedStorage {
        static warningSentCount = 0;
        static maxWarningCount = 10;
        static async setItem(key, value) {
            if (!GMInfo.isBrowserEnvironment()) {
                if (this.warningSentCount < this.maxWarningCount) {
                    Logger.logWarning('SyncedStorage is only available in browser extensions.');
                    this.warningSentCount++;
                }
                return;
            }
            Logger.logInfo(`Setting item in synced storage: ${key}=${value}`);
            const api = GMInfo.getBrowserAPI();
            if (api.storage != null) {
                return new Promise((resolve, reject) => {
                    api.storage.sync.set({ [key]: value }, () => {
                        if (api.runtime.lastError != null) {
                            return reject(api.runtime.lastError);
                        }
                        resolve();
                    });
                });
            }
            else {
                Logger.logError('Unsupported storage API.');
            }
        }
        static async getItem(key) {
            if (!GMInfo.isBrowserEnvironment()) {
                if (this.warningSentCount < this.maxWarningCount) {
                    Logger.logWarning('SyncedStorage is only available in browser extensions.');
                    this.warningSentCount++;
                }
                return;
            }
            Logger.logInfo(`Getting item from synced storage: ${key}`);
            const api = GMInfo.getBrowserAPI();
            if (api.storage != null) {
                return new Promise((resolve, reject) => {
                    api.storage.sync.get(key, (result) => {
                        if (api.runtime.lastError != null) {
                            return reject(api.runtime.lastError);
                        }
                        resolve(result[key]);
                    });
                });
            }
            else {
                Logger.logError('Unsupported storage API.');
            }
        }
        static async getAllItems() {
            if (!GMInfo.isBrowserEnvironment()) {
                if (this.warningSentCount < this.maxWarningCount) {
                    Logger.logWarning('SyncedStorage is only available in browser extensions.');
                    this.warningSentCount++;
                }
                return {};
            }
            Logger.logInfo('Getting all items from synced storage');
            const api = GMInfo.getBrowserAPI();
            if (api.storage != null) {
                return new Promise((resolve, reject) => {
                    api.storage.sync.get(null, (result) => {
                        if (api.runtime.lastError != null) {
                            return reject(api.runtime.lastError);
                        }
                        resolve(result);
                    });
                });
            }
            else {
                Logger.logError('Unsupported storage API.');
                return {};
            }
        }
        static async removeItem(key) {
            if (!GMInfo.isBrowserEnvironment()) {
                if (this.warningSentCount < this.maxWarningCount) {
                    Logger.logWarning('SyncedStorage is only available in browser extensions.');
                    this.warningSentCount++;
                }
                return;
            }
            Logger.logInfo(`Removing item from synced storage: ${key}`);
            const api = GMInfo.getBrowserAPI();
            if (api.storage != null) {
                return new Promise((resolve, reject) => {
                    api.storage.sync.remove(key, () => {
                        if (api.runtime.lastError != null) {
                            return reject(api.runtime.lastError);
                        }
                        resolve();
                    });
                });
            }
            else {
                Logger.logError('Unsupported storage API.');
            }
        }
    }

    class SettingBoolean extends EventTarget {
        id;
        type;
        name;
        description = '';
        settingElem;
        _onInput;
        _defaultValue;
        _settingInputElem;
        constructor(providerId, name) {
            super();
            Object.setPrototypeOf(this, SettingBoolean.prototype);
            this.name = name;
            this.id = providerId + '-' + makeIdCompatible(this.name);
            this.type = SettingType.Boolean;
            this._defaultValue = false;
            this.loadFromSyncedStorage();
            this.settingElem = this.create();
            this._settingInputElem = this.settingElem.querySelector('input');
        }
        get value() {
            const localValue = localStorage.getItem(this.id);
            if (localValue == null) {
                return this.defaultValue;
            }
            return localValue === 'true' || localValue === '1';
        }
        set value(newValue) {
            if (newValue === this.defaultValue) {
                localStorage.removeItem(this.id);
                void SyncedStorage.removeItem(this.id);
            }
            else {
                localStorage.setItem(this.id, newValue.toString());
                void SyncedStorage.setItem(this.id, newValue);
            }
            this._settingInputElem.checked = newValue;
            this.invokeInput(this._settingInputElem);
        }
        get defaultValue() {
            return this._defaultValue;
        }
        set defaultValue(value) {
            this._defaultValue = value;
            this.value = this.value;
        }
        get onInput() {
            return this._onInput;
        }
        set onInput(handler) {
            this._onInput = handler;
        }
        create() {
            const container = document.createElement('div');
            const settingElem = document.createElement('input');
            settingElem.id = this.id;
            settingElem.type = 'checkbox';
            settingElem.style.cursor = 'pointer';
            settingElem.style.marginRight = '4px';
            settingElem.addEventListener('change', () => this.value = settingElem.checked);
            container.appendChild(settingElem);
            const settingElemLabel = document.createElement('label');
            settingElemLabel.textContent = this.name;
            settingElemLabel.style.cursor = 'pointer';
            settingElemLabel.style.userSelect = 'none';
            settingElemLabel.htmlFor = this.id;
            container.appendChild(settingElemLabel);
            return container;
        }
        loadFromSyncedStorage() {
            void SyncedStorage.getItem(this.id).then((value) => {
                if (value != null) {
                    localStorage.setItem(this.id, value.toString());
                }
            });
        }
        toString() {
            return `${this.name} = ${this.value}`;
        }
        invokeInput(elem) {
            this.onInput?.(elem);
            this.dispatchEvent(new CustomEvent('input', { detail: elem }));
        }
    }

    class SettingNumber extends EventTarget {
        id;
        type;
        name;
        description = '';
        min;
        max;
        step;
        settingElem;
        _onInput;
        _defaultValue;
        _settingInputElem;
        constructor(providerId, name) {
            super();
            Object.setPrototypeOf(this, SettingNumber.prototype);
            this.name = name;
            this.id = providerId + '-' + makeIdCompatible(this.name);
            this.type = SettingType.Number;
            this._defaultValue = 0;
            this.min = 0;
            this.max = 32767;
            this.step = 1;
            this.loadFromSyncedStorage();
            this.settingElem = this._settingInputElem = this.create();
        }
        get value() {
            return parseInt(localStorage.getItem(this.id) ?? this.defaultValue.toString()) || this.defaultValue;
        }
        set value(newValue) {
            newValue = Math.min(Math.max(newValue, this.min), this.max);
            if (newValue === this.defaultValue) {
                localStorage.removeItem(this.id);
                void SyncedStorage.removeItem(this.id);
            }
            else {
                localStorage.setItem(this.id, newValue.toString());
                void SyncedStorage.setItem(this.id, newValue);
            }
            this._settingInputElem.value = newValue.toString();
            this.invokeInput(this._settingInputElem);
        }
        get defaultValue() {
            return this._defaultValue;
        }
        set defaultValue(value) {
            this._defaultValue = value;
            this.value = this.value;
        }
        get onInput() {
            return this._onInput;
        }
        set onInput(handler) {
            this._onInput = handler;
        }
        create() {
            const settingElem = document.createElement('input');
            settingElem.id = this.id;
            settingElem.type = 'text';
            settingElem.className = 'textbox';
            settingElem.addEventListener('keydown', (event) => {
                const currentValue = parseInt(settingElem.value) || this.defaultValue;
                if (event.key === 'ArrowUp') {
                    this.value = Math.min(currentValue + this.step, this.max);
                }
                else if (event.key === 'ArrowDown') {
                    this.value = Math.max(currentValue - this.step, this.min);
                }
            });
            settingElem.addEventListener('input', () => {
                const inputValue = settingElem.value.replace(/[^0-9]/g, '');
                const numericValue = parseInt(inputValue) || this.defaultValue;
                this.value = Math.min(Math.max(numericValue, this.min), this.max);
            });
            return settingElem;
        }
        loadFromSyncedStorage() {
            void SyncedStorage.getItem(this.id).then((value) => {
                if (value != null) {
                    localStorage.setItem(this.id, value.toString());
                }
            });
        }
        toString() {
            return `${this.name} = ${this.value}`;
        }
        invokeInput(elem) {
            this.onInput?.(elem);
            this.dispatchEvent(new CustomEvent('input', { detail: elem }));
        }
    }

    class SettingText extends EventTarget {
        id;
        type;
        name;
        description = '';
        settingElem;
        verifyRegex;
        _onInput;
        _defaultValue;
        _settingInputElem;
        _errorMessage;
        constructor(providerId, name) {
            super();
            Object.setPrototypeOf(this, SettingText.prototype);
            this.name = name;
            this.id = providerId + '-' + makeIdCompatible(this.name);
            this.type = SettingType.Text;
            this._defaultValue = '';
            this.loadFromSyncedStorage();
            this.settingElem = this.create();
            this._settingInputElem = this.settingElem.querySelector('input');
            this._errorMessage = this.settingElem.querySelector('.error-message');
        }
        get value() {
            return localStorage.getItem(this.id) ?? this.defaultValue;
        }
        set value(newValue) {
            if (this.verifyRegex != null && !this.verifyRegex.test(newValue)) {
                this._errorMessage.style.display = 'block';
                return;
            }
            this._errorMessage.style.display = 'none';
            try {
                if (newValue === this.defaultValue) {
                    localStorage.removeItem(this.id);
                    void SyncedStorage.removeItem(this.id);
                }
                else {
                    localStorage.setItem(this.id, newValue);
                    void SyncedStorage.setItem(this.id, newValue);
                }
            }
            catch (error) {
                Logger.logError(error);
            }
            this._settingInputElem.value = newValue;
            this.invokeInput(this._settingInputElem);
        }
        get defaultValue() {
            return this._defaultValue;
        }
        set defaultValue(value) {
            this._defaultValue = value;
            this.value = this.value;
        }
        get onInput() {
            return this._onInput;
        }
        set onInput(handler) {
            this._onInput = handler;
        }
        create() {
            const container = document.createElement('div');
            container.style.position = 'relative';
            const settingElem = document.createElement('input');
            settingElem.id = this.id;
            settingElem.type = 'text';
            settingElem.className = 'textbox';
            settingElem.addEventListener('input', () => {
                if (this.verifyRegex != null && !this.verifyRegex.test(settingElem.value)) {
                    this._errorMessage.style.display = 'block';
                }
                else {
                    this._errorMessage.style.display = 'none';
                }
                this.value = settingElem.value;
            });
            container.appendChild(settingElem);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.color = 'red';
            errorMessage.style.display = 'none';
            errorMessage.style.position = 'absolute';
            errorMessage.style.top = '100%';
            errorMessage.style.left = '0';
            errorMessage.textContent = 'Invalid input';
            container.appendChild(errorMessage);
            return container;
        }
        loadFromSyncedStorage() {
            void SyncedStorage.getItem(this.id).then((value) => {
                if (value != null) {
                    localStorage.setItem(this.id, value.toString());
                }
            });
        }
        toString() {
            return `${this.name} = ${this.value}`;
        }
        invokeInput(elem) {
            this.onInput?.(elem);
            this.dispatchEvent(new CustomEvent('input', { detail: elem }));
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

    var css_248z = ".switch-cs {\n    position: relative;\n    display: inline-block;\n    width: 52px;\n    height: 28px;\n    margin: 6px 8px 6px 0;\n}\n\n.switch-cs input {\n    opacity: 0;\n    width: 0;\n    height: 0;\n}\n\n.slider-cs {\n    position: absolute;\n    cursor: pointer;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background-color: #ccc;\n    transition: .4s;\n    border-radius: 34px;\n}\n\n.slider-cs:before {\n    position: absolute;\n    content: \"\";\n    height: 20px;\n    width: 20px;\n    left: 4px;\n    bottom: 4px;\n    background-color: white;\n    transition: .4s;\n    border-radius: 50%;\n}\n\ninput:checked+.slider-cs {\n    background-color: #4CAF50;\n}\n\ninput:checked+.slider-cs:before {\n    transform: translateX(26px);\n}\n\n.section-header.cs {\n    display: flex;\n    align-items: center;\n}\n\n.section-body.cs {\n    opacity: 1;\n    transition: opacity 0.3s linear;\n}\n\n.section-body.cs.collapsed {\n    opacity: 0.4;\n    pointer-events: none;\n}\n";
    styleInject(css_248z);

    class SettingOption extends EventTarget {
        id;
        type;
        name;
        description = '';
        settingElem;
        _onInput;
        _defaultValue;
        _settingInputElem;
        constructor(providerId, name) {
            super();
            Object.setPrototypeOf(this, SettingOption.prototype);
            this.name = name;
            this.id = providerId + '-' + makeIdCompatible(this.name);
            this.type = SettingType.Option;
            this._defaultValue = '0';
            this.loadFromSyncedStorage();
            this.settingElem = this.create();
            this._settingInputElem = this.settingElem.querySelector('select');
        }
        get value() {
            return localStorage.getItem(this.id) ?? this.defaultValue;
        }
        set value(newValue) {
            try {

                if (newValue == this.defaultValue) {
                    localStorage.removeItem(this.id);
                    void SyncedStorage.removeItem(this.id);
                }
                else {
                    localStorage.setItem(this.id, newValue.toString());
                    void SyncedStorage.setItem(this.id, newValue.toString());
                }
            }
            catch (error) {
                Logger.logError(error);
            }
            this._settingInputElem.value = newValue.toString();
            this.invokeInput(this._settingInputElem);
        }
        get defaultValue() {
            return this._defaultValue;
        }
        set defaultValue(value) {
            this._defaultValue = value;
            this.value = this.value;
        }
        get options() {
            const options = {};
            for (const option of Array.from(this._settingInputElem.options)) {
                options[option.value] = option.textContent ?? '';
            }
            return options;
        }
        set options(newValue) {
            const currValue = this.value;
            this._settingInputElem.innerHTML = '';
            for (const [value, text] of Object.entries(newValue)) {
                this.addOption(value, text);
            }
            if (Array.from(this._settingInputElem.options).some(x => x.value === currValue.toString())) {
                this.value = currValue;
            }
            else {
                this.value = this.defaultValue;
            }
        }
        get onInput() {
            return this._onInput;
        }
        set onInput(handler) {
            this._onInput = handler;
        }
        addOption(value, text) {
            if (this._settingInputElem.options.namedItem(value.toString()) != null) {
                Logger.logWarning(`Option with value "${value}" already exists.`);
                return;
            }
            const option = document.createElement('option');
            option.value = value.toString();
            option.textContent = text.toString();
            this._settingInputElem.options.add(option);
        }
        removeOption(value) {
            const option = this._settingInputElem.options.namedItem(value.toString());
            if (option == null) {
                Logger.logWarning(`Option with value "${value}" does not exist.`);
                return;
            }
            this._settingInputElem.removeChild(option);
        }
        create() {
            const container = document.createElement('div');
            container.style.position = 'relative';
            const settingElem = document.createElement('select');
            settingElem.id = this.id;
            settingElem.className = 'forminput styled';
            settingElem.addEventListener('change', () => {
                this.value = settingElem.value;
            });
            container.appendChild(settingElem);
            return container;
        }
        loadFromSyncedStorage() {
            void SyncedStorage.getItem(this.id).then((value) => {
                if (value != null) {
                    localStorage.setItem(this.id, value.toString());
                }
            });
        }
        toString() {
            return `${this.name} = ${this.value}`;
        }
        invokeInput(elem) {
            this.onInput?.(elem);
            this.dispatchEvent(new CustomEvent('input', { detail: elem }));
        }
    }

    
    class StorageWrapper {
        static async setItemAsync(key, value, retry = false) {
            try {
                if (retry) {
                    return await StorageWrapper.setItemAsyncWithRetry(key, value);
                }
                localStorage.setItem(key, value);
                await SyncedStorage.setItem(key, value);
                return true;
            }
            catch {
                Logger.logError(`Failed to set item in storage: ${key}=${value}`);
                return false;
            }
        }
        static async setItemAsyncWithRetry(key, value) {
            return new Promise((resolve) => {
                const attemptSave = async () => {
                    const success = await StorageWrapper.setItemAsync(key, value);
                    if (success) {
                        resolve(true);
                    }
                    else {
                        Logger.logWarning(`Failed to save item ${key}, retrying in 1000ms...`);
                        setTimeout(() => void attemptSave(), 1000);
                    }
                };
                void attemptSave();
            });
        }
        static async getItemAsync(key) {
            try {
                const valueLocal = localStorage.getItem(key);
                const valueSynced = await SyncedStorage.getItem(key);
                if (valueSynced === valueLocal) {
                    return valueSynced;
                }
                return valueSynced ?? valueLocal;
            }
            catch {
                Logger.logError(`Failed to get item from storage: ${key}`);
                return null;
            }
        }
        static async removeItemAsync(key) {
            try {
                localStorage.removeItem(key);
                await SyncedStorage.removeItem(key);
                return true;
            }
            catch {
                Logger.logError(`Failed to remove item from storage: ${key}`);
                return false;
            }
        }
        static async getAllItemsAsync() {
            try {
                const localStorageItems = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key == null)
                        continue;
                    const value = localStorage.getItem(key);
                    localStorageItems[key] = value;
                }
                const syncedItems = await SyncedStorage.getAllItems();
                return { ...localStorageItems, ...syncedItems };
            }
            catch {
                Logger.logError('Failed to get all items from storage');
                return {};
            }
        }
    }

    class Settings {
        settings = {};
        showFeatureEnabledSetting = true;
        _menuName;
        _menuNameId;
        _provider;
        _providerId;
        _headerName;
        _isFeatureEnabledSetting;
        _settingClassMapping = {
            [SettingType.Number]: SettingNumber,
            [SettingType.Boolean]: SettingBoolean,
            [SettingType.Action]: SettingAction,
            [SettingType.Text]: SettingText,
            [SettingType.Option]: SettingOption
        };
        constructor(provider, headerName) {
            this._menuName = 'Extension Settings';
            this._menuNameId = makeIdCompatible('Extension Settings');
            this._provider = provider;
            this._providerId = makeIdCompatible(provider);
            this._headerName = headerName;
            this._isFeatureEnabledSetting = new SettingBoolean(this.providerId, `${headerName} Enabled`);
            this._isFeatureEnabledSetting.defaultValue = true;
            let currSettingsJson = localStorage.getItem('ff-registered-settings');
            currSettingsJson ??= '[]';
            const currSettings = JSON.parse(currSettingsJson);
            if (!currSettings.includes(this.providerId)) {
                currSettings.push(this.providerId);
                localStorage.setItem('ff-registered-settings', JSON.stringify(currSettings));
            }
        }
        get menuName() {
            return this._menuName;
        }
        get menuNameId() {
            return this._menuNameId;
        }
        get provider() {
            return this._provider;
        }
        get providerId() {
            return this._providerId;
        }
        get headerName() {
            return this._headerName;
        }
        get isFeatureEnabled() {
            return this._isFeatureEnabledSetting.value;
        }
        newSetting(type, name) {
            const classConstructor = this._settingClassMapping[type];
            const newSetting = new classConstructor(this.providerId, name);
            this.settings[name] = newSetting;
            return newSetting;
        }
        loadSettings() {
            try {
                this.addExSettingsMenu(this.menuName, this.provider, this.menuNameId, this.providerId);
                if (window.location.toString().includes('controls/settings')) {
                    this.addExSettingsMenuSidebar(this.menuName, this.provider, this.menuNameId, this.providerId);
                    if (window.location.toString().includes('?extension=' + this.providerId)) {
                        this.loadSettingValues(this.headerName, Object.values(this.settings));
                    }
                }
            }
            catch (error) {
                Logger.logError(error);
            }
        }
        async exportSettings() {
            try {
                let registeredSettingsJson = localStorage.getItem('ff-registered-settings');
                registeredSettingsJson ??= '[]';
                const registeredSettings = JSON.parse(registeredSettingsJson);
                if (registeredSettings.length === 0) {
                    return;
                }
                let settings = await StorageWrapper.getAllItemsAsync();
                if (settings == null) {
                    return;
                }
                settings = Object.entries(settings)
                    .filter(([key]) => registeredSettings.some(setting => key.startsWith(setting)))
                    .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});
                Logger.logInfo('Exporting Settings');
                Logger.logInfo(settings);
                if (Object.keys(settings).length === 0) {
                    return;
                }
                const settingsString = JSON.stringify(settings, null, 2);
                const blob = new Blob([settingsString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.providerId}_settings.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            catch (error) {
                Logger.logError(error);
            }
        }
        async importSettings(settingsJson) {
            try {
                Logger.logInfo('Importing Settings');
                Logger.logInfo(settingsJson);
                settingsJson ??= '{}';
                const settings = JSON.parse(settingsJson);
                for (const [key, value] of Object.entries(settings)) {
                    await StorageWrapper.setItemAsync(key, value);
                }
            }
            catch (error) {
                Logger.logError(error);
            }
        }
        loadSettingValues(headerName, settings) {
            if (settings.length === 0) {
                return;
            }
            const settingsContainerPresent = document.getElementById(headerName + '_settingscontainer') != null;
            if (settingsContainerPresent) {
                return;
            }
            const columnPage = document.getElementById('columnpage');
            const content = columnPage?.querySelector('div[class="content"]');
            if (content == null) {
                Logger.logError('Failed to load settings. No content found.');
                return;
            }
            const nonExSettings = content.querySelectorAll('section:not([class="exsettings"])');
            for (const section of Array.from(nonExSettings ?? [])) {
                section.parentNode?.removeChild(section);
            }
            const section = document.createElement('section');
            section.id = headerName + '_settingscontainer';
            section.className = 'exsettings';
            const headerContainer = document.createElement('div');
            headerContainer.className = 'section-header cs';
            const header = document.createElement('h2');
            header.textContent = headerName;
            const bodyContainer = document.createElement('div');
            bodyContainer.className = 'section-body cs';
            if (this._isFeatureEnabledSetting.value) {
                bodyContainer.classList.remove('collapsed');
            }
            else {
                bodyContainer.classList.add('collapsed');
            }
            if (this.showFeatureEnabledSetting) {
                headerContainer.appendChild(this.createFeatureEnableSetting(bodyContainer));
            }
            headerContainer.appendChild(header);
            section.appendChild(headerContainer);
            for (const setting of settings) {
                bodyContainer.appendChild(this.createSettingContainer(setting));
            }
            section.appendChild(bodyContainer);
            content.appendChild(section);
        }
        createFeatureEnableSetting(bodyContainer) {
            const enableFeatureSettingContainerElem = document.createElement('label');
            enableFeatureSettingContainerElem.classList.add('switch-cs');
            const enableFeatureSettingInput = document.createElement('input');
            enableFeatureSettingInput.type = 'checkbox';
            enableFeatureSettingInput.id = 'toggleSwitch';
            enableFeatureSettingInput.checked = this._isFeatureEnabledSetting.value;
            enableFeatureSettingInput.addEventListener('input', () => {
                this._isFeatureEnabledSetting.value = enableFeatureSettingInput.checked;
                if (enableFeatureSettingInput.checked) {
                    bodyContainer.classList.remove('collapsed');
                }
                else {
                    bodyContainer.classList.add('collapsed');
                }
            });
            const enableFeatureSettingSpan = document.createElement('span');
            enableFeatureSettingSpan.classList.add('slider-cs');
            enableFeatureSettingContainerElem.appendChild(enableFeatureSettingInput);
            enableFeatureSettingContainerElem.appendChild(enableFeatureSettingSpan);
            return enableFeatureSettingContainerElem;
        }
        toString() {
            if (Object.keys(this.settings).length === 0) {
                return `${this.menuName} has no settings.`;
            }
            let settingsString = '(';
            Object.keys(this.settings).forEach((key) => {
                if (this.settings[key].type !== SettingType.Action) {
                    settingsString += `"${this.settings[key].toString()}", `;
                }
            });
            settingsString = settingsString.slice(0, -2) + ')';
            return settingsString;
        }
        createSettingContainer(setting) {
            const settingContainer = document.createElement('div');
            settingContainer.className = 'control-panel-item-container';
            const settingName = document.createElement('div');
            settingName.className = 'control-panel-item-name';
            const settingNameText = document.createElement('h4');
            settingNameText.textContent = setting.name;
            settingName.appendChild(settingNameText);
            settingContainer.appendChild(settingName);
            const settingDesc = document.createElement('div');
            settingDesc.className = 'control-panel-item-description';
            const settingDescText = document.createTextNode(setting.description);
            settingDesc.appendChild(settingDescText);
            settingContainer.appendChild(settingDesc);
            if (showResetButtonSetting.value && setting.type !== SettingType.Action) {
                settingDesc.appendChild(document.createElement('br'));
                settingDesc.appendChild(this.createSettingReset(setting));
            }
            const settingOption = document.createElement('div');
            settingOption.className = 'control-panel-item-options';
            settingOption.appendChild(setting.settingElem);
            settingContainer.appendChild(settingOption);
            return settingContainer;
        }
        createSettingReset(setting) {
            const settingDescReset = document.createElement('a');
            settingDescReset.id = setting.id + '_settingreset';
            settingDescReset.textContent = 'Reset this Setting';
            settingDescReset.style.cursor = 'pointer';
            settingDescReset.style.color = 'aqua';
            settingDescReset.style.textDecoration = 'underline';
            settingDescReset.style.fontStyle = 'italic';
            settingDescReset.style.fontSize = '14px';
            settingDescReset.addEventListener('click', () => {
                setting.value = setting.defaultValue;
            });
            return settingDescReset;
        }
        addExSettingsMenu(name, provider, nameId, providerId) {
            try {
                const navBar = document.querySelector('ul[class="navhideonmobile"]');
                const settings = navBar?.querySelector('a[href="/controls/settings/"]')?.parentNode;
                if (settings == null) {
                    Logger.logError(`Failed to add extension ${name} to settings menu`);
                    return;
                }
                const exSettingNamePresent = document.getElementById(nameId) != null;
                const exSettingProviderPresent = document.getElementById(providerId) != null;
                if (!exSettingNamePresent) {
                    const exSettingsHeader = document.createElement('h3');
                    exSettingsHeader.id = nameId;
                    exSettingsHeader.textContent = name;
                    settings.appendChild(exSettingsHeader);
                }
                if (!exSettingProviderPresent) {
                    const currExSettings = document.createElement('a');
                    currExSettings.id = providerId;
                    currExSettings.textContent = provider;
                    currExSettings.href = '/controls/settings?extension=' + providerId;
                    currExSettings.style.cursor = 'pointer';
                    settings.appendChild(currExSettings);
                }
            }
            catch (error) {
                Logger.logError(error);
            }
        }
        addExSettingsMenuSidebar(name, provider, nameId, providerId) {
            try {
                const settings = document.getElementById('controlpanelnav');
                if (settings == null) {
                    Logger.logError(`Failed to add extension ${name} to settings sidebar`);
                    return;
                }
                const exSettingNamePresent = document.getElementById(nameId + '_side') != null;
                const exSettingProviderPresent = document.getElementById(providerId + '_side') != null;
                if (!exSettingNamePresent) {
                    const exSettingsHeader = document.createElement('h3');
                    exSettingsHeader.id = nameId + '_side';
                    exSettingsHeader.textContent = name;
                    settings.appendChild(exSettingsHeader);
                }
                if (!exSettingProviderPresent) {
                    const currExSettings = document.createElement('a');
                    currExSettings.id = providerId + '_side';
                    currExSettings.textContent = provider;
                    currExSettings.href = '/controls/settings?extension=' + providerId;
                    currExSettings.style.cursor = 'pointer';
                    settings.appendChild(currExSettings);
                    settings.appendChild(document.createElement('br'));
                }
            }
            catch (error) {
                Logger.logError(error);
            }
        }
    }

    Object.defineProperties(window, {
        FACustomSettings: { get: () => Settings },
        FASettingType: { get: () => SettingType },
    });
    const customSettings = new Settings('Custom Furaffinity Settings', 'Global Custom Furaffinity Settings');
    customSettings.showFeatureEnabledSetting = false;
    const loggingSetting = customSettings.newSetting(window.FASettingType.Option, 'Logging');
    loggingSetting.description = 'Sets the logging level.';
    loggingSetting.defaultValue = LogLevel.Error;
    loggingSetting.options = {
        [LogLevel.Error]: LogLevel[LogLevel.Error],
        [LogLevel.Warning]: LogLevel[LogLevel.Warning],
        [LogLevel.Info]: LogLevel[LogLevel.Info]
    };
    loggingSetting.addEventListener('input', () => Logger.setLogLevel(parseInt(loggingSetting.value.toString())));
    Logger.setLogLevel(parseInt(loggingSetting.value.toString()));
    const showResetButtonSetting = customSettings.newSetting(SettingType.Boolean, 'Show Reset Button');
    showResetButtonSetting.description = 'Set wether the "Reset this Setting" button is shown in other Settings.';
    showResetButtonSetting.defaultValue = true;
    const importSettingsSetting = customSettings.newSetting(SettingType.Action, 'Import Settings');
    importSettingsSetting.description = 'Imports the Settings from a JSON file.';
    importSettingsSetting.addEventListener('input', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change', () => {
            const file = fileInput.files?.[0];
            if (file) {
                void file.text().then((content) => {
                    void customSettings.importSettings(content);
                    location.reload();
                });
            }
        });
        fileInput.click();
    });
    const exportSettingsSetting = customSettings.newSetting(SettingType.Action, 'Export Settings');
    exportSettingsSetting.description = 'Exports the current Settings to a JSON file.';
    exportSettingsSetting.addEventListener('input', () => void customSettings.exportSettings());
    customSettings.loadSettings();
    let color = 'color: blue';
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        color = 'color: aqua';
    }
    const settingString = `GlobalSettings: ${customSettings.toString()}`;
    console.info(`%c${settingString}`, color);

    exports.exportSettingsSetting = exportSettingsSetting;
    exports.importSettingsSetting = importSettingsSetting;
    exports.loggingSetting = loggingSetting;
    exports.showResetButtonSetting = showResetButtonSetting;

    return exports;

})({});
