const { merge } = require('webpack-merge');
const common = require('../webpack.common.cjs');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: './FA-Infini-Gallery/src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.user.js',
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `
// ==UserScript==
// @name        FA Infini-Gallery
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://update.greasyfork.org/scripts/485827/1326313/Furaffinity-Request-Helper.js
// @require     https://update.greasyfork.org/scripts/485827/1326313/Furaffinity-Match-List.js
// @require     https://update.greasyfork.org/scripts/485153/1316289/Furaffinity-Loading-Animations.js
// @require     https://update.greasyfork.org/scripts/475041/1267274/Furaffinity-Custom-Settings.js
// @grant       GM_info
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @version     2.1.0
// @author      Midori Dragon
// @description Automatically loads the next page of the gallery as you reach the bottom
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
