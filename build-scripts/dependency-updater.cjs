'use strict';

/*
 *  ┌─────────────────────────────────────────────────────────┐
 *  │         Furaffinity Features Dependency updater         │
 *  └─────────────────────────────────────────────────────────┘
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const readline = require('node:readline/promises');
const { setTimeout: delay } = require('node:timers/promises');

/*──────────────────────────── helpers – console colours ─────────────────────*/
// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

/*───────────────────────────────  models  ───────────────────────────────────*/
class ScriptUrl {
    /**
     * 
     * @param {string} url 
     */
    constructor(url) {
        const [, idStr, name] = url.match(/\/scripts\/(\d+)-([\w-]+)/) ?? [];
        if (!idStr) {
            throw new Error(`Invalid script URL: ${url}`);
        }
        this.id = Number(idStr);
        this.name = name;
    }

    /**
     * 
     * @returns {string}
     */
    toString() {
        return `https://greasyfork.org/scripts/${this.id}-${this.name}`;
    }

    /**
     * 
     * @returns {Promise<LibraryUrl>}
     */
    async toLibraryUrl() {
        return await GreasyForkHelper.getLibraryUrlFromScriptUrl(this);
    }
}

class LibraryUrl {
    /**
     * 
     * @param {string} url 
     */
    constructor(url) {
        const [, idStr, verStr, filename] = url.match(/\/scripts\/(\d+)\/(\d+)\/([\w.-]+)\.js$/) ?? [];
        if (!idStr) {
            throw new Error(`Invalid library URL: ${url}`);
        }
        this.id = Number(idStr);
        this.versionId = Number(verStr);
        this.name = filename.replace(/\.js$/i, '');
    }

    /**
     * 
     * @returns {string}
     */
    toString() {
        let versionIdStr = this.versionId;
        if (this.versionId === 0) {
            versionIdStr = '0000000';
        }
        return `https://update.greasyfork.org/scripts/${this.id}/${versionIdStr}/${this.name}.js`;
    }

    /**
     * 
     * @param {string} scriptUrl 
     * @returns {Promise<LibraryUrl>}
     */
    static async fromScriptUrlAsync(scriptUrl) {
        return await GreasyForkHelper.getLibraryUrlFromScriptUrl(scriptUrl);
    }
}

class ScriptInfo {
    /** @type {string} */
    name = '';

    /** @type {string} */
    webpackPath = '';

    /** @type {LibraryUrl[]} */
    dependencies = [];

    /** @type {ScriptUrl|null} */
    _homepageUrl = null;

    /** @type {LibraryUrl|null} */
    libraryUrl = null;

    /** @param {ScriptUrl|null} url */
    set homepageUrl(url) {
        this._homepageUrl = url;
    }
    /** @returns {ScriptUrl|null} */
    get homepageUrl() {
        return this._homepageUrl;
    }

    /**
     * 
     * @param {string} urlStr 
     */
    async linkHomepage(urlStr) {
        this._homepageUrl = new ScriptUrl(urlStr);
        try {
            this.libraryUrl = await this._homepageUrl.toLibraryUrl();
        } catch { }
    }
}

/*──────────────────── GreasyFork scraping (no dependency) ───────────────────*/
const GreasyForkHelper = {
    /**
     * 
     * @param {ScriptUrl} scriptUrl 
     * @returns {Promise<LibraryUrl>}
     */
    async getLibraryUrlFromScriptUrl(scriptUrl) {
        const html = await fetch(scriptUrl.toString()).then(r => r.text());

        // GreasyFork always shows the *update* link inside the first <code> element
        const match = html.match(/https:\/\/update\.greasyfork\.org\/scripts\/\d+\/\d+\/[\w.-]+\.js/);
        if (!match) {
            throw new Error('Could not locate update URL on GreasyFork page');
        }
        return new LibraryUrl(match[0]);
    },
};

