import { FuraffinityRequests } from './modules/FuraffinityRequests';
import { DEFAULT_REQUEST_INTERVAL } from './utils/GlobalRateLimiter';
import { registerGlobalSetting } from '../../GlobalUtils/src/GlobalSettingsRegistry';
import type { Settings } from '../../Furaffinity-Custom-Settings/src/modules/Settings';
import type { SettingType } from '../../Furaffinity-Custom-Settings/src/utils/SettingType';

declare global {
    interface Window {
        FASettingType: typeof SettingType;
    }
}

Object.defineProperties(window, {
    FARequestHelper: { get: () => FuraffinityRequests }
});

registerGlobalSetting((settings: Settings): void => {
    const rateLimitSetting = settings.newSetting(window.FASettingType.Number, 'Request Rate Limit');
    rateLimitSetting.description = 'Minimum time in milliseconds between requests made by Furaffinity Features. Keep at 1000ms or higher to follow Furaffinity\'s third-party traffic guidelines.';
    rateLimitSetting.defaultValue = DEFAULT_REQUEST_INTERVAL;
    rateLimitSetting.min = 100;
    rateLimitSetting.max = 60000;
    rateLimitSetting.step = 100;
    rateLimitSetting.addEventListener('input', (): void => {
        FuraffinityRequests.requestInterval = rateLimitSetting.value;
    });
    FuraffinityRequests.requestInterval = rateLimitSetting.value;
});
