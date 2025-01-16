import { Settings } from '../../../Furaffinity-Custom-Settings/src/modules/Settings';
import { GMInfo } from '../../../GlobalUtils/src/utils/Browser-API/GMInfo';

export class MatchList {
    matches: string[];
    runInIFrame: boolean;
    logRunning: boolean;
    customSettings: Settings;

    get hasMatch(): boolean {
        if (!this.runInIFrame && this.isWindowIFrame) {
            return false;
        }

        if (!this.matches.some(x => window.location.toString().includes(x))) {
            return false;
        }

        let color = 'color: blue';
        if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
            color = 'color: aqua';
        }

        let runString = this.logRunning ? `${GMInfo.scriptName} v${GMInfo.scriptVersion}` : '';
        let run = true;
        if (window.location.toString().includes('settings?extension')) {
            runString = 'Settings: ' + runString;
            run = false;
        } else if (this.customSettings != null) {
            runString = `Running: ${runString} ${this.customSettings.toString()}`;
        } else {
            runString = 'Running: ' + runString;
        }
        if (this.logRunning) {
            console.info(`%c${runString}`, color);
        }
        
        return run;
    }

    get match(): string | undefined {
        if (!this.runInIFrame && window.parent !== window) {
            return;
        }

        return this.matches.find(x => window.location.toString().includes(x));
    }

    get isWindowIFrame(): boolean {
        return window !== window.parent;
    }

    constructor(customSettings: Settings) {
        this.matches = [];
        this.runInIFrame = false;
        this.logRunning = true;
        this.customSettings = customSettings;
    }

    addMatch(match: string): void {
        this.matches.push(match);
    }

    removeMatch(match: string): void {
        this.matches = this.matches.filter(m => m !== match);
    }
}
