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

// Extract dependencies from the banner of a build file
async function extractDependencies(buildFilePath, moduleName = 'bundle.user.js') {
    console.log(`Extracting dependencies from: ${moduleName}`);
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
        console.log(`   Found dependency: ${dep}`);
        dependencies.push(dep);
    }

    return { banner, dependencies };
}

// Recursively resolve dependencies and ensure correct order
async function resolveDependencies(dependencies, resolved = new Set(), order = []) {
    for (const dep of dependencies) {
        const moduleName = path.basename(dep, '.js');
        const modulePath = `./${moduleName}/dist/bundle.user.js`;

        if (resolved.has(modulePath)) {
            console.log(`Skipping already resolved dependency: ${moduleName}\n`);
            continue;
        }

        if (fs.existsSync(modulePath)) {
            resolved.add(modulePath);
            const { dependencies: subDeps } = await extractDependencies(modulePath, moduleName);
            if (subDeps.length > 0) {
                console.log(`  Found nested dependencies for ${moduleName}:`);
                subDeps.forEach(subDep => console.log(`    - ${subDep}`));
            }
            await resolveDependencies(subDeps, resolved, order);
            order.push(modulePath);
            console.log(`   Added ${moduleName} to build order`);
        } else {
            console.warn(`  Warning: Dependency not found: ${dep}`);
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
    console.log(`Processing file: ${path.basename(path.dirname(path.dirname(filePath)))}`);
    const content = await readFile(filePath, 'utf-8');
    const bannerMatch = content.match(bannerRegex);

    if (!bannerMatch) {
        console.warn(`  No banner found in ${filePath}`);
        return { name: 'Unknown', version: '0.0.0', content };
    }

    const banner = bannerMatch[0];
    const nameMatch = banner.match(nameRegex);
    const versionMatch = banner.match(versionRegex);

    const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
    const version = versionMatch ? versionMatch[1].trim() : '0.0.0';
    console.log(`   Extracted metadata: ${name} v${version}`);

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
        console.log('Processing main script banner');
        const bannerLines = bannerMatch[0].split('\n').filter(line => !line.trim().startsWith('// @require'));
        originalBanner = bannerLines.join('\n') + '\n\n';
    }

    console.log('Processing all files in order:');
    const processedFiles = await Promise.all(filePaths.map(processFile));
    
    console.log('Combining files:');
    processedFiles.forEach(({ name, version }) => {
        console.log(`   Adding: ${name} v${version}`);
    });
    
    const combinedContent = originalBanner + processedFiles.map(({ name, version, content }) => `// ${name} v${version}\n${content}`).join('\n\n');
    
    await writeFile(outputPath, combinedContent);
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node build-with-deps.cjs <path_to_webpack_config>');
        process.exit(1);
    }

    const webpackConfigPath = args[0];
    const distFolder = path.resolve(__dirname, '..', 'dist');
    const outputPath = path.join(distFolder, 'bundle.user.js');

    try {
        console.log('Building main module...');
        const stats = await buildModule(webpackConfigPath);

        const mainBuildFilePath = stats.outputPath + '\\bundle.user.js';
        console.log(`Main build file created at: ${mainBuildFilePath}\n`);

        console.log('Extracting dependencies...\n');
        const { banner, dependencies } = await extractDependencies(mainBuildFilePath, path.basename(path.dirname(path.dirname(mainBuildFilePath))));

        console.log('\nResolving dependencies...');
        const orderedDependencies = await resolveDependencies(dependencies);

        console.log('\nCombining files...');
        await combineFiles([...orderedDependencies, mainBuildFilePath], outputPath);

        console.log(`\nFinal combined file created at: ${outputPath}\n`);
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

main();
