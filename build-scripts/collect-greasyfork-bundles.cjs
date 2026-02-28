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
// Browser-only build — not a GreasyFork script, exclude from distribution
const BROWSER_MODULE = 'Furaffinity-Features-Browser';

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
        if (moduleName === COMBINED_MODULE || moduleName === BROWSER_MODULE) continue;

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
// Read the banner directly from the rollup config (source of truth) — no build output needed.
const combinedConfigPath = path.join(srcRoot, 'feature-modules', COMBINED_MODULE, 'rollup.config.cjs');
if (!fs.existsSync(combinedConfigPath)) {
    console.error(`${colors.red}✗ Combined module rollup config not found: ${combinedConfigPath}${colors.reset}`);
    process.exit(1);
}

delete require.cache[require.resolve(combinedConfigPath)];
const combinedConfig = require(combinedConfigPath);
const combinedBannerStr = combinedConfig.output?.banner ?? '';
const featureRequires = extractRequiresFromBanner(combinedBannerStr);

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

// The banner from the config is already the full UserScript header
const bannerMatch = combinedBannerStr.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
if (!bannerMatch) {
    console.error(`${colors.red}✗ No UserScript banner found in combined rollup config${colors.reset}`);
    process.exit(1);
}

// Replace @require lines in the extracted banner with the full ordered set
const requireLines = combinedRequires.map(url => `// @require     ${url}`).join('\n');
const updatedBanner = bannerMatch[0].replace(
    /^(\/\/ @require\s+\S+\n)+/m,
    requireLines + '\n'
);

// Write banner + minimal stub so script loaders recognise the file as having executable content
fs.writeFileSync(path.join(outDir, 'Furaffinity-Features.user.js'), updatedBanner + "\n\nconsole.log('Furaffinity-Features loaded');\n");
console.log(`${colors.green}✓ ${colors.blue}Furaffinity-Features.user.js${colors.reset} ${colors.cyan}(combined — ${combinedRequires.length} @requires)${colors.reset}`);

// Write the glob file consumed by s0/git-publish-subdir-action (CLEAR_GLOBS_FILE).
// The action resolves this path relative to the published folder, so it must live inside greasyfork-dist/.
// It tells the action to delete all *.user.js files from the target branch before copying the new ones,
// ensuring renamed or removed scripts don't linger.
fs.writeFileSync(path.join(outDir, '.clear-target-files'), '*.user.js\n');

console.log(`\n${colors.green}✓ Collected ${count + 1} bundles into greasyfork-dist/${colors.reset}`);
