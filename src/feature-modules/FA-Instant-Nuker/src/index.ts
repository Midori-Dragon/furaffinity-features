import type { Settings } from '../../../library-modules/Furaffinity-Custom-Settings/src/modules/Settings';
import type { SettingType } from '../../../library-modules/Furaffinity-Custom-Settings/src/utils/SettingType';
import type { MatchList } from '../../../library-modules/Furaffinity-Match-List/src/modules/MatchList';
import type { FuraffinityRequests } from '../../../library-modules/Furaffinity-Request-Helper/src/modules/FuraffinityRequests';
import type { MessageBox } from '../../../library-modules/Furaffinity-Message-Box/src/modules/MessageBox';
import type { MessageBoxButtons } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxButtons';
import type { MessageBoxIcon } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxIcon';
import { NukeIconOptions } from './utils/NukeIconOptions';
import { MessageNuker } from './modules/MessageNuker';
import { SubmissionNuker } from './modules/SubmissionNuker';

declare global {
    interface Window {
        FACustomSettings: typeof Settings;
        FASettingType: typeof SettingType;
        FARequestHelper: typeof FuraffinityRequests;
        BrowseOptions: typeof FuraffinityRequests.Types.BrowseOptions;
        SearchOptions: typeof FuraffinityRequests.Types.SearchOptions;
        FAMatchList: typeof MatchList;
        FAMessageBox: typeof MessageBox;
        FAMessageBoxButtons: typeof MessageBoxButtons;
        FAMessageBoxIcon: typeof MessageBoxIcon;
    }
}

export const scriptName = 'FA Instant Nuker';

const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);

export const selectNukeIconSetting = customSettings.newSetting(window.FASettingType.Option, 'Select Nuke Icon');
selectNukeIconSetting.description = 'Select the Nuke Icon to use for the Nuke Button.';
selectNukeIconSetting.options = {
    [NukeIconOptions.Red]: 'Red Nuke Icon',
    [NukeIconOptions.White]: 'White Nuke Icon'
};
selectNukeIconSetting.defaultValue = NukeIconOptions.Red;

customSettings.loadSettings();

export const requestHelper = new window.FARequestHelper(2);

if (customSettings.isFeatureEnabled) {
    const matchListSubmissions = new window.FAMatchList(customSettings);
    matchListSubmissions.matches = ['msg/submissions'];
    matchListSubmissions.runInIFrame = false;
    if (matchListSubmissions.hasMatch) {
        new SubmissionNuker();
    }

    const matchListMessages = new window.FAMatchList(customSettings);
    matchListMessages.matches = ['msg/others'];
    matchListMessages.runInIFrame = false;
    if (matchListMessages.hasMatch) {
        new MessageNuker();
    }
}
