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
// @name        Furaffinity-Loading-Animations
// @namespace   Violentmonkey Scripts
// @require     https://update.greasyfork.org/scripts/525666/1549449/Furaffinity-Prototype-Extensions.js
// @grant       none
// @version     1.2.1
// @author      Midori Dragon
// @description Library for creating different loading animations on Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/485153-furaffinity-loading-animations
// @supportURL  https://greasyfork.org/scripts/485153-furaffinity-loading-animations/feedback
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
