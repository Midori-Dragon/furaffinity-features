import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
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

    async getSettingsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(AccountInformation.hardLinks['settings'], this._semaphore, signal), action, delay);
    }

    async getSiteSettingsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(AccountInformation.hardLinks['siteSettings'], this._semaphore, signal), action, delay);
    }

    async getUserSettingsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(AccountInformation.hardLinks['userSettings'], this._semaphore, signal), action, delay);
    }
}
