const { merge } = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const common = require(path.resolve(process.cwd(), 'webpack.common.cjs'));

module.exports = merge(common, {
    entry: path.resolve(__dirname, 'src/index.ts'),
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
// @require     https://update.greasyfork.org/scripts/525666/1530872/Furaffinity-Prototype-Extensions.js
// @require     https://update.greasyfork.org/scripts/483952/1530883/Furaffinity-Request-Helper.js
// @require     https://update.greasyfork.org/scripts/492931/1530871/Furaffinity-Submission-Image-Viewer.js
// @require     https://update.greasyfork.org/scripts/485827/1530881/Furaffinity-Match-List.js
// @require     https://update.greasyfork.org/scripts/485153/1530882/Furaffinity-Loading-Animations.js
// @require     https://update.greasyfork.org/scripts/476762/1530884/Furaffinity-Custom-Pages.js
// @require     https://update.greasyfork.org/scripts/475041/1530885/Furaffinity-Custom-Settings.js
// @grant       GM_info
// @version     2.4.0
// @author      Midori Dragon
// @description Embeds the clicked Image on the Current Site, so you can view it without loading the submission Page
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
