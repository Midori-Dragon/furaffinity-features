const rollup = require('rollup');
const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { extractRequiresFromBanner, buildDependencyGraph, computeBuildLevels } = require('./module-resolver.cjs');

const srcRoot = path.resolve(__dirname, '..', 'src');
const workerScript = path.join(__dirname, 'build-module-worker.cjs');

// Promisify filesystem functions for cleaner async/await usage
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const hashIncludeFileTypes = ['ts', 'tsx', 'js', 'jsx', 'cjs', 'css', 'html'];

// Helper function to build a module using Rollup (in-process, used for the main module)
async function buildModule(rollupConfigPath, debug = false) {
    const resolvedPath = path.resolve(rollupConfigPath);
    // Clear require cache so rebuilds always pick up the latest config
    delete require.cache[resolvedPath];
    const rollupConfig = require(resolvedPath);
    const { output: outputOptions, ...inputOptions } = rollupConfig;
    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(debug ? { sourcemap: 'inline', ...outputOptions } : outputOptions);
    await bundle.close();
    const outputFile = path.resolve(outputOptions.file);
    return { outputPath: path.dirname(outputFile), outputFile };
}

// Build a module in a separate Node.js process for true CPU parallelism
function buildModuleInProcess(configPath, debug = false) {
    return new Promise((resolve, reject) => {
        const args = [workerScript, configPath];
        if (debug) args.push('--debug');
        execFile(process.execPath, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (stderr) process.stderr.write(stderr);
            if (error) reject(error);
            else resolve();
        });
    });
}

// Extract dependencies directly from a rollup config's banner string — no build required
function extractDependenciesFromConfig(rollupConfigPath) {
    const resolvedPath = path.resolve(rollupConfigPath);
    delete require.cache[resolvedPath];
    const rollupConfig = require(resolvedPath);
    const banner = rollupConfig.output?.banner ?? '';
    return extractRequiresFromBanner(banner);
}

// Calculate hash of a directory recursively
async function calculateDirectoryHash(directory) {
    const hash = crypto.createHash('sha256');

    async function processDirectory(dir) {
        const files = await readdir(dir);

        // Sort files for consistent hash
        for (const file of files.sort()) {
            const fullPath = path.join(dir, file);
            const stats = await stat(fullPath);

            if (stats.isDirectory()) {
                // Skip node_modules and dist directories
                if (file !== 'node_modules' && file !== 'dist') {
                    await processDirectory(fullPath);
                }
            } else {
                // Only hash source files
                if (hashIncludeFileTypes.includes(file.split('.').pop())) {
                    const content = await readFile(fullPath);
                    hash.update(`${fullPath}:${content}`);
                }
            }
        }
    }

    await processDirectory(directory);
    return hash.digest('hex');
}

// Check if dependency needs rebuilding, using a precomputed hash
function needsRebuilding(precomputedHash, buildPath, debug = false) {
    const hashFile = path.join(path.dirname(buildPath), debug ? '.build-hash-debug' : '.build-hash');
    try {
        if (fs.existsSync(buildPath) && fs.existsSync(hashFile)) {
            const savedHash = fs.readFileSync(hashFile, 'utf-8');
            return precomputedHash !== savedHash;
        }
        return true;
    } catch (error) {
        return true;
    }
}

// Save build hash (reuses precomputed hash — no recalculation)
async function saveBuildHash(precomputedHash, buildPath, debug = false) {
    const hashFile = path.join(path.dirname(buildPath), debug ? '.build-hash-debug' : '.build-hash');
    await writeFile(hashFile, precomputedHash);
}

// Build dependency modules in parallel waves (by topological level)
async function buildDependenciesParallel(graph, levels, rebuild = false, debug = false) {
    // Step 1: Hash all module directories in parallel upfront
    console.log(`${colors.cyan}Hashing ${graph.size} module directories...${colors.reset}`);
    const hashStart = Date.now();
    const hashMap = new Map();
    await Promise.all(
        Array.from(graph.values()).map(async (node) => {
            const hash = await calculateDirectoryHash(node.moduleDir);
            hashMap.set(node.moduleDir, hash);
        })
    );
    console.log(`   ${colors.green}✓ Hashing complete (${((Date.now() - hashStart) / 1000).toFixed(2)}s)${colors.reset}\n`);

    // Step 2: Build each level in parallel
    for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        const moduleNames = level.map(n => n.moduleName).join(', ');
        console.log(`${colors.cyan}Building level ${i} (${level.length} modules): ${colors.blue}${moduleNames}${colors.reset}`);
        const levelStart = Date.now();

        await Promise.all(level.map(async (node) => {
            const { moduleName, configPath, buildPath, moduleDir } = node;
            const precomputedHash = hashMap.get(moduleDir);

            // Check if rebuild is needed
            let shouldRebuild = rebuild || needsRebuilding(precomputedHash, buildPath, debug);

            if (!shouldRebuild && fs.existsSync(buildPath)) {
                console.log(`   ${colors.green}✓ Using cached build for ${moduleName}${colors.reset}`);
            } else {
                try {
                    console.log(`   ${colors.cyan}Building ${colors.blue}${moduleName}${colors.reset}`);
                    const buildStart = Date.now();
                    await buildModuleInProcess(configPath, debug);
                    await saveBuildHash(precomputedHash, buildPath, debug);
                    console.log(`   ${colors.green}✓ Successfully built ${moduleName} (${((Date.now() - buildStart) / 1000).toFixed(2)}s)${colors.reset}`);
                } catch (error) {
                    console.error(`${colors.red}✗ Error building ${moduleName}:${colors.reset}`, error);
                }
            }
        }));

        console.log(`   ${colors.green}✓ Level ${i} complete (${((Date.now() - levelStart) / 1000).toFixed(2)}s)${colors.reset}\n`);
    }
}



