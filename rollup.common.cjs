const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const postcss = require('rollup-plugin-postcss');
const path = require('path');

module.exports = {
    onLog(level, log, handler) {
        // Suppress circular dependency warnings and IIFE export name warnings —
        // both are expected and harmless for this userscript build setup.
        if (log.code === 'CIRCULAR_DEPENDENCY') return;
        if (log.code === 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') return;
        handler(level, log);
    },
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        typescript({ tsconfig: path.resolve(process.cwd(), 'tsconfig.json') }),
        postcss({ inject: true }),
        {
            // Strip ESLint directive comments from the final bundle.
            // Matches both line-style (// eslint-...) and block-style (/* eslint-... */) directives.
            name: 'strip-eslint-comments',
            renderChunk(code) {
                return code
                    .replace(/\/\*\s*eslint-[\s\S]*?\*\//g, '')     // /* eslint-... */
                    .replace(/^\s*\/\/\s*eslint-.*$/gm, '')         // // eslint-...
                    .replace(/\n{3,}/g, '\n\n');                    // collapse extra blank lines left behind
            },
        },
    ],
};
