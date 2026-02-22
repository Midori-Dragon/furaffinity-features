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
// @version     1.3.0
// @author      Midori Dragon
// @description Browser Extension for Furaffinity Features
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
