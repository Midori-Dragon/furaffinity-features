const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        Furaffinity-Loading-Animations
// @namespace   Violentmonkey Scripts
// @require     https://greasyfork.org/scripts/525666-furaffinity-prototype-extensions/code/525666-furaffinity-prototype-extensions.js
// @grant       none
// @version     1.2.4
// @author      Midori Dragon
// @description Library for creating different loading animations on Furaffinity
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/fa_logo.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/485153-furaffinity-loading-animations
// @supportURL  https://greasyfork.org/scripts/485153-furaffinity-loading-animations/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
