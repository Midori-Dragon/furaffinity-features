import { CustomPage } from '../../Furaffinity-Custom-Pages/src/modules/CustomPage';
import { Settings } from '../../Furaffinity-Custom-Settings/src/modules/Settings';
import { SettingType } from '../../Furaffinity-Custom-Settings/src/utils/SettingType';
import { LoadingSpinner } from '../../Furaffinity-Loading-Animations/src/components/LoadingSpinner';
import { LoadingTextSpinner } from '../../Furaffinity-Loading-Animations/src/components/LoadingTextSpinner';
import { MatchList } from '../../Furaffinity-Match-List/src/modules/MatchList';
import { FuraffinityRequests } from '../../Furaffinity-Request-Helper/src/modules/FuraffinityRequests';
import { CustomImageViewer } from '../../Furaffinity-Submission-Image-Viewer/src/modules/CustomImageViewer';
import { GMInfo } from '../../GlobalUtils/src/utils/Browser-API/GMInfo';
import { Logger, LogLevel } from '../../GlobalUtils/src/utils/Logger';
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
        __FF_GLOBAL_LOG_LEVEL__: LogLevel;
    }
}

const customSettings = new window.FACustomSettings();
customSettings.extensionName = 'Extension Settings';
customSettings.provider = 'Midori\'s Script Settings';
customSettings.headerName = `${GMInfo.scriptName} Settings`;

export const loggingSetting = customSettings.newSetting(window.FASettingType.Number, 'Logging');
loggingSetting.description = 'The logging level. 0 = none, 1 = errors, 2 = warnings, 3 = infos.';
loggingSetting.defaultValue = window.__FF_GLOBAL_LOG_LEVEL__ ?? LogLevel.Error;
loggingSetting.action = (): void => Logger.setLogLevel(loggingSetting.value);
Logger.setLogLevel(loggingSetting.value);

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

export const previewQualitySetting = customSettings.newSetting(window.FASettingType.Number, 'Preview Quality');
previewQualitySetting.description = 'The quality of the preview image. Value range is 2-6. (Higher values can be slower)';
previewQualitySetting.defaultValue = 3;

customSettings.loadSettingsMenu();

export const requestHelper = new window.FARequestHelper(2);

const matchList = new window.FAMatchList(customSettings);
matchList.matches = ['net/browse', 'net/user', 'net/gallery', 'net/search', 'net/favorites', 'net/scraps', 'net/controls/favorites', 'net/controls/submissions', 'net/msg/submissions', 'd.furaffinity.net'];
matchList.runInIFrame = true;
if (matchList.hasMatch) {
    const page = new window.FACustomPage('d.furaffinity.net', 'ei-download');
    let pageDownload = false;
    page.onopen = (): void => {
        downloadImage();
        pageDownload = true;
    };
    page.checkPageOpened();

    if (!pageDownload && !matchList.isWindowIFrame) {
        void EmbeddedImage.addEmbeddedEventForAllFigures();
        window.addEventListener('ei-update-embedded', () => {
            void EmbeddedImage.addEmbeddedEventForAllFigures();
        });
    }
}
