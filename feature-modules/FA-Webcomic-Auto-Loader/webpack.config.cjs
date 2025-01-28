const { merge } = require('webpack-merge');
const common = require('../../webpack.common.cjs');
const webpack = require('webpack');
const path = require('path');

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
// @name        FA Webcomic Auto Loader
// @namespace   Violentmonkey Scripts
// @match       *://*.furaffinity.net/*
// @require     https://update.greasyfork.org/scripts/000000/0000000/Furaffinity-Prototype-Extensions.js
// @require     https://update.greasyfork.org/scripts/483952/1478384/Furaffinity-Request-Helper.js
// @require     https://update.greasyfork.org/scripts/485827/1318253/Furaffinity-Match-List.js
// @require     https://update.greasyfork.org/scripts/485153/1316289/Furaffinity-Loading-Animations.js
// @require     https://update.greasyfork.org/scripts/475041/1267274/Furaffinity-Custom-Settings.js
// @grant       none
// @version     2.1.0
// @author      Midori Dragon
// @description Gives you the option to load all the subsequent comic pages on a FurAffinity comic page automatically. Even for pages without given Links
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
