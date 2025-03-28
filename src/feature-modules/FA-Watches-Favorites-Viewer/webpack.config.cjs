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
// @name        FA Watches Favorites Viewer
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://update.greasyfork.org/scripts/525666/1549449/Furaffinity-Prototype-Extensions.js
// @require     https://update.greasyfork.org/scripts/483952/1549453/Furaffinity-Request-Helper.js
// @require     https://update.greasyfork.org/scripts/485827/1549457/Furaffinity-Match-List.js
// @require     https://update.greasyfork.org/scripts/528997/1549467/Furaffinity-Message-Box.js
// @require     https://update.greasyfork.org/scripts/476762/1549463/Furaffinity-Custom-Pages.js
// @require     https://update.greasyfork.org/scripts/475041/1550020/Furaffinity-Custom-Settings.js
// @grant       GM_info
// @version     3.0.3
// @author      Midori Dragon
// @description Scans the Favorites of your Watches for new Favorites and shows a Button to view these (if any where found). (Works like Submission Page)
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/463464-fa-watches-favorites-viewer
// @supportURL  https://greasyfork.org/scripts/463464-fa-watches-favorites-viewer/feedback
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
