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

declare global {
    interface Window {
        FACustomSettings: typeof Settings;
        FASettingType: typeof SettingType;
        FARequestHelper: typeof FuraffinityRequests;
        FAMatchList: typeof MatchList;
        FACustomPage: typeof CustomPage;
        FALoadingSpinner: typeof LoadingSpinner;
    }
}

export const scriptName = 'FA Watches Favorites Viewer';

const customSettings = new window.FACustomSettings('Midori\'s Script Settings', `${scriptName} Settings`);

export const showLoadLastXFavsButtonSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Show load last X Favs');
showLoadLastXFavsButtonSetting.description = 'Sets wether the search for similar Pages button is show.';
showLoadLastXFavsButtonSetting.defaultValue = false;

export const maxFavsAmountSetting = customSettings.newSetting(window.FASettingType.Number, 'Max Favs Amount');
maxFavsAmountSetting.description = 'Sets the maximum number of Favs loaded per Watch.';
maxFavsAmountSetting.defaultValue = 100;

export const doImmediateScanSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Do Immediate Scan');
doImmediateScanSetting.description = 'Sets wether a scan is started immediately uppon loading a Page.';
doImmediateScanSetting.defaultValue = false;

export const showDublicateFavsSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Show Dublicate Favs');
showDublicateFavsSetting.description = 'Sets wether to show dublicate Submissions. (when multiple people Faved the same Submission)';
showDublicateFavsSetting.defaultValue = true;

export const loadingSpinSpeedSetting = customSettings.newSetting(window.FASettingType.Number, 'Loading Animation Speed');
loadingSpinSpeedSetting.description = 'The duration that the loading animation of the Embedded element to load takes for a full rotation in milliseconds.';
loadingSpinSpeedSetting.defaultValue = 1000;

export const resetSynchronizationErrorSetting = customSettings.newSetting(window.FASettingType.Action, 'Reset Synchronization');
resetSynchronizationErrorSetting.description = 'Resets the synchronisation to fix errors.';
resetSynchronizationErrorSetting.addEventListener('input', () => {
    console.log('RESET');
});

export const resetLastSeenFavsSetting = customSettings.newSetting(window.FASettingType.Action, 'Reset Last Seen Favs');
resetLastSeenFavsSetting.description = 'Resets the last seen favs variable to reinitialize the Fav-Scanner.';
resetLastSeenFavsSetting.addEventListener('input', () => {
    console.log('RESET');
});

export const showIgnoreListSetting = customSettings.newSetting(window.FASettingType.Action, 'Show Ignore List');
showIgnoreListSetting.description = 'Opens the Ignore List in a new Tab.';
showIgnoreListSetting.addEventListener('input', () => {
    window.open('https://www.furaffinity.net/controls/buddylist?mode=wfv-buddylist', '_blank');
});

customSettings.loadSettings();

export const requestHelper = new window.FARequestHelper(2);

if (customSettings.isFeatureEnabled) {
    const matchList = new window.FAMatchList(customSettings);
    matchList.matches = ['furaffinity.net'];
    matchList.runInIFrame = false;
    if (matchList.hasMatch) {
        console.log('Match');

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
    }
}
