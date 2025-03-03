import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';

export class AccountInformation {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLinks(): Record<string, string> {
        return {
            settings: FuraffinityRequests.fullUrl + '/controls/settings/',
            siteSettings: FuraffinityRequests.fullUrl + '/controls/site-settings/',
            userSettings: FuraffinityRequests.fullUrl + '/controls/user-settings/',
        };
    }

    async getSettingsPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [AccountInformation.hardLinks['settings'], this._semaphore], action, delay);
    }

    async getSiteSettingsPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [AccountInformation.hardLinks['siteSettings'], this._semaphore], action, delay);
    }

    async getUserSettingsPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [AccountInformation.hardLinks['userSettings'], this._semaphore], action, delay);
    }
}
