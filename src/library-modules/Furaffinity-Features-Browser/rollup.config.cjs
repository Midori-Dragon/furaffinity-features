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
// @require     https://update.greasyfork.org/scripts/525666/1549449/Furaffinity-Prototype-Extensions.js
// @require     https://update.greasyfork.org/scripts/458971/0000000/FA-Embedded-Image-Viewer.js
// @require     https://update.greasyfork.org/scripts/457759/0000000/FA-Webcomic-Auto-Loader.js
// @require     https://update.greasyfork.org/scripts/462632/0000000/FA-Infini-Gallery.js
// @require     https://update.greasyfork.org/scripts/527752/0000000/FA-Instant-Nuker.js
// @require     https://update.greasyfork.org/scripts/463464/0000000/FA-Watches-Favorites-Viewer.js
// @grant       GM_info
// @version     1.2.13
// @author      Midori Dragon
// @description Browser Extension for Furaffinity Features
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
