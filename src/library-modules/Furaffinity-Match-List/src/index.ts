import type { Settings } from '../../Furaffinity-Custom-Settings/src/modules/Settings';
import type { SettingType } from '../../Furaffinity-Custom-Settings/src/utils/SettingType';
import { MatchList } from './modules/MatchList';

declare global {
    interface Window {
        FACustomSettings: typeof Settings;
        FASettingType: typeof SettingType;
    }
}

Object.defineProperties(window, {
    FAMatchList: { get: () => MatchList },
});