/*──────────────────────────────── regex utils ───────────────────────────────*/
const rx = {
    banner: /new\s+webpack\.BannerPlugin\(\s*{\s*banner:\s*`([\s\S]*?)`,/m,
    name: /^\s*\/\/\s*@name\s+(.+)$/m,
    require: /^\s*\/\/\s*@require\s+(.+)$/gm,
    homepage: /^\s*\/\/\s*@homepageURL\s+(.+)$/m,
};

/*───────────────────────── file helpers (non-blocking) ──────────────────────*/
/**
 * 
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
async function readFileWithoutLocking(filePath) {
    const maxMs = 2_000;
    const start = Date.now();

    while (Date.now() - start < maxMs) {
        const content = await fs.readFile(filePath, 'utf8');
        if (content.trim()) {
            return content;
        }
        await delay(200);
    }
    return '';
}

/**
 * 
 * @param {string} webpackPath 
 * @returns {Promise<string>}
 */
async function extractBanner(webpackPath) {
    if (!(await fsExists(webpackPath))) return '';
    const content = await readFileWithoutLocking(webpackPath);
    const m = content.match(rx.banner);
    return m ? m[1].trim() : '';
}

/*─────────────────────────────  banner editing  ─────────────────────────────*/
/**
 * 
 * @param {string} originalBanner 
 * @param {ScriptInfo} scriptInfo 
 * @returns {string}
 */
function buildUpdatedBanner(originalBanner, scriptInfo) {
    let lines = originalBanner.split('\n').map(l => l.trimEnd());

    // Remove current @require lines
    lines = lines.filter(l => !l.startsWith('// @require'));

    const requireInsertIdx = lines.findIndex(l => l.startsWith('// @match')) ?? lines.length;

    // Insert fresh @require lines (same order as dependencies array)
    const reqLines = scriptInfo.dependencies.map(dep => `// @require     ${dep}`);
    lines.splice(requireInsertIdx + 1, 0, ...reqLines);

    return `\n${lines.join('\n')}\n`;
}

/**
 * 
 * @param {string} webpackPath 
 * @param {ScriptInfo} scriptInfo 
 * @returns {Promise<void>}
 */
async function modifyBanner(webpackPath, scriptInfo) {
    if (!(await fsExists(webpackPath))) {
        return;
    }
    const content = await readFileWithoutLocking(webpackPath);
    const match = content.match(rx.banner);
    if (!match) {
        return;
    }

    const updated = buildUpdatedBanner(match[1].trim(), scriptInfo);
    const newContent = content.replace(match[1], updated);
    await fs.writeFile(webpackPath, newContent);
}

/*────────────────────────────── misc helpers ───────────────────────────────*/
/**
 * 
 * @param {string} text 
 * @param {RegExp} re 
 * @param {number} group 
 * @returns 
 */
function getMatchesAll(text, re, group = 1) {
    const out = [];
    for (const match of text.matchAll(re)) {
        out.push(match[group].trim());
    }
    return out;
}

/**
 * 
 * @param {string} p 
 * @returns {Promise<boolean>}
 */
async function fsExists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

/**
 * 
 * @param {string} fileName 
 * @returns {Promise<string>}
 */
async function findCommonWebpack(fileName) {
    let dir = path.resolve('./');
    for (let i = 0; i < 6; i++) {
        const candidate = path.join(dir, fileName);
        if (await fsExists(candidate)) {
            return candidate;
        }
        dir = path.dirname(dir);
    }
    return '';
}

/*──────────────────────────────  MAIN ───────────────────────────────────────*/
(async function main() {
    const confirmGiven = process.argv.includes('-y') || process.argv.includes('-n');
    const confirmResultYes = process.argv.includes('-y');

    console.log(`${colors.cyan}Loading Project Modules...${colors.reset}\n`);
    const commonWebpack = await findCommonWebpack('webpack.common.cjs');
    const projectFolder = path.dirname(commonWebpack);

    const webpackConfigs =
        (await fs.readdir(projectFolder, { recursive: true }))
            .filter(f => f.endsWith('webpack.config.cjs'))
            .map(f => path.join(projectFolder, f));

    /** @type {ScriptInfo[]} */
    const scriptInfos = [];

    for (const config of webpackConfigs) {
        const banner = await extractBanner(config);
        if (!banner) continue;

        const name = (banner.match(rx.name)?.[1] ?? '').trim();
        console.log(`${colors.cyan}Loading ${colors.blue}${name}...${colors.reset}`);

        try {
            const info = new ScriptInfo();
            info.name = name;
            info.webpackPath = config;

            // dependencies
            info.dependencies = getMatchesAll(banner, rx.require).map(url => new LibraryUrl(url));

            // homepage → library URL
            const homeUrl = banner.match(rx.homepage)?.[1].trim();
            if (homeUrl) {
                await info.linkHomepage(homeUrl);
            }

            scriptInfos.push(info);
            console.log(`   ${colors.green}✓ Done!${colors.reset}\n`);
        } catch (e) {
            console.log(`   ${colors.red}✗ Failed to load module.${colors.reset}\n`);
        }
    }

    if (!scriptInfos.length) {
        console.log(`${colors.yellow}✖ No Modules found.${colors.reset}`);
        return;
    }

    console.log(`\n${colors.cyan}Checking Module Dependencies for updates...${colors.reset}\n`);

    /** @type {ScriptInfo[]} */
    const toUpdate = [];

    for (const s of scriptInfos) {
        console.log(`${colors.cyan}Checking ${colors.blue}${s.name}...${colors.reset}`);

        const dependants = scriptInfos.filter(x => x.dependencies.some(d => d.id === s.homepageUrl?.id));

        if (!dependants.length) {
            console.log(`   ${colors.blue}No modules to update.${colors.reset}\n`);
            continue;
        }

        for (const depScript of dependants) {
            const dep = depScript.dependencies.find(d => d.id === s.homepageUrl.id);
            const oldV = dep.versionId;
            const newV = s.libraryUrl?.versionId;

            if (oldV === newV) {
                console.log(`   ${colors.green}✓ ${depScript.name} is already up to date.${colors.reset}`);
            } else if (oldV <= 0 || newV <= 0) {
                console.log(`   ${colors.blue}⚠ ${depScript.name} version unknown. ${colors.reset}`);
            } else {
                dep.versionId = newV;
                if (!toUpdate.includes(depScript)) {
                    toUpdate.push(depScript);
                }
                console.log(`   ${colors.yellow}⚠ Update ${depScript.name} from ${oldV} to ${newV} needed.${colors.reset}`);
            }
        }
        console.log('');
    }

    if (!toUpdate.length) {
        console.log(`${colors.green}✓ All Modules are up to date!${colors.reset}`);
        return;
    }

    /*────────────── optional confirmation ──────────────*/
    if (!confirmGiven) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        let ans = '';
        while (!['y', 'n'].includes(ans)) {
            ans = (await rl.question(`${colors.cyan}Are you sure you want to update the found dependencies? (y/n) ${colors.reset}`)).trim().toLowerCase();
            if (!['y', 'n'].includes(ans)) {
                console.log(`${colors.yellow}⚠ Invalid input. Please enter 'y' or 'n'.${colors.reset}`);
            }
        }
        rl.close();
        if (ans !== 'y') {
            console.log(`${colors.yellow}Update cancelled.${colors.reset}`);
            return;
        }
    } else if (!confirmResultYes) {
        console.log(`${colors.yellow}Update cancelled.${colors.reset}`);
        return;
    }

    /*──────────── perform updates ──────────────*/
    console.log(`\n${colors.cyan}Updating Module Dependencies...${colors.reset}`);
    for (const s of toUpdate) {
        try {
            await modifyBanner(s.webpackPath, s);
            console.log(`   ${colors.green}✓ Updated ${colors.blue}${s.name}${colors.reset}`);
        } catch {
            console.log(`   ${colors.red}✗ Failed to update ${colors.blue}${s.name}${colors.reset}`);
        }
    }
    console.log(`\n${colors.green}✓ All Modules updated!${colors.reset}`);
})();
