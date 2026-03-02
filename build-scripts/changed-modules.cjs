'use strict';

/**
 * changed-modules.cjs
 * Lists all source modules (feature-modules + library-modules) that have at
 * least one file changed since the latest release tag.
 *
 * Usage:
 *   node build-scripts/changed-modules.cjs [--tag <tag>] [--show-versions]
 *
 * Options:
 *   --tag <tag>        Compare against a specific tag instead of the latest one.
 *   --show-versions    Also show the old and new @version from each module's
 *                      rollup.config.cjs next to its name.
 */

const { execSync } = require('child_process');
const fs = require('fs');
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
let showVersions = false;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag' && args[i + 1]) {
        compareTag = args[++i];
    } else if (args[i] === '--show-versions') {
        showVersions = true;
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

// ── version helpers ──────────────────────────────────────────────────────────

/**
 * Extract the @version value from the text content of a rollup.config.cjs.
 * Returns null if not found.
 */
function extractVersion(content) {
    const match = content.match(/@version\s+([^\s\n]+)/);
    return match ? match[1] : null;
}

/**
 * Read the version from a module's rollup.config.cjs at the given git tag.
 * Returns null if the file didn't exist at that tag.
 * Only call this when rollup.config.cjs exists on disk (existence already checked).
 */
function getTagVersion(tag, moduleRelDir) {
    // Git paths always use forward slashes
    const gitPath = moduleRelDir.replace(/\\/g, '/') + '/rollup.config.cjs';
    try {
        const content = git(`show "${tag}:${gitPath}"`);
        return extractVersion(content);
    } catch {
        return null;
    }
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

const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * Returns the version annotation string (e.g. "[v1.0.3 → v1.0.5]") for a
 * module, or an empty string if versions are unavailable or showVersions is off.
 */
function getVersionInfo(moduleDir) {
    if (!showVersions) return '';
    const rollupPath = path.join(process.cwd(), moduleDir, 'rollup.config.cjs');
    if (!fs.existsSync(rollupPath)) return '';
    const newVer = extractVersion(fs.readFileSync(rollupPath, 'utf8'));
    const oldVer = getTagVersion(compareTag, moduleDir);
    if (oldVer != null && newVer != null) {
        return oldVer === newVer
            ? `${YELLOW}[v${oldVer} — v${newVer}]${RESET}`
            : `[v${oldVer} → v${newVer}]`;
    }
    if (newVer != null) return `[new: v${newVer}]`;
    if (oldVer != null) return `[was: v${oldVer}]`;
    return '';
}

/** Compute the column widths needed to align a group of entries. */
function computeWidths(entries) {
    let nameWidth = 0;
    let countWidth = 0;
    for (const [name, { files }] of entries) {
        nameWidth = Math.max(nameWidth, name.length);
        const countStr = `(${files.length} file${files.length !== 1 ? 's' : ''})`;
        countWidth = Math.max(countWidth, countStr.length);
    }
    return { nameWidth, countWidth };
}

function formatLine(name, moduleDir, files, nameWidth, countWidth) {
    const countStr = `(${files.length} file${files.length !== 1 ? 's' : ''})`;
    const versionInfo = getVersionInfo(moduleDir);
    const line = `    • ${name.padEnd(nameWidth)}  ${countStr.padEnd(countWidth)}  ${versionInfo}`;
    return line.trimEnd();
}

const sortedLibrary = sorted(libraryModules);
const sortedFeature = sorted(featureModules);

if (sortedLibrary.length > 0) {
    const { nameWidth, countWidth } = computeWidths(sortedLibrary);
    console.log('  Library modules:');
    for (const [name, { files }] of sortedLibrary) {
        const moduleDir = `src/library-modules/${name}`;
        console.log(formatLine(name, moduleDir, files, nameWidth, countWidth));
    }
}

if (sortedFeature.length > 0) {
    if (sortedLibrary.length > 0) console.log('');
    const { nameWidth, countWidth } = computeWidths(sortedFeature);
    console.log('  Feature modules:');
    for (const [name, { files }] of sortedFeature) {
        const moduleDir = `src/feature-modules/${name}`;
        console.log(formatLine(name, moduleDir, files, nameWidth, countWidth));
    }
}

console.log(`\n  Total: ${changedModules.size} module${changedModules.size !== 1 ? 's' : ''}\n`);
