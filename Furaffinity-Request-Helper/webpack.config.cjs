const { merge } = require('webpack-merge');
const common = require('../webpack.common.cjs');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    entry: './Furaffinity-Request-Helper/src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.user.js',
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `
// ==UserScript==
// @name        Furaffinity-Request-Helper
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     1.2.0
// @author      Midori Dragon
// @description Library to simplify requests to Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
