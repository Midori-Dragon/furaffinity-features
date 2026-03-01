const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        FA Infini-Gallery
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @require     https://greasyfork.org/scripts/483952-furaffinity-request-helper/code/483952-furaffinity-request-helper.js
// @require     https://greasyfork.org/scripts/485827-furaffinity-match-list/code/485827-furaffinity-match-list.js
// @require     https://greasyfork.org/scripts/485153-furaffinity-loading-animations/code/485153-furaffinity-loading-animations.js
// @require     https://greasyfork.org/scripts/475041-furaffinity-custom-settings/code/475041-furaffinity-custom-settings.js
// @grant       GM_info
// @version     2.2.10
// @author      Midori Dragon
// @description Automatically loads the next page of the gallery as you reach the bottom
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/462632-fa-infini-gallery
// @supportURL  https://greasyfork.org/scripts/462632-fa-infini-gallery/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
