'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Extract the module slug from a GreasyFork @require URL.
 * Versionless: https://greasyfork.org/scripts/<id>-<slug>/code/<id>-<slug>.js  → slug
 * Legacy:      https://update.greasyfork.org/scripts/<id>/<ver>/<ScriptName>.js → ScriptName
 */
function moduleSlugFromUrl(url) {
    const base = path.basename(url, '.js');
    return base.replace(/^\d+-/, '');
}

/**
 * Find a module directory by case-insensitive slug match.
 * Searches library-modules first, then feature-modules, under srcRoot.
 * @param {string} slug
 * @param {string} srcRoot  Absolute path to the src/ directory
 * @returns {string|null}   Absolute path to the module directory, or null
 */
function findModuleDir(slug, srcRoot) {
    for (const searchDir of ['library-modules', 'feature-modules']) {
        const baseDir = path.join(srcRoot, searchDir);
        if (!fs.existsSync(baseDir)) continue;
        const entry = fs.readdirSync(baseDir)
            .find(e => e.toLowerCase() === slug.toLowerCase());
        if (entry) return path.join(baseDir, entry);
    }
    return null;
}

/**
 * Extract all @require URLs from the UserScript banner in a bundle's content.
 * @param {string} content  Full text of a bundle.user.js file
 * @returns {string[]}
 */
function extractRequiresFromBanner(content) {
    const bannerStart = content.indexOf('// ==UserScript==');
    const bannerEnd = content.indexOf('// ==/UserScript==');
    if (bannerStart === -1 || bannerEnd === -1) return [];
    const banner = content.substring(bannerStart, bannerEnd);
    const requireRegex = /@require\s+([^\s]+)/g;
    const requires = [];
    let match;
    while ((match = requireRegex.exec(banner)) !== null) {
        requires.push(match[1]);
    }
    return requires;
}

/**
 * Recursively resolve @require URLs into an ordered list of bundle paths,
 * reading only already-built bundle.user.js files (no compilation).
 * Dependencies are returned before the modules that depend on them.
 *
 * @param {string[]} requireUrls    List of @require URLs to resolve
 * @param {string}   srcRoot        Absolute path to the src/ directory
 * @param {Set}      [exclude]      Module directory names to skip (e.g. entry-point modules)
 * @param {Set}      [resolved]     Internal: already-resolved build paths (dedup)
 * @param {string[]} [order]        Internal: accumulates ordered build paths
 * @returns {string[]}  Ordered array of absolute bundle.user.js paths
 */
function resolveRequireOrder(requireUrls, srcRoot, exclude = new Set(), resolved = new Set(), order = []) {
    for (const url of requireUrls) {
        const slug = moduleSlugFromUrl(url);
        const moduleDir = findModuleDir(slug, srcRoot);
        if (!moduleDir) continue;

        const moduleName = path.basename(moduleDir);
        if (exclude.has(moduleName)) continue;

        const buildPath = path.join(moduleDir, 'dist', 'bundle.user.js');
        if (resolved.has(buildPath)) continue;
        if (!fs.existsSync(buildPath)) continue;

        resolved.add(buildPath);

        // Recurse into this module's own dependencies first
        const content = fs.readFileSync(buildPath, 'utf-8');
        const subRequires = extractRequiresFromBanner(content);
        resolveRequireOrder(subRequires, srcRoot, exclude, resolved, order);

        order.push(buildPath);
    }
    return order;
}

module.exports = { moduleSlugFromUrl, findModuleDir, extractRequiresFromBanner, resolveRequireOrder };
