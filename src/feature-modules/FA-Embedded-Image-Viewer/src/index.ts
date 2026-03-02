import type { CustomPage } from '../../../library-modules/Furaffinity-Custom-Pages/src/modules/CustomPage';
import type { Settings } from '../../../library-modules/Furaffinity-Custom-Settings/src/modules/Settings';
import type { SettingType } from '../../../library-modules/Furaffinity-Custom-Settings/src/utils/SettingType';
import type { LoadingSpinner } from '../../../library-modules/Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import type { LoadingTextSpinner } from '../../../library-modules/Furaffinity-Loading-Animations/src/components/LoadingTextSpinner';
import type { MatchList } from '../../../library-modules/Furaffinity-Match-List/src/modules/MatchList';
import type { FuraffinityRequests } from '../../../library-modules/Furaffinity-Request-Helper/src/modules/FuraffinityRequests';
import type { CustomImageViewer } from '../../../library-modules/Furaffinity-Submission-Image-Viewer/src/modules/CustomImageViewer';
import type { MessageBox } from '../../../library-modules/Furaffinity-Message-Box/src/modules/MessageBox';
import type { MessageBoxButtons } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxButtons';
import type { MessageBoxIcon } from '../../../library-modules/Furaffinity-Message-Box/src/components/MessageBoxIcon';
import { EmbeddedImage } from './modules/EmbeddedImage';
import { downloadImage } from './utils/Utils';

declare global {
    interface Window {
        FACustomSettings: typeof Settings;
        FASettingType: typeof SettingType;
        FARequestHelper: typeof FuraffinityRequests;
        FAMatchList: typeof MatchList;
        FACustomPage: typeof CustomPage;
        FAImageViewer: typeof CustomImageViewer;
        FALoadingSpinner: typeof LoadingSpinner;
        FALoadingTextSpinner: typeof LoadingTextSpinner;
        FAMessageBox: typeof MessageBox;
        FAMessageBoxButtons: typeof MessageBoxButtons;
        FAMessageBoxIcon: typeof MessageBoxIcon;
    }
}

export const scriptName = 'FA Embedded Image Viewer';

const customSettings = new window.FACustomSettings('Furaffinity Features Settings', `${scriptName} Settings`);

export const openInNewTabSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Open in new Tab');
openInNewTabSetting.description = 'Wether to open links in a new Tab or the current one.';
openInNewTabSetting.defaultValue = true;

export const loadingSpinSpeedFavSetting = customSettings.newSetting(window.FASettingType.Number, 'Fav Loading Animation');
loadingSpinSpeedFavSetting.description = 'The duration that the loading animation, for faving a submission, takes for a full rotation in milliseconds.';
loadingSpinSpeedFavSetting.defaultValue = 600;

export const loadingSpinSpeedSetting = customSettings.newSetting(window.FASettingType.Number, 'Embedded Loading Animation');
loadingSpinSpeedSetting.description = 'The duration that the loading animation of the Embedded element to load takes for a full rotation in milliseconds.';
loadingSpinSpeedSetting.defaultValue = 1000;

export const closeEmbedAfterOpenSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Close Embed after open');
closeEmbedAfterOpenSetting.description = 'Wether to close the current embedded Submission after it is opened in a new Tab (also for open Gallery).';
closeEmbedAfterOpenSetting.defaultValue = true;

export const previewQualitySetting = customSettings.newSetting(window.FASettingType.Option, 'Preview Quality');
previewQualitySetting.description = 'The quality of the preview image. (Higher values will be slower, Auto will pick the quality that is already used by the gallery and therefore should be the fastest)';
previewQualitySetting.defaultValue = 0;
previewQualitySetting.options = {
    0: 'Auto detect',
    200: 'Lower (200px)',
    300: 'Low (300px)',
    400: 'Medium (400px)',
    500: 'High (500px)',
    600: 'Higher (600px)',
};

export const enableInMinigallerySetting = customSettings.newSetting(window.FASettingType.Boolean, 'Enable in Minigallery');
enableInMinigallerySetting.description = 'Wether to enable the Embedded Image Viewer in the Mini-Gallery on the Submission page.';
enableInMinigallerySetting.defaultValue = true;

export const showWatchingInfoSetting = customSettings.newSetting(window.FASettingType.Boolean, 'Show Watching Info');
showWatchingInfoSetting.description = 'Wether to show if the user is watching the Submissions Author. (Will be slower)';
showWatchingInfoSetting.defaultValue = false;

customSettings.loadSettings();

export const requestHelper = new window.FARequestHelper(2);

if (customSettings.isFeatureEnabled) {
    const matchList = new window.FAMatchList(customSettings);
    matchList.matches = ['net/browse', 'net/user', 'net/gallery', 'net/search', 'net/favorites', 'net/scraps', 'net/controls/favorites', 'net/controls/submissions', 'net/msg/submissions', 'd.furaffinity.net'];
    if (enableInMinigallerySetting.value) {
        matchList.matches.push('net/view');
    }
    matchList.runInIFrame = true;
    if (matchList.hasMatch) {
        const page = new window.FACustomPage('d.furaffinity.net', 'eiv-download');
        let pageDownload = false;
        page.addEventListener('onOpen', (): void => {
            downloadImage();
            pageDownload = true;
        });
        page.checkPageOpened();

        if (!pageDownload && !matchList.isWindowIFrame) {
            void EmbeddedImage.addEmbeddedEventForAllFigures();
            window.addEventListener('ei-update-embedded', () => {
                void EmbeddedImage.addEmbeddedEventForAllFigures();
            });
        }
    }
}
