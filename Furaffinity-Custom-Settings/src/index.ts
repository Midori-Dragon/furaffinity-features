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

export const showResetButtonSetting = customSettings.newSetting(SettingType.Boolean, 'Show Reset Button');
showResetButtonSetting.description = 'Set wether the "Reset this Setting" button is shown in other Settings.';
showResetButtonSetting.defaultValue = true;
customSettings.loadSettings();
