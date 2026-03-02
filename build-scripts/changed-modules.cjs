'use strict';

/**
 * changed-modules.cjs
 * Lists all source modules (feature-modules + library-modules) that have at
 * least one file changed since the latest release tag.
 *
 * Usage:
 *   node build-scripts/changed-modules.cjs [--tag <tag>]
 *
 * Options:
 *   --tag <tag>   Compare against a specific tag instead of the latest one.
 */

const { execSync } = require('child_process');
const path = require('path');

// ── helpers ──────────────────────────────────────────────────────────────────

function git(cmd) {
    return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
}

function latestTag() {
    try {
        return git('describe --tags --abbrev=0');
    } catch {
        return null;
    }
}

// ── argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let compareTag = null;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag' && args[i + 1]) {
        compareTag = args[++i];
    }
}

if (!compareTag) {
    compareTag = latestTag();
    if (!compareTag) {
        console.error('No release tags found in this repository.');
        process.exit(1);
    }
}

// ── resolve changed files since the tag ──────────────────────────────────────

let changedFiles;
try {
    changedFiles = git(`diff --name-only "${compareTag}" HEAD`)
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);
} catch (err) {
    console.error(`Failed to diff against tag "${compareTag}": ${err.message}`);
    process.exit(1);
}

if (changedFiles.length === 0) {
    console.log(`No changes since ${compareTag}.`);
    process.exit(0);
}

// ── map file paths → module names ────────────────────────────────────────────

// Modules live under src/feature-modules/<ModuleName>/ or
//                    src/library-modules/<ModuleName>/
const MODULE_DIRS = ['src/feature-modules', 'src/library-modules'];

// Normalise to forward slashes for consistent matching on Windows
const normalise = p => p.replace(/\\/g, '/');

const changedModules = new Map(); // moduleName → { type, files[] }

for (const file of changedFiles) {
    const normalFile = normalise(file);
    for (const moduleDir of MODULE_DIRS) {
        const prefix = moduleDir + '/';
        if (!normalFile.startsWith(prefix)) continue;

        const rest = normalFile.slice(prefix.length);       // e.g. "FA-Infini-Gallery/src/..."
        const moduleName = rest.split('/')[0];              // e.g. "FA-Infini-Gallery"
        if (!moduleName) continue;

        const type = moduleDir.includes('feature') ? 'feature' : 'library';
        if (!changedModules.has(moduleName)) {
            changedModules.set(moduleName, { type, files: [] });
        }
        changedModules.get(moduleName).files.push(file);
        break;
    }
}

if (changedModules.size === 0) {
    console.log(`No module source files changed since ${compareTag}.`);
    process.exit(0);
}

// ── output ────────────────────────────────────────────────────────────────────

const featureModules = [...changedModules.entries()].filter(([, v]) => v.type === 'feature');
const libraryModules = [...changedModules.entries()].filter(([, v]) => v.type === 'library');

const sorted = (arr) => arr.sort(([a], [b]) => a.localeCompare(b));

console.log(`\nModules changed since ${compareTag}:\n`);

if (libraryModules.length > 0) {
    console.log('  Library modules:');
    for (const [name, { files }] of sorted(libraryModules)) {
        console.log(`    • ${name}  (${files.length} file${files.length !== 1 ? 's' : ''})`);
    }
}

if (featureModules.length > 0) {
    if (libraryModules.length > 0) console.log('');
    console.log('  Feature modules:');
    for (const [name, { files }] of sorted(featureModules)) {
        console.log(`    • ${name}  (${files.length} file${files.length !== 1 ? 's' : ''})`);
    }
}

console.log(`\n  Total: ${changedModules.size} module${changedModules.size !== 1 ? 's' : ''}\n`);
