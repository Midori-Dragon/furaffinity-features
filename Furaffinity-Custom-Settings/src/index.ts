import { Logger, LogLevel } from '../../GlobalUtils/src/Logger';
import { Settings } from './modules/Settings';
import { SettingType } from './utils/SettingType';

Object.defineProperties(window, {
    FACustomSettings: { get: () => Settings },
    FASettingType: { get: () => SettingType },
});

const customSettings = new Settings();   
customSettings.extensionName = 'Extension Settings';
customSettings.provider = 'Custom-Furaffinity-Settings';
customSettings.headerName = 'Global Custom-Furaffinity-Settings';

export const loggingSetting = customSettings.newSetting(window.FASettingType.Number, 'Logging');
loggingSetting.description = 'The logging level. 0 = none, 1 = errors, 2 = warnings, 3 = infos.';
loggingSetting.defaultValue = LogLevel.Error;
loggingSetting.addEventListener('input', (): void => Logger.setLogLevel(loggingSetting.value));
Logger.setLogLevel(loggingSetting.value);

export const showResetButtonSetting = customSettings.newSetting(SettingType.Boolean, 'Show Reset Button');
showResetButtonSetting.description = 'Set wether the "Reset this Setting" button is shown in other Settings.';
showResetButtonSetting.defaultValue = true;

customSettings.loadSettings();

let color = 'color: blue';
if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    color = 'color: aqua';
}
const settingString = `GlobalSettings: ${customSettings.toString()}`;
console.info(`%c${settingString}`, color);
