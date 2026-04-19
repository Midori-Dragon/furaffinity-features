const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        Furaffinity-Submission-Image-Viewer
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.3.1
// @author      Midori Dragon
// @description Library for creating custom image elements on Furaffinity
// @icon        https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/fa_logo.svg
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer
// @supportURL  https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer/feedback
// ==/UserScript==
// jshint esversion: 11`,
    },
    ...common,
};
