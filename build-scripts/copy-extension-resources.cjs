const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify filesystem functions for cleaner async/await usage
const copyFile = util.promisify(fs.copyFile);
const mkdir = util.promisify(fs.mkdir);

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

async function copyExtensionFiles() {
    const distPath = path.resolve('./dist');

    // Ensure dist directory exists
    await mkdir(distPath, { recursive: true });

    // Copy manifest.json
    const manifestPath = path.resolve('./manifest-template.json');
    if (fs.existsSync(manifestPath)) {
        const manifestDestPath = path.join(distPath, 'manifest.json');
        await copyFile(manifestPath, manifestDestPath);
    } else {
        console.log(`${colors.yellow}Warning: 'manifest-template.json' not found${colors.reset}`);
    }

    // Copy icons folder if it exists
    const iconsPath = path.resolve('./icons');
    if (fs.existsSync(iconsPath)) {
        const iconsDistPath = path.join(distPath, 'icons');
        await mkdir(iconsDistPath, { recursive: true });

        const icons = fs.readdirSync(iconsPath);
        for (const icon of icons) {
            const iconPath = path.join(iconsPath, icon);
            const iconDestPath = path.join(iconsDistPath, icon);
            await copyFile(iconPath, iconDestPath);
        }
    } else {
        console.log(`${colors.yellow}Warning: icons folder not found${colors.reset}`);
    }
}

copyExtensionFiles();
