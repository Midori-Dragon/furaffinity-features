const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        Furaffinity-Custom-Pages
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     1.2.5
// @author      Midori Dragon
// @description Library to create Custom pages on Furaffinitiy
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/fa_logo.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/476762-furaffinity-custom-pages
// @supportURL  https://greasyfork.org/scripts/476762-furaffinity-custom-pages/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
