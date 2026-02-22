const rollup = require('rollup');
const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');
const { moduleSlugFromUrl, findModuleDir, extractRequiresFromBanner } = require('./module-resolver.cjs');

const srcRoot = path.resolve(__dirname, '..', 'src');

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

// Helper function to build a module using Rollup
async function buildModule(rollupConfigPath) {
    const resolvedPath = path.resolve(rollupConfigPath);
    // Clear require cache so rebuilds always pick up the latest config
    delete require.cache[resolvedPath];
    const rollupConfig = require(resolvedPath);
    const { output: outputOptions, ...inputOptions } = rollupConfig;
    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(outputOptions);
    await bundle.close();
    const outputFile = path.resolve(outputOptions.file);
    return { outputPath: path.dirname(outputFile), outputFile };
}

// Extract dependencies from the banner of a built output file (used for recursive sub-dep resolution)
async function extractDependencies(buildFilePath, moduleName = 'bundle.user.js') {
    console.log(`   ${colors.cyan}Extracting dependencies from: ${colors.blue}${moduleName}${colors.reset}`);
    const content = await readFile(buildFilePath, 'utf-8');
    const dependencies = extractRequiresFromBanner(content);
    dependencies.forEach(dep => console.log(`   ${colors.blue}Found dependency: ${dep}${colors.reset}`));
    return { dependencies };
}

// Extract dependencies directly from a rollup config's banner string — no build required
function extractDependenciesFromConfig(rollupConfigPath) {
    const resolvedPath = path.resolve(rollupConfigPath);
    delete require.cache[resolvedPath];
    const rollupConfig = require(resolvedPath);
    const banner = rollupConfig.output?.banner ?? '';
    const dependencies = extractRequiresFromBanner(banner);
    console.log(`${colors.cyan}Dependencies from config banner:${colors.reset}`);
    dependencies.forEach(dep => console.log(`   ${colors.blue}${dep}${colors.reset}`));
    return { dependencies };
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

// Check if dependency needs rebuilding
async function needsRebuilding(modulePath, buildPath) {
    const hashFile = path.join(path.dirname(buildPath), '.build-hash');

    // Get current hash
    const currentHash = await calculateDirectoryHash(modulePath);

    try {
        // Check if build exists and has hash
        if (fs.existsSync(buildPath) && fs.existsSync(hashFile)) {
            const savedHash = await readFile(hashFile, 'utf-8');
            return currentHash !== savedHash;
        }
        return true;
    } catch (error) {
        console.warn(`  ${colors.yellow}⚠ Warning: Error reading build hash for ${path.basename(modulePath)}${colors.reset}`);
    }
}

// Save build hash
async function saveBuildHash(modulePath, buildPath) {
    const hash = await calculateDirectoryHash(modulePath);
    const hashFile = path.join(path.dirname(buildPath), '.build-hash');
    await writeFile(hashFile, hash);
}

// Recursively resolve dependencies and ensure correct order
async function resolveDependencies(dependencies, rebuild = false, resolved = new Set(), order = []) {
    for (const dep of dependencies) {
        const slug = moduleSlugFromUrl(dep);
        const moduleDir = findModuleDir(slug, srcRoot);

        if (!moduleDir) {
            console.warn(`  ${colors.yellow}⚠ Warning: Rollup config not found for dependency: ${slug}${colors.reset}`);
            continue;
        }

        const moduleName = path.basename(moduleDir);
        const configPath = path.join(moduleDir, 'rollup.config.cjs');
        const buildPath = path.join(moduleDir, 'dist/bundle.user.js');
        const modulePath = moduleDir;

        if (resolved.has(buildPath)) {
            console.log(`${colors.cyan}Skipping already resolved dependency: ${colors.blue}${moduleName}${colors.reset}\n`);
            continue;
        }

        if (!fs.existsSync(configPath)) {
            console.warn(`  ${colors.yellow}⚠ Warning: Rollup config not found for dependency: ${moduleName}${colors.reset}`);
            continue;
        }

        console.log(`${colors.cyan}Resolving dependency: ${colors.blue}${moduleName}${colors.reset}`);

        // Check if rebuild is needed
        let shouldRebuild = true;

        if (!rebuild) {
            shouldRebuild = await needsRebuilding(modulePath, buildPath);
        }

        if (!shouldRebuild && fs.existsSync(buildPath)) {
            console.log(`   ${colors.green}✓ Using cached build for ${moduleName}${colors.reset}`);
        } else {
            try {
                console.log(`   ${colors.cyan}Building ${colors.blue}${moduleName}${colors.reset}`);
                await buildModule(configPath);
                await saveBuildHash(modulePath, buildPath);
                console.log(`   ${colors.green}✓ Successfully built ${moduleName}${colors.reset}`);
            } catch (error) {
                console.error(`${colors.red}✗ Error building ${moduleName}:${colors.reset}`, error);
                continue;
            }
        }

        if (fs.existsSync(buildPath)) {
            resolved.add(buildPath);
            const { dependencies: subDeps } = await extractDependencies(buildPath, moduleName);
            if (subDeps.length > 0) {
                console.log(`  ${colors.cyan}Found nested dependencies for ${colors.blue}${moduleName}:${colors.reset}`);
                subDeps.forEach(subDep => console.log(`    ${colors.blue}- ${subDep}${colors.reset}`));
            }
            await resolveDependencies(subDeps, rebuild, resolved, order);
            order.push(buildPath);
            console.log(`   ${colors.green}✓ Added ${moduleName} to build order${colors.reset}`);
        } else {
            console.warn(`  ${colors.yellow}⚠ Warning: Build file not found after building: ${buildPath}${colors.reset}`);
        }
    }

    return order;
}



async function emptyDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
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

        // Step 1: Read dependency order — from --deps-from config if provided, otherwise from main config
        const depsSource = depsConfigPath ?? rollupConfigPath;
        console.log(`${colors.cyan}Reading dependency order from ${path.basename(path.dirname(depsSource))} config...${colors.reset}`);
        const { dependencies } = extractDependenciesFromConfig(depsSource);

        // Step 2: Build each dependency individually (hash-cached, bottom-up)
        // These individual bundles are used for GreasyFork distribution
        console.log(`\n${colors.cyan}Resolving and building dependencies...${colors.reset}`);
        await resolveDependencies(dependencies, rebuild);

        // Step 3: Build the main module last — single Rollup pass over all source files
        // Rollup deduplicates shared code (Logger etc.) automatically since it sees the full import graph
        console.log(`\n${colors.cyan}Building ${moduleName} (single-pass bundle)...${colors.reset}`);
        const stats = await buildModule(rollupConfigPath);
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
