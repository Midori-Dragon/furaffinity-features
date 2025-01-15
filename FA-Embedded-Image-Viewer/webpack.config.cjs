const { merge } = require('webpack-merge');
const common = require('../webpack.common.cjs');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: './FA-Embedded-Image-Viewer/src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.user.js',
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `
// ==UserScript==
// @name        FA Embedded Image Viewer
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://update.greasyfork.org/scripts/475041/1267274/Furaffinity-Custom-Settings.js
// @require     https://update.greasyfork.org/scripts/483952/1486330/Furaffinity-Request-Helper.js
// @require     https://update.greasyfork.org/scripts/485153/1316289/Furaffinity-Loading-Animations.js
// @require     https://update.greasyfork.org/scripts/476762/1318215/Furaffinity-Custom-Pages.js
// @require     https://update.greasyfork.org/scripts/485827/1326313/Furaffinity-Match-List.js
// @require     https://update.greasyfork.org/scripts/492931/1363921/Furaffinity-Submission-Image-Viewer.js
// @grant       GM_info
// @version     2.4.0
// @author      Midori Dragon
// @description Embeds the clicked Image on the Current Site, so you can view it without loading the submission Page
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png?v2
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
