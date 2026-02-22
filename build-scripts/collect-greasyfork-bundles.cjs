'use strict';

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const nameRegex = /@name\s+(.+)/;
const srcRoot = path.resolve(__dirname, '..', 'src');
const outDir = path.resolve(__dirname, '..', 'greasyfork-dist');

if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir);

let count = 0;

for (const searchDir of ['library-modules', 'feature-modules']) {
    const dir = path.join(srcRoot, searchDir);
    if (!fs.existsSync(dir)) continue;

    for (const moduleName of fs.readdirSync(dir)) {
        const bundlePath = path.join(dir, moduleName, 'dist', 'bundle.user.js');
        if (!fs.existsSync(bundlePath)) continue;

        const content = fs.readFileSync(bundlePath, 'utf-8');
        const nameMatch = content.match(nameRegex);

        if (!nameMatch) {
            console.warn(`${colors.yellow}⚠ No @name found in ${bundlePath}, skipping.${colors.reset}`);
            continue;
        }

        const name = nameMatch[1].trim();
        const outFile = path.join(outDir, `${name}.user.js`);
        fs.copyFileSync(bundlePath, outFile);
        console.log(`${colors.green}✓ ${colors.blue}${name}.user.js${colors.reset}`);
        count++;
    }
}

console.log(`\n${colors.green}✓ Collected ${count} bundles into greasyfork-dist/${colors.reset}`);
