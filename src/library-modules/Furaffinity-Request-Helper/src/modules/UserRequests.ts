import { WaitAndCallAction } from '../utils/WaitAndCallAction';
import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
import { FuraffinityRequests } from './FuraffinityRequests';
import { GalleryRequests } from './GalleryRequests';
import { SearchRequests } from './SearchRequests';
import { Logger } from '../../../GlobalUtils/src/Logger';

export class UserRequests {
    readonly GalleryRequests: GalleryRequests;
    readonly SearchRequests: SearchRequests;

    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.GalleryRequests = new GalleryRequests(this._semaphore);
        this.SearchRequests = new SearchRequests(this._semaphore);
    }

    static get hardLinks(): Record<string, string> {
        return {
            user: FuraffinityRequests.fullUrl + '/user/',
            watch: FuraffinityRequests.fullUrl + '/watch/',
            unwatch: FuraffinityRequests.fullUrl + '/unwatch/',
            block: FuraffinityRequests.fullUrl + '/block/',
            unblock: FuraffinityRequests.fullUrl + '/unblock/',
        };
    }

    async getUserPage(username?: string, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._getUserPage(username), action, delay);
    }

    async watchUser(username?: string, watchKey?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<boolean> {
        return await WaitAndCallAction.callFunctionAsync(() => this._watchUser(username, watchKey), action, delay);
    }

    async unwatchUser(username?: string, unwatchKey?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<boolean> {
        return await WaitAndCallAction.callFunctionAsync(() => this._unwatchUser(username, unwatchKey), action, delay);
    }

    async blockUser(username?: string, blockKey?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<boolean> {
        return await WaitAndCallAction.callFunctionAsync(() => this._blockUser(username, blockKey), action, delay);
    }

    async unblockUser(username?: string, unblockKey?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<boolean> {
        return await WaitAndCallAction.callFunctionAsync(() => this._unblockUser(username, unblockKey), action, delay);
    }

    private async _getUserPage(username: string | undefined): Promise<Document | undefined> {
        if (username == null) {
            Logger.logWarning('No username given');
            return;
        }
        const url = UserRequests.hardLinks['user'] + username;
        return await FuraffinityRequests.getHTML(url, this._semaphore);
    }

    private async _watchUser(username: string | undefined, watchKey: string | number | undefined): Promise<boolean> {
        if (username == null || username === '') {
            Logger.logError('No username given');
            return false;
        }
        if (watchKey == null || watchKey === '' || watchKey === -1) {
            Logger.logError('No watch key given');
            return false;
        }
        const url = UserRequests.hardLinks['watch'] + username + '?key=' + watchKey;
        return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
    }

    private async _unwatchUser(username: string | undefined, unwatchKey: string | number | undefined): Promise<boolean> {
        if (username == null || username === '') {
            Logger.logError('No username given');
            return false;
        }
        if (unwatchKey == null || unwatchKey === '' || unwatchKey === -1) {
            Logger.logError('No unwatch key given');
            return false;
        }
        const url = UserRequests.hardLinks['unwatch'] + username + '?key=' + unwatchKey;
        return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
    }

    private async _blockUser(username: string | undefined, blockKey: string | number | undefined): Promise<boolean> {
        if (username == null || username === '') {
            Logger.logError('No username given');
            return false;
        }
        if (blockKey == null || blockKey === '' || blockKey === -1) {
            Logger.logError('No block key given');
            return false;
        }
        const url = UserRequests.hardLinks['block'] + username + '?key=' + blockKey;
        return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
    }

    private async _unblockUser(username: string | undefined, unblockKey: string | number | undefined): Promise<boolean> {
        if (username == null || username === '') {
            Logger.logError('No username given');
            return false;
        }
        if (unblockKey == null || unblockKey === '' || unblockKey === -1) {
            Logger.logError('No unblock key given');
            return false;
        }
        const url = UserRequests.hardLinks['unblock'] + username + '?key=' + unblockKey;
        return await FuraffinityRequests.getHTML(url, this._semaphore) == null;
    }
}
