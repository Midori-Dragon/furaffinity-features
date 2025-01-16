import { InfiniGallery } from './modules/InfiniGallery';
import { Settings } from '../../Furaffinity-Custom-Settings/src/modules/Settings';
import { FuraffinityRequests } from '../../Furaffinity-Request-Helper/src/modules/FuraffinityRequests';
import { SettingType } from '../../Furaffinity-Custom-Settings/src/utils/SettingType';
import { MatchList } from '../../Furaffinity-Match-List/src/modules/MatchList';
import { LoadingSpinner } from '../../Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import { GMInfo } from '../../GlobalUtils/src/utils/Browser-API/GMInfo';

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

const customSettings = new window.FACustomSettings();
customSettings.extensionName = 'Extension Settings';
customSettings.provider = 'Midori\'s Script Settings';
customSettings.headerName = `${GMInfo.scriptName} Settings`;

export const showPageSeparatorSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Page Separator');
showPageSeparatorSetting.description = 'Set wether a Page Separator is shown for each new Page loaded. Default: Show Page Separators';
showPageSeparatorSetting.defaultValue = true;

export const pageSeparatorTextSetting = customSettings.newSetting(window.FASettingType.Text, 'Page Separator Text');
pageSeparatorTextSetting.description = 'The Text that is displayed when a new Infini-Gallery Page is loaded (if shown). Number of Page gets inserted instead of: %page% .';
pageSeparatorTextSetting.defaultValue = 'Infini-Gallery Page: %page%';
pageSeparatorTextSetting.verifyRegex = /%page%/;

customSettings.loadSettingsMenu();

const matchList = new window.FAMatchList(customSettings);
matchList.matches = ['net/gallery', 'net/favorites', 'net/scraps', 'net/browse', 'net/search'];
matchList.runInIFrame = false;

export const requestHelper = new window.FARequestHelper(2);

if (matchList.hasMatch) {
    const infiniGallery = new InfiniGallery();
    infiniGallery.startScrollDetection();
}
