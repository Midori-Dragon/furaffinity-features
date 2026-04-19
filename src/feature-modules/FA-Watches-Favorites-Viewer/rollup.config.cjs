const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        FA Watches Favorites Viewer
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @require     https://greasyfork.org/scripts/483952-furaffinity-request-helper/code/483952-furaffinity-request-helper.js
// @require     https://greasyfork.org/scripts/485827-furaffinity-match-list/code/485827-furaffinity-match-list.js
// @require     https://greasyfork.org/scripts/528997-furaffinity-message-box/code/528997-furaffinity-message-box.js
// @require     https://greasyfork.org/scripts/485153-furaffinity-loading-animations/code/485153-furaffinity-loading-animations.js
// @require     https://greasyfork.org/scripts/476762-furaffinity-custom-pages/code/476762-furaffinity-custom-pages.js
// @require     https://greasyfork.org/scripts/475041-furaffinity-custom-settings/code/475041-furaffinity-custom-settings.js
// @grant       GM_info
// @version     3.0.20
// @author      Midori Dragon
// @description Scans the Favorites of your Watches for new Favorites and shows a Button to view these (if any where found). (Works like Submission Page)
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/fa_logo.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/463464-fa-watches-favorites-viewer
// @supportURL  https://greasyfork.org/scripts/463464-fa-watches-favorites-viewer/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
