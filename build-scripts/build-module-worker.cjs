// Worker script: builds a single module via Rollup in its own process.
// Usage: node build-module-worker.cjs <rollup-config-path> [--debug]

const rollup = require('rollup');
const path = require('path');

async function build() {
    const args = process.argv.slice(2);
    const configPath = path.resolve(args[0]);
    const debug = args.includes('--debug');

    delete require.cache[configPath];
    const rollupConfig = require(configPath);
    const { output: outputOptions, ...inputOptions } = rollupConfig;
    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(debug ? { sourcemap: 'inline', ...outputOptions } : outputOptions);
    await bundle.close();
}

build()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
