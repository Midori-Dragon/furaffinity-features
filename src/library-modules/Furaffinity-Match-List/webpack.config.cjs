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
// @name        Furaffinity-Match-List
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.1.2
// @author      Midori Dragon
// @description Library to create a matchlist for your Furaffinity Script
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/485827-furaffinity-match-list
// @supportURL  https://greasyfork.org/scripts/485827-furaffinity-match-list/feedback
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
