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
    const manifestPath = path.resolve('./manifest.json');
    const manifestDestPath = path.join(distPath, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        await copyFile(manifestPath, manifestDestPath);
    } else {
        console.log(`${colors.yellow}Warning: 'manifest.json' not found. Using 'manifest-template.json'${colors.reset}`);
        const manifestTemplatePath = path.resolve('./manifest-template.json');
        if (fs.existsSync(manifestTemplatePath)) {
            await copyFile(manifestTemplatePath, manifestDestPath);
        } else {
            console.log(`${colors.yellow}Warning: 'manifest-template.json' not found${colors.reset}`);
        }
    }

    // Copy icons folder if it exists
    const iconsPath = path.resolve('./assets/icons');
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
