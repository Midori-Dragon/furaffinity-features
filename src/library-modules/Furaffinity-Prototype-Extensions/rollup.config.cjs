const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        Furaffinity-Prototype-Extensions
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.0.1
// @author      Midori Dragon
// @description Library to hold common prototype extensions for your Furaffinity Script
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions
// @supportURL  https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/feedback
// ==/UserScript==
// jshint esversion: 8`,
    },
    ...common,
};
