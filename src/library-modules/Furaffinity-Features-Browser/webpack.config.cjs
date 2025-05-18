const { merge } = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const common = require(path.resolve(process.cwd(), 'webpack.common.cjs'));

module.exports = merge(common, {
    entry: path.resolve(__dirname, 'src/index.ts'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.user.js',
        library: {
            name: 'FuraffinityFeatures',
            type: 'window',
            export: 'default'
        },
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `
// ==UserScript==
// @name        Furaffinity-Features-Browser
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://update.greasyfork.org/scripts/525666/1530872/Furaffinity-Prototype-Extensions.js
// @require     https://update.greasyfork.org/scripts/458971/0000000/FA-Embedded-Image-Viewer.js
// @require     https://update.greasyfork.org/scripts/457759/0000000/FA-Webcomic-Auto-Loader.js
// @require     https://update.greasyfork.org/scripts/462632/0000000/FA-Infini-Gallery.js
// @require     https://update.greasyfork.org/scripts/527752/0000000/FA-Instant-Nuker.js
// @require     https://update.greasyfork.org/scripts/463464/0000000/FA-Watches-Favorites-Viewer.js
// @grant       GM_info
// @version     1.2.6
// @author      Midori Dragon
// @description Browser Extension for Furaffinity Features
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
