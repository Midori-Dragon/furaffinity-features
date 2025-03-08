import { Logger, LogLevel } from '../../GlobalUtils/src/Logger';
import { Settings } from './modules/Settings';
import { SettingType } from './utils/SettingType';

Object.defineProperties(window, {
    FACustomSettings: { get: () => Settings },
    FASettingType: { get: () => SettingType },
});

const customSettings = new Settings('Custom-Furaffinity-Settings', 'Global Custom-Furaffinity-Settings');
customSettings.showFeatureEnabledSetting = false;

export const loggingSetting = customSettings.newSetting(window.FASettingType.Option, 'Logging');
loggingSetting.description = 'Sets the logging level.';
loggingSetting.defaultValue = LogLevel.Error;
loggingSetting.options = {
    [LogLevel.Error]: LogLevel[LogLevel.Error],
    [LogLevel.Warning]: LogLevel[LogLevel.Warning],
    [LogLevel.Info]: LogLevel[LogLevel.Info]
};
loggingSetting.addEventListener('input', (): void => Logger.setLogLevel(parseInt(loggingSetting.value.toString())));
Logger.setLogLevel(parseInt(loggingSetting.value.toString()));

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
