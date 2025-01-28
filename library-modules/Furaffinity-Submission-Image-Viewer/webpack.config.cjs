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
// @name        Furaffinity-Submission-Image-Viewer
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.1.0
// @author      Midori Dragon
// @description Library for creating custom image elements on Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
