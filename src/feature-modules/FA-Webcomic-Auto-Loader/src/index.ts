import { Settings } from '../../../library-modules/Furaffinity-Custom-Settings/src/modules/Settings';
import { SettingType } from '../../../library-modules/Furaffinity-Custom-Settings/src/utils/SettingType';
import { LoadingSpinner } from '../../../library-modules/Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import { MatchList } from '../../../library-modules/Furaffinity-Match-List/src/modules/MatchList';
import { FuraffinityRequests } from '../../../library-modules/Furaffinity-Request-Helper/src/modules/FuraffinityRequests';
import { AutoLoader } from './modules/AutoLoader';

declare global {
    interface Window {
        FACustomSettings: typeof Settings;
        FASettingType: typeof SettingType;
        FARequestHelper: typeof FuraffinityRequests;
        BrowseOptions: typeof FuraffinityRequests.Types.BrowseOptions;
        SearchOptions: typeof FuraffinityRequests.Types.SearchOptions;
        FAMatchList: typeof MatchList;
        FALoadingSpinner: typeof LoadingSpinner;
    }
}

export const scriptName = 'FA Webcomic Auto Loader';

const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);

export const showSearchButtonSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Similar Search Button');
showSearchButtonSetting.description = 'Sets wether the search for similar Pages button is show.';
showSearchButtonSetting.defaultValue = true;

export const loadingSpinSpeedSetting = customSettings.newSetting(window.FASettingType.Number, 'Loading Animation');
loadingSpinSpeedSetting.description = 'Sets the duration that the loading animation takes for a full rotation in milliseconds.';
loadingSpinSpeedSetting.defaultValue = 1000;

export const backwardSearchSetting = customSettings.newSetting(window.FASettingType.Number, 'Backward Search Amount');
backwardSearchSetting.description = 'Sets the amount of similar pages to search backward. (More Pages take longer)';
backwardSearchSetting.defaultValue = 3;

export const overwriteNavButtonsSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Overwrite Nav Buttons');
overwriteNavButtonsSetting.description = 'Sets wether the default Navigation Buttons (next/prev) are overwritten by the Auto-Loader. (Works only if comic navigation is present)';
overwriteNavButtonsSetting.defaultValue = true;

export const useCustomLightboxSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Use Custom Lightbox');
useCustomLightboxSetting.description = 'Sets wether the default Lightbox (fullscreen view) is overwritten by the Auto-Loader.';
useCustomLightboxSetting.defaultValue = true;

export const customLightboxShowNavSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Custom Lightbox Show Nav');
customLightboxShowNavSetting.description = 'Sets wether the Lightbox Navigation (next/prev) is shown in the Custom Lightbox.';
customLightboxShowNavSetting.defaultValue = true;

customSettings.loadSettings();

export const requestHelper = new window.FARequestHelper(2);

if (customSettings.isFeatureEnabled) {
    const matchList = new window.FAMatchList(customSettings);
    matchList.matches = ['net/view'];
    matchList.runInIFrame = false;
    if (matchList.hasMatch) {
        new AutoLoader();
    }
}
