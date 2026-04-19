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
        console.log(`${colors.yellow}⚠ Warning: 'manifest.json' not found. Using 'manifest-template.json'${colors.reset}`);
        const manifestTemplatePath = path.resolve('./manifest-template.json');
        if (fs.existsSync(manifestTemplatePath)) {
            await copyFile(manifestTemplatePath, manifestDestPath);
        } else {
            console.log(`${colors.yellow}⚠ Warning: 'manifest-template.json' not found${colors.reset}`);
        }
    }

    // Copy only icons listed in manifest
    const manifest = JSON.parse(fs.readFileSync(manifestDestPath, 'utf8'));
    const manifestIcons = Object.values(manifest.icons ?? {});
    if (manifestIcons.length > 0) {
        for (const iconRelPath of manifestIcons) {
            const iconSrcPath = path.resolve('./assets', iconRelPath);
            const iconDestPath = path.join(distPath, iconRelPath);
            if (fs.existsSync(iconSrcPath)) {
                await mkdir(path.dirname(iconDestPath), { recursive: true });
                await copyFile(iconSrcPath, iconDestPath);
            } else {
                console.log(`${colors.yellow}⚠ Warning: icon '${iconRelPath}' listed in manifest not found${colors.reset}`);
            }
        }
    }
}

try {
    copyExtensionFiles();
} catch (error) {
    console.error(`${colors.red}✗ Failed to copy extension resources: ${error}${colors.reset}`);
    process.exit(1);
}
