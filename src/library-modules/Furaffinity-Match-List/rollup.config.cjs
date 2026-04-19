const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        Furaffinity-Match-List
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.1.5
// @author      Midori Dragon
// @description Library to create a matchlist for your Furaffinity Script
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/fa_logo.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/485827-furaffinity-match-list
// @supportURL  https://greasyfork.org/scripts/485827-furaffinity-match-list/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
