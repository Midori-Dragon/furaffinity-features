const { merge } = require('webpack-merge');
const common = require('../webpack.common.cjs');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: './Furaffinity-Custom-Settings/src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.user.js',
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `
// ==UserScript==
// @name        Furaffinity-Custom-Settings
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     4.1.0
// @author      Midori Dragon
// @description Library to create Custom settings on Furaffinitiy
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
