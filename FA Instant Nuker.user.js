// ==UserScript==
// @name        FA Instant Nuker
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @require     https://greasyfork.org/scripts/483952-furaffinity-request-helper/code/483952-furaffinity-request-helper.js
// @require     https://greasyfork.org/scripts/485827-furaffinity-match-list/code/485827-furaffinity-match-list.js
// @require     https://greasyfork.org/scripts/475041-furaffinity-custom-settings/code/475041-furaffinity-custom-settings.js
// @grant       GM_info
// @version     1.0.9
// @author      Midori Dragon
// @description Adds nuke buttons to instantly nuke all submissions or messages
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/527752-fa-instant-nuker
// @supportURL  https://greasyfork.org/scripts/527752-fa-instant-nuker/feedback
// ==/UserScript==
// jshint esversion: 11
(function (exports) {
    'use strict';

    var NukeIconOptions;
    (function (NukeIconOptions) {
        NukeIconOptions["Red"] = "red";
        NukeIconOptions["White"] = "white";
    })(NukeIconOptions || (NukeIconOptions = {}));

    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["None"] = 0] = "None";
        MessageType[MessageType["Watches"] = 1] = "Watches";
        MessageType[MessageType["JournalComments"] = 2] = "JournalComments";
        MessageType[MessageType["Shouts"] = 3] = "Shouts";
        MessageType[MessageType["Favorites"] = 4] = "Favorites";
        MessageType[MessageType["Journals"] = 5] = "Journals";
        MessageType[MessageType["Submission"] = 6] = "Submission";
        MessageType[MessageType["All"] = 7] = "All";
    })(MessageType || (MessageType = {}));

    class WhiteNukeSVG {
        static get Svg() {
            return '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M9.912 8.531 7.121 3.877a.501.501 0 0 0-.704-.166 9.982 9.982 0 0 0-4.396 7.604.505.505 0 0 0 .497.528l5.421.09a4.042 4.042 0 0 1 1.973-3.402zm8.109-4.51a.504.504 0 0 0-.729.151L14.499 8.83a4.03 4.03 0 0 1 1.546 3.112l5.419-.09a.507.507 0 0 0 .499-.53 9.986 9.986 0 0 0-3.942-7.301zm-4.067 11.511a4.015 4.015 0 0 1-1.962.526 4.016 4.016 0 0 1-1.963-.526l-2.642 4.755a.5.5 0 0 0 .207.692A9.948 9.948 0 0 0 11.992 22a9.94 9.94 0 0 0 4.396-1.021.5.5 0 0 0 .207-.692l-2.641-4.755z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        }
    }

    class NukeButton {
        messageType;
        nukeButton;
        constructor(messageType) {
            this.messageType = messageType;
            this.nukeButton = document.createElement('button');
            this.nukeButton.type = 'button';
            this.nukeButton.classList.add('button', 'standard', 'nuke');
            if (selectNukeIconSetting.value === NukeIconOptions.Red) {
                const nukeIcon = document.createElement('div');
                nukeIcon.classList.add('in-button-icon', 'sprite-nuke');
                nukeIcon.style.margin = '0px';
                this.nukeButton.appendChild(nukeIcon);
            }
            else if (selectNukeIconSetting.value === NukeIconOptions.White) {
                this.nukeButton.innerHTML = WhiteNukeSVG.Svg;
            }
            this.nukeButton.addEventListener('click', () => void this.nuke());
        }
        async nuke() {
            switch (this.messageType) {
                case MessageType.Watches:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Watches.nukeMessages();
                    break;
                case MessageType.JournalComments:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.JournalComments.nukeMessages();
                    break;
                case MessageType.Shouts:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Shouts.nukeMessages();
                    break;
                case MessageType.Favorites:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Favorites.nukeMessages();
                    break;
                case MessageType.Journals:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Journals.nukeMessages();
                    break;
                case MessageType.Submission:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewSubmissions.nukeSubmissions();
                    break;
            }
            location.reload();
        }
    }

    class MessageNuker {
        constructor() {
            const messagesForm = document.getElementById('messages-form');
            const messageSections = messagesForm?.querySelectorAll('section[class="section_container"][id*="messages-"]');
            if (messageSections == null) {
                return;
            }
            for (const section of Array.from(messageSections)) {
                const sectionType = this.getSectionTypeFromElement(section);
                if (sectionType === MessageType.None) {
                    continue;
                }
                const nukeButton = new NukeButton(sectionType);
                const sectionControls = section.querySelector('div[class*="section_controls"]');
                if (!sectionControls) {
                    continue;
                }
                sectionControls.appendChild(nukeButton.nukeButton);
            }
        }
        getSectionTypeFromElement(section) {
            const sectionString = section.id.trimStart('messages-');
            switch (sectionString) {
                default: return MessageType.None;
                case 'watches': return MessageType.Watches;
                case 'comments-journal': return MessageType.JournalComments;
                case 'shouts': return MessageType.Shouts;
                case 'favorites': return MessageType.Favorites;
                case 'journals': return MessageType.Journals;
            }
        }
    }

    class SubmissionNuker {
        constructor() {
            const standardPage = document.getElementById('standardpage');
            const actionsSection = standardPage?.querySelectorAll('section[class*="actions-section"]');
            if (actionsSection == null) {
                return;
            }
            for (const section of Array.from(actionsSection)) {
                const sectionOptions = section.querySelector('div[class*="section-options"]');
                if (sectionOptions == null) {
                    continue;
                }
                const nukeButton = new NukeButton(MessageType.Submission);
                sectionOptions.appendChild(nukeButton.nukeButton);
            }
        }
    }

    const scriptName = 'FA Instant Nuker';
    const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);
    const selectNukeIconSetting = customSettings.newSetting(window.FASettingType.Option, 'Select Nuke Icon');
    selectNukeIconSetting.description = 'Select the Nuke Icon to use for the Nuke Button.';
    selectNukeIconSetting.options = {
        [NukeIconOptions.Red]: 'Red Nuke Icon',
        [NukeIconOptions.White]: 'White Nuke Icon'
    };
    selectNukeIconSetting.defaultValue = NukeIconOptions.Red;
    customSettings.loadSettings();
    const requestHelper = new window.FARequestHelper(2);
    if (customSettings.isFeatureEnabled) {
        const matchListSubmissions = new window.FAMatchList(customSettings);
        matchListSubmissions.matches = ['msg/submissions'];
        matchListSubmissions.runInIFrame = false;
        if (matchListSubmissions.hasMatch) {
            new SubmissionNuker();
        }
        const matchListMessages = new window.FAMatchList(customSettings);
        matchListMessages.matches = ['msg/others'];
        matchListMessages.runInIFrame = false;
        if (matchListMessages.hasMatch) {
            new MessageNuker();
        }
    }

    exports.requestHelper = requestHelper;
    exports.scriptName = scriptName;
    exports.selectNukeIconSetting = selectNukeIconSetting;

    return exports;

})({});
