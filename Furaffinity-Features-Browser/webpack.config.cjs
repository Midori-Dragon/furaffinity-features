const { merge } = require('webpack-merge');
const common = require('../webpack.common.cjs');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: './Furaffinity-Features-Browser/src/index.ts',
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
// @require     https://update.greasyfork.org/scripts/000000/0000000/Furaffinity-Prototype-Extensions.js
// @require     https://update.greasyfork.org/scripts/000000/0000000/FA-Embedded-Image-Viewer.js
// @require     https://update.greasyfork.org/scripts/000000/0000000/FA-Webcomic-Auto-Loader.js
// @require     https://update.greasyfork.org/scripts/000000/0000000/FA-Infini-Gallery.js
// @grant       none
// @version     1.0.0
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
