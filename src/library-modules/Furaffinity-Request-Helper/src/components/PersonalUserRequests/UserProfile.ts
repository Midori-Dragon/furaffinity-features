import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
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

    async getProfilePage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [UserProfile.hardLinks['profile'], this._semaphore], action, delay);
    }

    async getProfilebannerPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [UserProfile.hardLinks['profilebanner'], this._semaphore], action, delay);
    }

    async getContactsPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [UserProfile.hardLinks['contacts'], this._semaphore], action, delay);
    }

    async getAvatarPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [UserProfile.hardLinks['avatar'], this._semaphore], action, delay);
    }
}
