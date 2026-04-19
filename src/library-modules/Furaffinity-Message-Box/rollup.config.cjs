const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        Furaffinity-Message-Box
// @namespace   Violentmonkey Scripts
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @grant       GM_info
// @version     1.0.6
// @author      Midori Dragon
// @description Library to hold MessageBox functions for Furaffinity
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/fa_logo.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/528997-furaffinity-message-box
// @supportURL  https://greasyfork.org/scripts/528997-furaffinity-message-box/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
