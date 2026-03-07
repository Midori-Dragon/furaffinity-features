import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';

export class UserProfile {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLinks(): Record<string, string> {
        return {
            profile: FuraffinityRequests.fullUrl + '/controls/profile/',
            profilebanner: FuraffinityRequests.fullUrl + '/controls/profilebanner/',
            contacts: FuraffinityRequests.fullUrl + '/controls/contacts/',
            avatar: FuraffinityRequests.fullUrl + '/controls/avatar/',
        };
    }

    async getProfilePage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['profile'], this._semaphore, signal), action, delay);
    }

    async getProfilebannerPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['profilebanner'], this._semaphore, signal), action, delay);
    }

    async getContactsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['contacts'], this._semaphore, signal), action, delay);
    }

    async getAvatarPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['avatar'], this._semaphore, signal), action, delay);
    }
}
