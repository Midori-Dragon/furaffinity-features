// ==UserScript==
// @name        Furaffinity-Message-Box
// @namespace   Violentmonkey Scripts
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @grant       GM_info
// @version     1.0.2
// @author      Midori Dragon
// @description Library to hold MessageBox functions for Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/528997-furaffinity-message-box
// @supportURL  https://greasyfork.org/scripts/528997-furaffinity-message-box/feedback
// ==/UserScript==
// jshint esversion: 11
(function () {
    'use strict';

    /**
     * Specifies the buttons that are displayed on a message box.
     * Similar to System.Windows.Forms.MessageBoxButtons in C#.
     */
    var MessageBoxButtons;
    (function (MessageBoxButtons) {
        /**
         * The message box contains an OK button.
         */
        MessageBoxButtons[MessageBoxButtons["OK"] = 0] = "OK";
        /**
         * The message box contains OK and Cancel buttons.
         */
        MessageBoxButtons[MessageBoxButtons["OKCancel"] = 1] = "OKCancel";
        /**
         * The message box contains Abort, Retry, and Ignore buttons.
         */
        MessageBoxButtons[MessageBoxButtons["AbortRetryIgnore"] = 2] = "AbortRetryIgnore";
        /**
         * The message box contains Yes, No, and Cancel buttons.
         */
        MessageBoxButtons[MessageBoxButtons["YesNoCancel"] = 3] = "YesNoCancel";
        /**
         * The message box contains Yes and No buttons.
         */
        MessageBoxButtons[MessageBoxButtons["YesNo"] = 4] = "YesNo";
        /**
         * The message box contains Retry and Cancel buttons.
         */
        MessageBoxButtons[MessageBoxButtons["RetryCancel"] = 5] = "RetryCancel";
    })(MessageBoxButtons || (MessageBoxButtons = {}));

    /**
     * Specifies the icon that is displayed on a message box.
     * Similar to System.Windows.Forms.MessageBoxIcon in C#.
     */
    var MessageBoxIcon;
    (function (MessageBoxIcon) {
        /**
         * No icon is displayed.
         */
        MessageBoxIcon[MessageBoxIcon["None"] = 0] = "None";
        /**
         * An error icon is displayed on the message box.
         */
        MessageBoxIcon[MessageBoxIcon["Error"] = 16] = "Error";
        /**
         * A warning icon is displayed on the message box.
         */
        MessageBoxIcon[MessageBoxIcon["Warning"] = 48] = "Warning";
        /**
         * An information icon is displayed on the message box.
         */
        MessageBoxIcon[MessageBoxIcon["Information"] = 64] = "Information";
        /**
         * A question mark icon is displayed on the message box.
         */
        MessageBoxIcon[MessageBoxIcon["Question"] = 32] = "Question";
    })(MessageBoxIcon || (MessageBoxIcon = {}));

    /**
     * Specifies identifiers to indicate the return value of a dialog box.
     * Similar to System.Windows.Forms.DialogResult in C#.
     */
    var DialogResult;
    (function (DialogResult) {
        /**
         * Nothing is returned from the dialog box. This means that the modal dialog continues running.
         */
        DialogResult[DialogResult["None"] = 0] = "None";
        /**
         * The dialog box return value is OK (usually sent from a button labeled OK).
         */
        DialogResult[DialogResult["OK"] = 1] = "OK";
        /**
         * The dialog box return value is Cancel (usually sent from a button labeled Cancel).
         */
        DialogResult[DialogResult["Cancel"] = 2] = "Cancel";
        /**
         * The dialog box return value is Abort (usually sent from a button labeled Abort).
         */
        DialogResult[DialogResult["Abort"] = 3] = "Abort";
        /**
         * The dialog box return value is Retry (usually sent from a button labeled Retry).
         */
        DialogResult[DialogResult["Retry"] = 4] = "Retry";
        /**
         * The dialog box return value is Ignore (usually sent from a button labeled Ignore).
         */
        DialogResult[DialogResult["Ignore"] = 5] = "Ignore";
        /**
         * The dialog box return value is Yes (usually sent from a button labeled Yes).
         */
        DialogResult[DialogResult["Yes"] = 6] = "Yes";
        /**
         * The dialog box return value is No (usually sent from a button labeled No).
         */
        DialogResult[DialogResult["No"] = 7] = "No";
    })(DialogResult || (DialogResult = {}));

    /**
     * Provides SVG icons for the MessageBox component.
     */
    class MessageBoxIcons {
        /**
         * Gets the SVG icon based on the specified MessageBoxIcon.
         * @param icon The MessageBoxIcon to get the SVG for.
         * @returns The SVG string for the specified icon.
         */
        static getIconSvg(icon) {
            switch (icon) {
                case MessageBoxIcon.Error:
                    return '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ff0000"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
                case MessageBoxIcon.Warning:
                    return '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ffcc4d"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg>';
                case MessageBoxIcon.Information:
                    return '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#2196f3"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
                case MessageBoxIcon.Question:
                    return '<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#2196f3"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';
                case MessageBoxIcon.None:
                default:
                    return '';
            }
        }
    }

    /**
     * Specifies the theme that is used for the message box.
     */
    var MessageBoxThemes;
    (function (MessageBoxThemes) {
        /**
         * Dark theme with white text and dark gray buttons.
         */
        MessageBoxThemes["Dark"] = "dark";
        /**
         * Aurora theme with white text and medium gray buttons.
         */
        MessageBoxThemes["Aurora"] = "aurora";
        /**
         * Retro theme with white text and medium blue-gray buttons.
         */
        MessageBoxThemes["Retro"] = "retro";
        /**
         * Slate theme with white text and light gray buttons.
         */
        MessageBoxThemes["Slate"] = "slate";
        /**
         * Light theme with black text and light gray buttons.
         */
        MessageBoxThemes["Light"] = "light";
    })(MessageBoxThemes || (MessageBoxThemes = {}));

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

    var css_248z = "/* Base styles */\n.message-box-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background-color: rgba(0, 0, 0, 0.5);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    z-index: 9999;\n}\n\n/* Dark theme (default) */\n.message-box-container {\n    border: 1px solid #444;\n    border-radius: 5px;\n    padding: 20px;\n    max-width: 500px;\n    width: 100%;\n    font-family: Arial, sans-serif;\n    transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;\n}\n\n.message-box-header {\n    display: flex;\n    align-items: center;\n    margin-bottom: 15px;\n}\n\n.message-box-icon-container {\n    margin-right: 15px;\n    width: 32px;\n    height: 32px;\n    flex-shrink: 0;\n}\n\n.message-box-title {\n    font-size: 18px;\n    font-weight: bold;\n    margin: 0;\n    transition: color 0.3s;\n}\n\n.message-box-content {\n    margin-bottom: 20px;\n    line-height: 1.5;\n    transition: color 0.3s;\n}\n\n.message-box-button-container {\n    display: flex;\n    justify-content: flex-end;\n    gap: 10px;\n}\n\n.message-box-button {\n    padding: 8px 16px;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 14px;\n    font-weight: bold;\n    background-color: #f1efeb;\n    transition: background-color 0.2s, color 0.2s, border-color 0.2s;\n}\n\n.message-box-button:hover {\n    background-color: #e0ded8;\n}\n\n/* Theme: Dark */\nbody[class*=\"theme-dark\"] .message-box-container {\n    background-color: #353b45;\n    border-color: #444;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);\n}\n\nbody[class*=\"theme-dark\"] .message-box-button {\n    background-color: #434b5b;\n}\n\nbody[class*=\"theme-dark\"] .message-box-button:hover {\n    background-color: #576175;\n}\n\n/* Theme: Aurora */\nbody[class*=\"theme-aurora\"] .message-box-container {\n    background-color: #262931;\n    border-color: #444;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);\n}\n\nbody[class*=\"theme-aurora\"] .message-box-button {\n    background-color: #65707c;\n}\n\nbody[class*=\"theme-aurora\"] .message-box-button:hover {\n    background-color: #8692a0;\n}\n\n/* Theme: Retro */\nbody[class*=\"theme-retro\"] .message-box-container {\n    background-color: #2e3b41;\n    border-color: #444;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);\n}\n\nbody[class*=\"theme-retro\"] .message-box-button {\n    background-color: #4c585e;\n}\n\nbody[class*=\"theme-retro\"] .message-box-button:hover {\n    background-color: #7b909a;\n}\n\n/* Theme: Slate */\nbody[class*=\"theme-slate\"] .message-box-container {\n    background-color: #202225;\n    border-color: #444;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);\n}\n\nbody[class*=\"theme-slate\"] .message-box-button {\n    background-color: #8c8c8c;\n}\n\nbody[class*=\"theme-slate\"] .message-box-button:hover {\n    background-color: #b3b1b1;\n}\n\n/* Theme: Light - already defined in base styles */\nbody[class*=\"theme-light\"] .message-box-container {\n    background-color: #f7f7f7;\n    border-color: #ccc;\n    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n}\n\nbody[class*=\"theme-light\"] .message-box-button {\n    background-color: #f1efeb;\n}\n\nbody[class*=\"theme-light\"] .message-box-button:hover {\n    background-color: #f1ede7;\n}\n";
    styleInject(css_248z);

    class string {
        static isNullOrWhitespace(str) {
            return str == null || str.trim() === '';
        }
        static isNullOrEmpty(str) {
            return str == null || str === '';
        }
    }

    class MessageBox {
        static overlay = null;
        static container = null;
        static result = DialogResult.None;
        static resolvePromise = null;
        static currentTheme = MessageBoxThemes.Light;
        /**
         * Gets the current theme.
         * @returns The current theme.
         */
        static getTheme() {
            return this.currentTheme;
        }
        /**
         * Shows a message box with the specified text, caption, buttons, and icon.
         * @param text The text to display in the message box.
         * @param caption The text to display in the title bar of the message box.
         * @param buttons One of the MessageBoxButtons values that specifies which buttons to display in the message box.
         * @param icon One of the MessageBoxIcon values that specifies which icon to display in the message box.
         * @returns A DialogResult value that indicates which button was clicked.
         */
        static async show(text, caption = '', buttons = MessageBoxButtons.OK, icon = MessageBoxIcon.None) {
            // Create a promise that will be resolved when a button is clicked
            return new Promise((resolve) => {
                this.resolvePromise = resolve;
                this.createMessageBox(text, caption, buttons, icon);
            });
        }
        /**
         * Creates the message box elements and adds them to the DOM.
         */
        static createMessageBox(text, caption, buttons, icon) {
            // Create overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'message-box-overlay';
            // Create container
            this.container = document.createElement('div');
            this.container.className = 'message-box-container';
            // Create header (icon + title)
            const header = document.createElement('div');
            header.className = 'message-box-header';
            // Add icon if specified
            if (icon !== MessageBoxIcon.None) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'message-box-icon-container';
                iconContainer.innerHTML = MessageBoxIcons.getIconSvg(icon);
                header.appendChild(iconContainer);
            }
            // Add title if specified
            if (!string.isNullOrWhitespace(caption)) {
                const title = document.createElement('h3');
                title.className = 'message-box-title';
                title.textContent = caption;
                header.appendChild(title);
            }
            // Add header to container if it has children
            if (header.children.length !== 0) {
                this.container.appendChild(header);
            }
            // Add content
            const content = document.createElement('div');
            content.className = 'message-box-content';
            content.textContent = text;
            this.container.appendChild(content);
            // Add buttons
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'message-box-button-container';
            // Add appropriate buttons based on the MessageBoxButtons enum
            this.addButtons(buttonContainer, buttons);
            this.container.appendChild(buttonContainer);
            this.overlay.appendChild(this.container);
            // Add to DOM
            document.body.appendChild(this.overlay);
        }
        /**
         * Adds the appropriate buttons to the message box based on the MessageBoxButtons enum.
         */
        static addButtons(buttonContainer, buttons) {
            switch (buttons) {
                case MessageBoxButtons.OK:
                    this.createButton(buttonContainer, 'OK', DialogResult.OK);
                    break;
                case MessageBoxButtons.OKCancel:
                    this.createButton(buttonContainer, 'OK', DialogResult.OK);
                    this.createButton(buttonContainer, 'Cancel', DialogResult.Cancel);
                    break;
                case MessageBoxButtons.AbortRetryIgnore:
                    this.createButton(buttonContainer, 'Abort', DialogResult.Abort);
                    this.createButton(buttonContainer, 'Retry', DialogResult.Retry);
                    this.createButton(buttonContainer, 'Ignore', DialogResult.Ignore);
                    break;
                case MessageBoxButtons.YesNoCancel:
                    this.createButton(buttonContainer, 'Yes', DialogResult.Yes);
                    this.createButton(buttonContainer, 'No', DialogResult.No);
                    this.createButton(buttonContainer, 'Cancel', DialogResult.Cancel);
                    break;
                case MessageBoxButtons.YesNo:
                    this.createButton(buttonContainer, 'Yes', DialogResult.Yes);
                    this.createButton(buttonContainer, 'No', DialogResult.No);
                    break;
                case MessageBoxButtons.RetryCancel:
                    this.createButton(buttonContainer, 'Retry', DialogResult.Retry);
                    this.createButton(buttonContainer, 'Cancel', DialogResult.Cancel);
                    break;
            }
        }
        /**
         * Creates a button element with the specified text and result.
         */
        static createButton(container, text, result) {
            const button = document.createElement('button');
            button.className = 'message-box-button';
            button.textContent = text;
            // Add click handler
            button.addEventListener('click', () => {
                this.close(result);
            });
            container.appendChild(button);
        }
        /**
         * Closes the message box and resolves the promise with the specified result.
         */
        static close(result) {
            this.result = result;
            // Remove from DOM
            if (this.overlay != null) {
                document.body.removeChild(this.overlay);
                this.overlay = null;
                this.container = null;
            }
            // Resolve the promise
            if (this.resolvePromise != null) {
                this.resolvePromise(result);
                this.resolvePromise = null;
            }
        }
    }

    Object.defineProperties(window, {
        FAMessageBox: { get: () => MessageBox },
        FAMessageBoxButtons: { get: () => MessageBoxButtons },
        FAMessageBoxIcon: { get: () => MessageBoxIcon },
        FADialogResult: { get: () => DialogResult },
    });
    let themeClassName = 'dark';
    const themeStylesheets = document.head.querySelectorAll('link[rel="stylesheet"][href]') ?? [];
    for (const themeStylesheet of Array.from(themeStylesheets)) {
        const themePath = themeStylesheet.getAttribute('href')?.toLowerCase() ?? '';
        if (themePath.includes('dark')) {
            themeClassName = 'dark';
        }
        else if (themePath.includes('aurora')) {
            themeClassName = 'aurora';
        }
        else if (themePath.includes('retro')) {
            themeClassName = 'retro';
        }
        else if (themePath.includes('slate')) {
            themeClassName = 'slate';
        }
        else if (themePath.includes('light')) {
            themeClassName = 'light';
        }
    }
    document.body.classList.add(`theme-${themeClassName}`);

})();
