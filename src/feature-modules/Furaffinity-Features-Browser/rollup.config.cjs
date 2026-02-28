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
// @grant       GM_info
// @version     1.3.7
// @author      Midori Dragon
// @description Combines all Furaffinity Features Scripts into one
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/543793-furaffinity-features
// @supportURL  https://greasyfork.org/scripts/543793-furaffinity-features/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
