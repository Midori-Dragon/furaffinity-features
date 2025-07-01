import { CustomPage } from '../../../library-modules/Furaffinity-Custom-Pages/src/modules/CustomPage';
import { CustomData } from '../../../library-modules/Furaffinity-Custom-Pages/src/modules/CustomData';
import { Settings } from '../../../library-modules/Furaffinity-Custom-Settings/src/modules/Settings';
import { SettingType } from '../../../library-modules/Furaffinity-Custom-Settings/src/utils/SettingType';
import { MatchList } from '../../../library-modules/Furaffinity-Match-List/src/modules/MatchList';
import { FuraffinityRequests } from '../../../library-modules/Furaffinity-Request-Helper/src/modules/FuraffinityRequests';
import { BuddyListManager } from './modules/BuddyListManager';
import { WatchesFavoritesPage } from './modules/WatchesFavoritesPage';
import { LoadingSpinner } from '../../../library-modules/Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import { WatchScanButton } from './components/WatchScanButton';
import { LastSidList } from './utils/LastSidList';
import { MessageBox } from '../../../library-modules/Furaffinity-Message-Box/src/modules/MessageBox';
import { DialogResult } from '../../../library-modules/Furaffinity-Message-Box/src/components/DialogResult';
import { MessageBoxButtons } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxButtons';
import { MessageBoxIcon } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxIcon';
import { WatchesFavoritesMenuButton } from './components/WatchesFavoritesMenuButton';

declare global {
    interface Window {
        FACustomSettings: typeof Settings;
        FASettingType: typeof SettingType;
        FARequestHelper: typeof FuraffinityRequests;
        FAMatchList: typeof MatchList;
        FACustomPage: typeof CustomPage;
        FALoadingSpinner: typeof LoadingSpinner;
        FAMessageBox: typeof MessageBox;
        FAMessageBoxButtons: typeof MessageBoxButtons;
        FAMessageBoxIcon: typeof MessageBoxIcon;
        FADialogResult: typeof DialogResult;
    }
}

export const scriptName = 'FA Watches Favorites Viewer';

const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);

export const maxFavsAmountSetting = customSettings.newSetting(window.FASettingType.Number, 'Max Favs Amount');
maxFavsAmountSetting.description = 'Sets the maximum number of Favs scanned per Watch.';
maxFavsAmountSetting.defaultValue = 100;

export const showDublicateFavsSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Show Dublicate Favs');
showDublicateFavsSetting.description = 'Sets wether to show dublicate Submissions. (when multiple people Faved the same Submission)';
showDublicateFavsSetting.defaultValue = false;

export const showFavFromWatcherSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Show Fav From Watcher');
showFavFromWatcherSetting.description = 'Sets wether to show from which watch the Fav comes.';
showFavFromWatcherSetting.defaultValue = true;

export const loadingSpinSpeedSetting = customSettings.newSetting(window.FASettingType.Number, 'Loading Animation Speed');
loadingSpinSpeedSetting.description = 'The duration that the loading animation of the Embedded element to load takes for a full rotation in milliseconds.';
loadingSpinSpeedSetting.defaultValue = 1000;

export const showDetailedMadeByTextSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Show Detailed "Made By" Text');
showDetailedMadeByTextSetting.description = 'Sets wether to show "Made By" and "Faved by" instead of "By" and "From" text.';
showDetailedMadeByTextSetting.defaultValue = true;

export const resetLastSeenFavsSetting = customSettings.newSetting(window.FASettingType.Action, 'Reset Last Seen Favs');
resetLastSeenFavsSetting.description = 'Resets the last seen favs variable to reinitialize the Fav-Scanner.';
resetLastSeenFavsSetting.addEventListener('input', () => {
    void MessageBox.show('Are you sure you want to reset the last seen favs?', 'Confirm Reset', MessageBoxButtons.YesNo, MessageBoxIcon.Question).then(async (result) => {
        if (result === DialogResult.Yes) {
            await LastSidList.clearSidList();
        }
    });
});

export const showIgnoreListSetting = customSettings.newSetting(window.FASettingType.Action, 'Show Ignore List');
showIgnoreListSetting.description = 'Opens the Ignore List in a new Tab.';
showIgnoreListSetting.addEventListener('input', () => {
    window.open('https://www.furaffinity.net/controls/buddylist?mode=wfv-buddylist', '_blank');
});

export const showLastWatchesFavoritesSetting = customSettings.newSetting(window.FASettingType.Action, 'Show Last Favs');
showLastWatchesFavoritesSetting.description = 'Opens the last Watches Favorites in a new Tab.';
showLastWatchesFavoritesSetting.addEventListener('input', () => {
    window.open('https://www.furaffinity.net/msg/submissions?mode=wfv-favorites', '_blank');
});

customSettings.loadSettings();

export const requestHelper = new window.FARequestHelper(2);

if (customSettings.isFeatureEnabled) {
    const matchList = new window.FAMatchList(customSettings);
    matchList.matches = ['furaffinity.net'];
    matchList.runInIFrame = false;
    if (matchList.hasMatch) {
        const pageBuddyListEdit = new window.FACustomPage('controls/buddylist', 'mode');
        pageBuddyListEdit.addEventListener('onOpen', (event: Event) => {
            const customEvent = event as CustomEvent<CustomData>;
            const mode = customEvent.detail.parameterValue;
            if (mode === 'wfv-buddylist') {
                new BuddyListManager();
            }
        });
        pageBuddyListEdit.checkPageOpened();

        const watchesFavoritesPage = new window.FACustomPage('net/msg/submissions', 'mode');
        watchesFavoritesPage.addEventListener('onOpen', (event: Event) => {
            const customEvent = event as CustomEvent<CustomData>;
            const mode = customEvent.detail.parameterValue;
            if (mode === 'wfv-favorites') {
                new WatchesFavoritesPage();
            }
        });
        watchesFavoritesPage.checkPageOpened();

        new WatchScanButton();
        new WatchesFavoritesMenuButton();
    }
}
