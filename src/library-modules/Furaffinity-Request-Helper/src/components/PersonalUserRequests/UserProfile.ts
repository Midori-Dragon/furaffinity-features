import { RequestContext } from '../../utils/RequestContext';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';

export class UserProfile {
    private readonly _context: RequestContext;

    constructor(context: RequestContext) {
        this._context = context;
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
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['profile'], this._context, signal), action, delay);
    }

    async getProfilebannerPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['profilebanner'], this._context, signal), action, delay);
    }

    async getContactsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['contacts'], this._context, signal), action, delay);
    }

    async getAvatarPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(UserProfile.hardLinks['avatar'], this._context, signal), action, delay);
    }
}
