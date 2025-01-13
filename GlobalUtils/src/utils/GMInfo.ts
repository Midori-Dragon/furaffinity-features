// eslint-disable-next-line @typescript-eslint/naming-convention
declare const GM_info: {
  script: {
    name: string; // The name of the script
    version: string; // The version of the script
    description?: string; // A description of the script (if provided in the metadata)
    author?: string; // The author of the script (if provided in the metadata)
    namespace?: string; // The namespace of the script
    source?: string; // The source URL of the script (if available)
    icon?: string; // The icon of the script (if provided in the metadata)
    icon64?: string; // A 64x64 icon of the script (if provided)
    antifeature?: Record<string, string>; // Any anti-features declared in the script
    options?: Record<string, unknown>; // Script-specific options (if applicable)
  };
  scriptMetaStr: string; // The raw metadata block of the script as a string
  scriptHandler: string; // The user script manager handling the script
  scriptUpdateURL?: string; // The URL used to check for script updates
  scriptWillUpdate?: boolean; // Whether the script is set to auto-update
  scriptResources?: Record<string, { name: string; url: string; mimeType?: string }>; // Resources defined in the script metadata
  downloadMode?: string; // The download mode supported by the script manager
};

export class GMInfo {
    static isBrowserEnvironment(): boolean {
        return (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') || (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined');
    }

    static getBrowserAPI(): any {
        if (GM_info != null) {
            // For userscripts
            return GM_info;
        } else if (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') {
            // Firefox or browsers using WebExtension API
            return browser;
        } else if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
            // Chrome or Chromium-based browsers
            return chrome;
        } else {
            throw new Error('Unsupported browser for SyncedStorage.');
        }
    }

    static get scriptName(): string {
        if (GMInfo.isBrowserEnvironment()) {
            return GMInfo.getBrowserAPI().runtime.getManifest().name;
        } else {
            return GMInfo.getBrowserAPI().script.name;
        }
    }

    static get scriptVersion(): string {
        if (GMInfo.isBrowserEnvironment()) {
            return GMInfo.getBrowserAPI().runtime.getManifest().version;
        } else {
            return GMInfo.getBrowserAPI().script.version;
        }
    }

    static get scriptDescription(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return GMInfo.getBrowserAPI().runtime.getManifest().description;
        } else {
            return GMInfo.getBrowserAPI().script.description;
        }
    }

    static get scriptAuthor(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return GMInfo.getBrowserAPI().runtime.getManifest().author;
        } else {
            return GMInfo.getBrowserAPI().script.author;
        }
    }

    static get scriptNamespace(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return undefined; // Browser extensions don't have namespace
        } else {
            return GMInfo.getBrowserAPI().script.namespace;
        }
    }

    static get scriptSource(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return undefined; // Browser extensions don't have source
        } else {
            return GMInfo.getBrowserAPI().script.source;
        }
    }

    static get scriptIcon(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            const manifest = GMInfo.getBrowserAPI().runtime.getManifest();
            let largestIcon = 0;
            for (const key of Object.keys(manifest.icons)) {
                const size = parseInt(key);
                if (size > largestIcon) {
                    largestIcon = size;
                }
            }
            return manifest.icons[largestIcon.toString()];
        } else {
            return GMInfo.getBrowserAPI().script.icon;
        }
    }

    static get scriptIcon64(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            const manifest = GMInfo.getBrowserAPI().runtime.getManifest();
            return manifest.icons == null ? undefined : manifest.icons['64'];
        } else {
            return GMInfo.getBrowserAPI().script.icon64;
        }
    }

    static get scriptAntifeature(): Record<string, string> | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return undefined; // Browser extensions don't have antifeature
        } else {
            return GMInfo.getBrowserAPI().script.antifeature;
        }
    }

    static get scriptOptions(): Record<string, unknown> | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return undefined; // Browser extensions don't have script options
        } else {
            return GMInfo.getBrowserAPI().script.options;
        }
    }

    static get scriptMetaStr(): string {
        if (GMInfo.isBrowserEnvironment()) {
            return JSON.stringify(GMInfo.getBrowserAPI().runtime.getManifest());
        } else {
            return GMInfo.getBrowserAPI().scriptMetaStr;
        }
    }

    static get scriptHandler(): string {
        if (GMInfo.isBrowserEnvironment()) {
            return typeof browser !== 'undefined' ? 'Firefox' : 'Chrome';
        } else {
            return GMInfo.getBrowserAPI().scriptHandler;
        }
    }

    static get scriptUpdateURL(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return GMInfo.getBrowserAPI().runtime.getManifest().update_url;
        } else {
            return GMInfo.getBrowserAPI().scriptUpdateURL;
        }
    }

    static get scriptWillUpdate(): boolean | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return undefined; // Browser extensions handle updates differently
        } else {
            return GMInfo.getBrowserAPI().scriptWillUpdate;
        }
    }

    static get scriptResources(): Record<string, { name: string; url: string; mimeType?: string }> | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return undefined; // Browser extensions don't have script resources
        } else {
            return GMInfo.getBrowserAPI().scriptResources;
        }
    }

    static get downloadMode(): string | undefined {
        if (GMInfo.isBrowserEnvironment()) {
            return undefined; // Browser extensions don't have download mode
        } else {
            return GMInfo.getBrowserAPI().downloadMode;
        }
    }
}
