const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify filesystem functions for cleaner async/await usage
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
// const exec = util.promisify(require('child_process').exec);

// Helper function to build a module using Webpack
async function buildModule(webpackConfigPath) {
    const webpackConfig = require(path.resolve(webpackConfigPath));
    const compiler = webpack(webpackConfig);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err || stats.hasErrors()) {
                reject(err || stats.toJson().errors);
                return;
            }
            resolve(stats.toJson());
        });
    });
}

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

// Extract dependencies from the banner of a build file
async function extractDependencies(buildFilePath, moduleName = 'bundle.user.js') {
    console.log(`   ${colors.cyan}Extracting dependencies from: ${colors.blue}${moduleName}${colors.reset}`);
    const content = await readFile(buildFilePath, 'utf-8');
    const bannerStart = content.indexOf('// ==UserScript==');
    const bannerEnd = content.indexOf('// ==/UserScript==');

    if (bannerStart === -1 || bannerEnd === -1) {
        throw new Error('No valid UserScript banner found in the build file.');
    }

    const banner = content.substring(bannerStart, bannerEnd + '// ==/UserScript=='.length);
    const requireRegex = /@require\s+([^\s]+)/g;

    const dependencies = [];
    let match;
    while ((match = requireRegex.exec(banner)) !== null) {
        const dep = match[1];
        console.log(`   ${colors.blue}Found dependency: ${dep}${colors.reset}`);
        dependencies.push(dep);
    }

    return { banner, dependencies };
}

// Recursively resolve dependencies and ensure correct order
async function resolveDependencies(dependencies, resolved = new Set(), order = []) {
    for (const dep of dependencies) {
        const moduleName = path.basename(dep, '.js');
        const modulePath = `./${moduleName}/dist/bundle.user.js`;
        const webpackConfigPath = `./${moduleName}/webpack.config.cjs`;

        if (resolved.has(modulePath)) {
            console.log(`${colors.cyan}Skipping already resolved dependency: ${colors.blue}${moduleName}${colors.reset}\n`);
            continue;
        }

        if (fs.existsSync(webpackConfigPath)) {
            console.log(`${colors.cyan}Resolving dependency: ${colors.blue}${moduleName}${colors.reset}`);
            try {
                console.log(`   ${colors.cyan}Building ${colors.blue}${moduleName}${colors.reset}`);
                await buildModule(webpackConfigPath);
                console.log(`   ${colors.green}Successfully built ${moduleName}${colors.reset}`);
            } catch (error) {
                console.error(`${colors.red}Error building ${moduleName}:${colors.reset}`, error);
                continue;
            }

            if (fs.existsSync(modulePath)) {
                resolved.add(modulePath);
                const { dependencies: subDeps } = await extractDependencies(modulePath, moduleName);
                if (subDeps.length > 0) {
                    console.log(`  ${colors.cyan}Found nested dependencies for ${colors.blue}${moduleName}:${colors.reset}`);
                    subDeps.forEach(subDep => console.log(`    ${colors.blue}- ${subDep}${colors.reset}`));
                }
                await resolveDependencies(subDeps, resolved, order);
                order.push(modulePath);
                console.log(`   ${colors.green}Added ${moduleName} to build order${colors.reset}`);
            } else {
                console.warn(`  ${colors.yellow}Warning: Build file not found after building: ${modulePath}${colors.reset}`);
            }
        } else {
            console.warn(`  ${colors.yellow}Warning: Webpack config not found for dependency: ${webpackConfigPath}${colors.reset}`);
        }
    }

    return order;
}

// Regex to extract name and version from banner
const nameRegex = /@name\s+(.+)/;
const versionRegex = /@version\s+(.+)/;
const bannerRegex = /\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/;

// Process a single file to extract name, version, and content without banner
async function processFile(filePath) {
    console.log(`${colors.cyan}Processing file: ${colors.blue}${path.basename(path.dirname(path.dirname(filePath)))}${colors.reset}`);
    const content = await readFile(filePath, 'utf-8');
    const bannerMatch = content.match(bannerRegex);

    if (!bannerMatch) {
        console.warn(`  ${colors.yellow}No banner found in ${filePath}${colors.reset}`);
        return { name: 'Unknown', version: '0.0.0', content };
    }

    const banner = bannerMatch[0];
    const nameMatch = banner.match(nameRegex);
    const versionMatch = banner.match(versionRegex);

    const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
    const version = versionMatch ? versionMatch[1].trim() : '0.0.0';
    console.log(`   ${colors.green}Extracted metadata: ${colors.blue}${name} v${version}${colors.reset}`);

    // Remove the banner from the content
    const cleanedContent = content.replace(bannerRegex, '').trim();

    return { name, version, content: cleanedContent };
}

// Combine all build files into a single output
async function combineFiles(filePaths, outputPath) {
    // Get the original banner from the main build file and remove @require statements
    const mainFileContent = await readFile(filePaths[filePaths.length - 1], 'utf-8');
    const bannerMatch = mainFileContent.match(bannerRegex);
    let originalBanner = '';

    if (bannerMatch) {
        console.log(`${colors.cyan}Processing main script banner${colors.reset}`);
        const bannerLines = bannerMatch[0].split('\n').filter(line => !line.trim().startsWith('// @require'));
        originalBanner = bannerLines.join('\n') + '\n\n';
    }

    console.log(`${colors.cyan}Processing all files in order:${colors.reset}`);
    const processedFiles = await Promise.all(filePaths.map(processFile));

    console.log(`\n${colors.cyan}Writing files:${colors.reset}`);
    processedFiles.forEach(({ name, version }) => {
        console.log(`   ${colors.blue}Adding: ${name} v${version}${colors.reset}`);
    });

    const combinedContent = originalBanner + processedFiles.map(({ name, version, content }) => `// ${name} v${version}\n${content}`).join('\n\n');

    await writeFile(outputPath, combinedContent);
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error(`${colors.red}Usage: node build-with-deps.cjs <path_to_webpack_config>${colors.reset}`);
        process.exit(1);
    }

    const webpackConfigPath = args[0];
    const distFolder = path.resolve(__dirname, '..', 'dist');
    const outputPath = path.join(distFolder, 'bundle.user.js');

    try {
        const moduleName = path.basename(path.dirname(webpackConfigPath));
        console.log(`${colors.cyan}Building ${moduleName}...${colors.reset}`);
        const stats = await buildModule(webpackConfigPath);

        const mainBuildFilePath = stats.outputPath + '\\bundle.user.js';
        console.log(`   ${colors.green}${moduleName} build successfully${colors.reset}\n`);

        console.log(`${colors.cyan}Extracting dependencies from ${moduleName}...${colors.reset}`);
        const { banner, dependencies } = await extractDependencies(mainBuildFilePath, moduleName);

        console.log(`\n${colors.cyan}Resolving dependencies...${colors.reset}`);
        const orderedDependencies = await resolveDependencies(dependencies);

        console.log(`\n${colors.cyan}Combining files...${colors.reset}`);
        await combineFiles([...orderedDependencies, mainBuildFilePath], outputPath);

        console.log(`\n${colors.green}Final combined file created at: ${outputPath}${colors.reset}\n`);
    } catch (error) {
        console.error(`${colors.red}Build failed:${colors.reset}`, error);
        process.exit(1);
    }
}

main();
