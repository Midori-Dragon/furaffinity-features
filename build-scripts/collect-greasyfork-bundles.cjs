'use strict';

const fs = require('fs');
const path = require('path');
const { resolveRequireOrder, extractRequiresFromBanner } = require('./module-resolver.cjs');

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

// The combined entry module — its bundle provides the header; @requires are replaced with the full ordered set
const COMBINED_MODULE = 'Furaffinity-Features';

const srcRoot = path.resolve(__dirname, '..', 'src');
const outDir = path.resolve(__dirname, '..', 'greasyfork-dist');

if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir);

let count = 0;

// Step 1: Copy all individual module bundles (excluding the combined entry)
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
        fs.copyFileSync(bundlePath, path.join(outDir, `${name}.user.js`));
        console.log(`${colors.green}✓ ${colors.blue}${name}.user.js${colors.reset}`);
        count++;
    }
}

// Step 2: Build the combined Furaffinity-Features.user.js with correctly ordered @requires.
// Read the combined module's bundle to get its feature-module @require URLs, then resolve
// all transitive dependencies in correct load order (deps before dependents).
const combinedBundlePath = path.join(srcRoot, 'feature-modules', COMBINED_MODULE, 'dist', 'bundle.user.js');
if (!fs.existsSync(combinedBundlePath)) {
    console.error(`${colors.red}✗ Combined module bundle not found: ${combinedBundlePath}${colors.reset}`);
    process.exit(1);
}

const combinedBundleContent = fs.readFileSync(combinedBundlePath, 'utf-8');
const featureRequires = extractRequiresFromBanner(combinedBundleContent);

// Resolve full transitive dep order: libraries first (in dep order), then feature modules
const orderedPaths = resolveRequireOrder(featureRequires, srcRoot, new Set([COMBINED_MODULE]));

// Convert each ordered bundle path to a versionless @require URL via @homepageURL
const combinedRequires = [];
for (const bundlePath of orderedPaths) {
    const content = fs.readFileSync(bundlePath, 'utf-8');
    const homepageMatch = content.match(homepageRegex);
    if (homepageMatch) {
        const slug = homepageMatch[1].trim().replace(/\/$/, '').split('/scripts/')[1];
        combinedRequires.push(`https://greasyfork.org/scripts/${slug}/code/${slug}.js`);
    }
}

// Replace all existing @require lines in the banner with the full ordered set
const requireLines = combinedRequires.map(url => `// @require     ${url}`).join('\n');
const updatedContent = combinedBundleContent.replace(
    /^(\/\/ @require\s+\S+\n)+/m,
    requireLines + '\n'
);

fs.writeFileSync(path.join(outDir, 'Furaffinity-Features.user.js'), updatedContent);
console.log(`${colors.green}✓ ${colors.blue}Furaffinity-Features.user.js${colors.reset} ${colors.cyan}(combined — ${combinedRequires.length} @requires)${colors.reset}`);

console.log(`\n${colors.green}✓ Collected ${count + 1} bundles into greasyfork-dist/${colors.reset}`);
