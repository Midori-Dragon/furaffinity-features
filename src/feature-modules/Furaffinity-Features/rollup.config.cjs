const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        name: 'FuraffinityFeatures',
        banner:
            `// ==UserScript==
// @name        Furaffinity-Features
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
// @require     https://greasyfork.org/scripts/458971-fa-embedded-image-viewer/code/458971-fa-embedded-image-viewer.js
// @require     https://greasyfork.org/scripts/457759-fa-webcomic-auto-loader/code/457759-fa-webcomic-auto-loader.js
// @require     https://greasyfork.org/scripts/462632-fa-infini-gallery/code/462632-fa-infini-gallery.js
// @require     https://greasyfork.org/scripts/527752-fa-instant-nuker/code/527752-fa-instant-nuker.js
// @require     https://greasyfork.org/scripts/463464-fa-watches-favorites-viewer/code/463464-fa-watches-favorites-viewer.js
// @grant       GM_info
// @version     1.3.14
// @author      Midori Dragon
// @description Combines all Furaffinity Features Scripts into one
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/icon.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/543793-furaffinity-features
// @supportURL  https://greasyfork.org/scripts/543793-furaffinity-features/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
