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
const homepageRegex = /@homepageURL\s+(https:\/\/greasyfork\.org\/scripts\/\S+)/;

// The combined entry module — its bundle provides the header; @requires are replaced with the full set
const COMBINED_MODULE = 'Furaffinity-Features';

const srcRoot = path.resolve(__dirname, '..', 'src');
const outDir = path.resolve(__dirname, '..', 'greasyfork-dist');

if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir);

let count = 0;
// Collect @require URLs in library-first, feature-second order for the combined script
const combinedRequires = [];

for (const searchDir of ['library-modules', 'feature-modules']) {
    const dir = path.join(srcRoot, searchDir);
    if (!fs.existsSync(dir)) continue;

    for (const moduleName of fs.readdirSync(dir)) {
        if (moduleName === COMBINED_MODULE) continue;

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

        // Build @require URL from @homepageURL: https://greasyfork.org/scripts/<id>-<slug>
        // → https://greasyfork.org/scripts/<id>-<slug>/code/<id>-<slug>.js
        const homepageMatch = content.match(homepageRegex);
        if (homepageMatch) {
            const base = homepageMatch[1].trim().replace(/\/$/, '');
            const slug = base.split('/scripts/')[1];
            combinedRequires.push(`https://greasyfork.org/scripts/${slug}/code/${slug}.js`);
        }
    }
}

// Generate the combined Furaffinity-Features.user.js from its built bundle,
// replacing the @require block with the full collected set.
const combinedBundlePath = path.join(srcRoot, 'feature-modules', COMBINED_MODULE, 'dist', 'bundle.user.js');
if (!fs.existsSync(combinedBundlePath)) {
    console.error(`${colors.red}✗ Combined module bundle not found: ${combinedBundlePath}${colors.reset}`);
    process.exit(1);
}

const combinedContent = fs.readFileSync(combinedBundlePath, 'utf-8');
const requireLines = combinedRequires.map(url => `// @require     ${url}`).join('\n');
// Replace all existing @require lines in the banner with the full collected set
const updatedContent = combinedContent.replace(
    /^(\/\/ @require\s+\S+\n)+/m,
    requireLines + '\n'
);

const combinedOut = path.join(outDir, 'Furaffinity-Features.user.js');
fs.writeFileSync(combinedOut, updatedContent);
console.log(`${colors.green}✓ ${colors.blue}Furaffinity-Features.user.js${colors.reset} ${colors.cyan}(combined — ${combinedRequires.length} @requires)${colors.reset}`);

console.log(`\n${colors.green}✓ Collected ${count + 1} bundles into greasyfork-dist/${colors.reset}`);
