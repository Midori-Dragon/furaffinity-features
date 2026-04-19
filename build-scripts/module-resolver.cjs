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

/**
 * Build the full dependency graph by recursively reading rollup.config.cjs banners.
 * No compilation — only reads config files to discover @require URLs.
 *
 * Returns a Map keyed by module directory path, with values:
 *   { moduleName, moduleDir, configPath, buildPath, deps: string[] (moduleDir paths) }
 *
 * @param {string[]} requireUrls  Top-level @require URLs
 * @param {string}   srcRoot      Absolute path to the src/ directory
 * @param {Map}      [graph]      Internal: accumulates the graph
 * @returns {Map<string, {moduleName: string, moduleDir: string, configPath: string, buildPath: string, deps: string[]}>}
 */
function buildDependencyGraph(requireUrls, srcRoot, graph = new Map()) {
    for (const url of requireUrls) {
        const slug = moduleSlugFromUrl(url);
        const moduleDir = findModuleDir(slug, srcRoot);
        if (!moduleDir) continue;

        // Already visited
        if (graph.has(moduleDir)) continue;

        const moduleName = path.basename(moduleDir);
        const configPath = path.join(moduleDir, 'rollup.config.cjs');
        const buildPath = path.join(moduleDir, 'dist', 'bundle.user.js');

        if (!fs.existsSync(configPath)) continue;

        // Read this module's @requires from its config banner
        const resolvedConfig = path.resolve(configPath);
        delete require.cache[resolvedConfig];
        const rollupConfig = require(resolvedConfig);
        const banner = rollupConfig.output?.banner ?? '';
        const subRequireUrls = extractRequiresFromBanner(banner);

        // Resolve sub-dependency URLs to module dirs
        const deps = [];
        for (const subUrl of subRequireUrls) {
            const subSlug = moduleSlugFromUrl(subUrl);
            const subDir = findModuleDir(subSlug, srcRoot);
            if (subDir) deps.push(subDir);
        }

        graph.set(moduleDir, { moduleName, moduleDir, configPath, buildPath, deps });

        // Recurse into sub-dependencies
        buildDependencyGraph(subRequireUrls, srcRoot, graph);
    }
    return graph;
}

/**
 * Compute build levels from a dependency graph (topological sort by depth).
 * Level 0 = leaf modules (no dependencies), Level 1 = depends only on L0, etc.
 * Modules within the same level can be built in parallel.
 *
 * @param {Map} graph  From buildDependencyGraph()
 * @returns {Array<Array<{moduleName, moduleDir, configPath, buildPath, deps}>>}
 */
function computeBuildLevels(graph) {
    const levels = new Map(); // moduleDir → level number

    function getLevel(moduleDir) {
        if (levels.has(moduleDir)) return levels.get(moduleDir);
        const node = graph.get(moduleDir);
        if (!node || node.deps.length === 0) {
            levels.set(moduleDir, 0);
            return 0;
        }
        const maxDepLevel = Math.max(...node.deps.map(dep => getLevel(dep)));
        const level = maxDepLevel + 1;
        levels.set(moduleDir, level);
        return level;
    }

    for (const moduleDir of graph.keys()) {
        getLevel(moduleDir);
    }

    // Group by level
    const maxLevel = Math.max(...levels.values(), -1);
    const result = [];
    for (let i = 0; i <= maxLevel; i++) {
        result.push([]);
    }
    for (const [moduleDir, level] of levels) {
        result[level].push(graph.get(moduleDir));
    }
    return result;
}

module.exports = { moduleSlugFromUrl, findModuleDir, extractRequiresFromBanner, resolveRequireOrder, buildDependencyGraph, computeBuildLevels };
