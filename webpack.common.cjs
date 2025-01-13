const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: false,
                    format: {
                        comments: /@name|@namespace|@author|@license|@match|@exclude-match|@include|@exclude|@version|@description|@icon|@require|@resource|@run-at|@noframes|@grant|@inject-into|@downloadURL|@supportURL|@homepageURL|@unwrap|@top-level-await|jshint|UserScript/,
                        beautify: true,
                    },
                    keep_classnames: true,
                    keep_fnames: true,
                },
                extractComments: false,
                parallel: true,
            }),
        ],
    },
};
