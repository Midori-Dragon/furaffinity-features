import { InfiniGallery } from './modules/InfiniGallery';
import type { Settings } from '../../../library-modules/Furaffinity-Custom-Settings/src/modules/Settings';
import type { FuraffinityRequests } from '../../../library-modules/Furaffinity-Request-Helper/src/modules/FuraffinityRequests';
import type { SettingType } from '../../../library-modules/Furaffinity-Custom-Settings/src/utils/SettingType';
import type { MatchList } from '../../../library-modules/Furaffinity-Match-List/src/modules/MatchList';
import type { LoadingSpinner } from '../../../library-modules/Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import type { MessageBox } from '../../../library-modules/Furaffinity-Message-Box/src/modules/MessageBox';
import type { MessageBoxButtons } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxButtons';
import type { MessageBoxIcon } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxIcon';

declare global {
    interface Window {
        FACustomSettings: typeof Settings;
        FASettingType: typeof SettingType;
        FARequestHelper: typeof FuraffinityRequests;
        BrowseOptions: typeof FuraffinityRequests.Types.BrowseOptions;
        SearchOptions: typeof FuraffinityRequests.Types.SearchOptions;
        FAMatchList: typeof MatchList;
        FALoadingSpinner: typeof LoadingSpinner;
        FAMessageBox: typeof MessageBox;
        FAMessageBoxButtons: typeof MessageBoxButtons;
        FAMessageBoxIcon: typeof MessageBoxIcon;
    }
}

export const scriptName = 'FA Infini-Gallery';

const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);

export const showPageSeparatorSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Page Separator');
showPageSeparatorSetting.description = 'Set wether a Page Separator is shown for each new Page loaded. Default: Show Page Separators';
showPageSeparatorSetting.defaultValue = true;

export const pageSeparatorTextSetting = customSettings.newSetting(window.FASettingType.Text, 'Page Separator Text');
pageSeparatorTextSetting.description = 'The Text that is displayed when a new Infini-Gallery Page is loaded (if shown). Number of Page gets inserted instead of: %page% .';
pageSeparatorTextSetting.defaultValue = 'Infini-Gallery Page: %page%';
pageSeparatorTextSetting.verifyRegex = /%page%/;

customSettings.loadSettings();

export const requestHelper = new window.FARequestHelper(2);

if (customSettings.isFeatureEnabled) {
    const matchList = new window.FAMatchList(customSettings);
    matchList.matches = ['net/gallery', 'net/favorites', 'net/scraps', 'net/browse', 'net/search', 'net/controls/buddylist'];
    matchList.runInIFrame = false;
    if (matchList.hasMatch) {
        const infiniGallery = new InfiniGallery();
        infiniGallery.startScrollDetection();
    }
}
