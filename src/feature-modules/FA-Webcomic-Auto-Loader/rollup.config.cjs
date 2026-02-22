const path = require('path');
const common = require(path.resolve(process.cwd(), 'rollup.common.cjs'));

module.exports = {
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
        file: path.resolve(__dirname, 'dist/bundle.user.js'),
        format: 'iife',
        banner:
            `// ==UserScript==
// @name        FA Webcomic Auto Loader
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://update.greasyfork.org/scripts/525666/1549449/Furaffinity-Prototype-Extensions.js
// @require     https://update.greasyfork.org/scripts/483952/1672922/Furaffinity-Request-Helper.js
// @require     https://update.greasyfork.org/scripts/485827/1549457/Furaffinity-Match-List.js
// @require     https://update.greasyfork.org/scripts/485153/1549461/Furaffinity-Loading-Animations.js
// @require     https://update.greasyfork.org/scripts/475041/1617223/Furaffinity-Custom-Settings.js
// @grant       GM_info
// @version     2.2.8
// @author      Midori Dragon
// @description Gives you the option to load all the subsequent comic pages on a FurAffinity comic page automatically. Even for pages without given Links
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/457759-fa-webcomic-auto-loader
// @supportURL  https://greasyfork.org/scripts/457759-fa-webcomic-auto-loader/feedback
// ==/UserScript==
// jshint esversion: 8`,
    },
    ...common,
};
