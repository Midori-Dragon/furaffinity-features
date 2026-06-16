import type { Settings } from '../../Furaffinity-Custom-Settings/src/modules/Settings';

declare global {
    interface Window {
        FAGlobalSettings: Settings;
        __faPendingGlobalSettings?: Array<(settings: Settings) => void>;
    }
}

export function registerGlobalSetting(registerSetting: (settings: Settings) => void): void {
    if (window.FAGlobalSettings != null) {
        registerSetting(window.FAGlobalSettings);
        window.FAGlobalSettings.loadSettings();
    } else {
        window.__faPendingGlobalSettings ??= [];
        window.__faPendingGlobalSettings.push(registerSetting);
    }
}