async function emptyDir(dir) {
    if (fs.existsSync(dir)) {
        // Delete the contents rather than the directory itself.
        // Removing the directory node causes EPERM on Windows when VS Code has it open in the explorer.
        for (const entry of fs.readdirSync(dir)) {
            fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
        }
    }
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   ${colors.green}✓ Cleared '${path.basename(dir)}' folder successfully${colors.reset}\n`);
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error(`${colors.red}✗ Usage: node build-with-deps.cjs <path_to_rollup_config>${colors.reset}`);
        process.exit(1);
    }

    let rebuild = false;
    if (args.includes('--rebuild') || args.includes('-r')) {
        rebuild = true;
    }

    // --debug: include inline sourcemaps (for local development). Omit for release builds.
    const debug = args.includes('--debug');
    if (debug) {
        console.log(`${colors.yellow}Debug mode: inline sourcemaps enabled${colors.reset}`);
    }

    // Optional --deps-from <path>: read @requires for dep building from a different config.
    // Used when the main config (e.g. Furaffinity-Features-Browser) has no @requires in its banner.
    let depsConfigPath;
    const depsFromIdx = args.indexOf('--deps-from');
    if (depsFromIdx !== -1 && args[depsFromIdx + 1]) {
        depsConfigPath = args[depsFromIdx + 1];
    }

    const rollupConfigPath = args[0];
    const distFolder = path.resolve(__dirname, '..', 'dist');
    const outputPath = path.join(distFolder, 'furaffinity-features.user.js');

    try {
        const moduleName = path.basename(path.dirname(rollupConfigPath));

        // Step 1: Build the full dependency graph from config banners (no compilation)
        const depsSource = depsConfigPath ?? rollupConfigPath;
        console.log(`${colors.cyan}Building dependency graph from ${path.basename(path.dirname(depsSource))} config...${colors.reset}`);
        const topLevelDeps = extractDependenciesFromConfig(depsSource);
        const graph = buildDependencyGraph(topLevelDeps, srcRoot);
        const levels = computeBuildLevels(graph);
        console.log(`   ${colors.green}✓ Found ${graph.size} dependencies in ${levels.length} levels${colors.reset}\n`);

        // Step 2: Build each dependency level in parallel (hash-cached)
        // These individual bundles are used for GreasyFork distribution
        console.log(`${colors.cyan}Building dependencies in parallel waves...${colors.reset}\n`);
        await buildDependenciesParallel(graph, levels, rebuild, debug);

        // Step 3: Build the main module last — single Rollup pass over all source files
        // Rollup deduplicates shared code (Logger etc.) automatically since it sees the full import graph
        console.log(`\n${colors.cyan}Building ${moduleName} (single-pass bundle)...${colors.reset}`);
        const stats = await buildModule(rollupConfigPath, debug);
        const mainBuildFilePath = stats.outputFile;
        console.log(`   ${colors.green}✓ ${moduleName} built successfully${colors.reset}\n`);

        // Step 4: Copy the completed single-pass bundle to the top-level dist folder
        console.log(`${colors.cyan}Clearing dist folder...${colors.reset}`);
        await emptyDir(distFolder);

        console.log(`${colors.cyan}Copying bundle to dist...${colors.reset}`);
        fs.copyFileSync(mainBuildFilePath, outputPath);

        const statsFinal = fs.statSync(outputPath);
        const fileSize = (statsFinal.size / 1024).toFixed(2) + ' KB';
        console.log(`\n${colors.green}✓ Feature build successfully!${colors.reset}`);
        console.log(`${colors.blue}Final size: ${colors.reset}${fileSize}\n`);
        process.exit(0);
    } catch (error) {
        console.error(`${colors.red}✗ Build failed:${colors.reset}`, error);
        process.exit(1);
    }
}

main();
