const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const util = require("util");

// Promisify filesystem functions for cleaner async/await usage
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exec = util.promisify(require("child_process").exec);

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
async function extractDependencies(buildFilePath) {
    const content = await readFile(buildFilePath, "utf-8");
    const bannerStart = content.indexOf("// ==UserScript==");
    const bannerEnd = content.indexOf("// ==/UserScript==");

    if (bannerStart === -1 || bannerEnd === -1) {
        throw new Error("No valid UserScript banner found in the build file.");
    }

    const banner = content.substring(bannerStart, bannerEnd + "// ==/UserScript==".length);
    const requireRegex = /@require\s+([^\s]+)/g;

    const dependencies = [];
    let match;
    while ((match = requireRegex.exec(banner)) !== null) {
        dependencies.push(match[1]);
    }

    return { banner, dependencies };
}

// Recursively resolve dependencies and ensure correct order
async function resolveDependencies(dependencies, resolved = new Set(), order = []) {
    for (const dep of dependencies) {
        const moduleName = path.basename(dep, ".js");
        const modulePath = `./${moduleName}/dist/bundle.user.js`; // Adjust if your project uses different paths

        if (resolved.has(modulePath)) continue;

        if (fs.existsSync(modulePath)) {
            resolved.add(modulePath);
            const { dependencies: subDeps } = await extractDependencies(modulePath);
            await resolveDependencies(subDeps, resolved, order);
            order.push(modulePath);
        } else {
            console.warn(`Warning: Dependency not found: ${dep}`);
        }
    }

    return order;
}

// Combine all build files into a single output
async function combineFiles(filePaths, outputPath) {
    const contents = await Promise.all(filePaths.map(filePath => readFile(filePath, "utf-8")));
    await writeFile(outputPath, contents.join("\n"));
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: node build.js <path_to_webpack_config>");
        process.exit(1);
    }

    const webpackConfigPath = args[0];
    const distFolder = path.resolve(__dirname, '..', "dist");
    const outputPath = path.join(distFolder, "bundle.user.js");

    try {
        console.log("Building main module...");
        const stats = await buildModule(webpackConfigPath);

        const mainBuildFilePath = stats.outputPath + "/bundle.user.js";
        console.log(`Main build file created at: ${mainBuildFilePath}`);

        console.log("Extracting dependencies...");
        const { banner, dependencies } = await extractDependencies(mainBuildFilePath);

        console.log("Resolving dependencies...");
        const orderedDependencies = await resolveDependencies(dependencies);

        console.log("Combining files...");
        await combineFiles([...orderedDependencies, mainBuildFilePath], outputPath);

        console.log(`Final combined file created at: ${outputPath}`);
    } catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}

main();
