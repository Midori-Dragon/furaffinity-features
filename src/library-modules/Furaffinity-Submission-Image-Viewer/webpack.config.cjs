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
// @name        Furaffinity-Submission-Image-Viewer
// @namespace   Violentmonkey Scripts
// @grant       GM_info
// @version     1.1.1
// @author      Midori Dragon
// @description Library for creating custom image elements on Furaffinity
// @icon        https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png
// @license     MIT
// @homepageURL https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer
// @supportURL  https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer/feedback
// ==/UserScript==
// jshint esversion: 8
`,
            raw: true,
        }),
    ],
});
