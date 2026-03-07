import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { convertToNumber } from '../../utils/GeneralUtils';
import { Logger } from '../../../../GlobalUtils/src/Logger';

export class ManageContent {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLinks(): Record<string, string> {
        return {
            submissions: FuraffinityRequests.fullUrl + '/controls/submissions/',
            folders: FuraffinityRequests.fullUrl + '/controls/folders/submissions/',
            journals: FuraffinityRequests.fullUrl + '/controls/journal/',
            favorites: FuraffinityRequests.fullUrl + '/controls/favorites/',
            buddylist: FuraffinityRequests.fullUrl + '/controls/buddylist/',
            shouts: FuraffinityRequests.fullUrl + '/controls/shouts/',
            badges: FuraffinityRequests.fullUrl + '/controls/badges/',
        };
    }

    async getFoldersPages(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(ManageContent.hardLinks['folders'], this._semaphore, signal), action, delay);
    }

    async getAllWatchesPages(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document[]> {
        return await WaitAndCallAction.callFunctionAsync(() => this._getAllWatchesPages(signal), action, delay);
    }

    async getWatchesPage(pageNumber?: string | number, signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);
        return await WaitAndCallAction.callFunctionAsync(() => this._getWatchesPage(pageNumber as number | undefined, signal), action, delay);
    }

    private async _getAllWatchesPages(signal?: AbortSignal): Promise<Document[]> {
        let usersDoc = await FuraffinityRequests.getHTML(ManageContent.hardLinks['buddylist'] + 'x', this._semaphore, signal);
        const columnPage = usersDoc?.getElementById('columnpage');
        const sectionBody = columnPage?.querySelector('div[class="section-body"');
        const paginationLinks = sectionBody?.querySelector('div[class*="pagination-links"]');
        const pages = paginationLinks?.querySelectorAll(':scope > a');
        const userPageDocs = [];
        if (pages != null) {
            for (let i = 1; i <= pages.length; i++) {
                usersDoc = await this._getWatchesPage(i, signal);
                if (usersDoc) userPageDocs.push(usersDoc);
            }
        }
        return userPageDocs;
    }

    private async _getWatchesPage(pageNumber: number | undefined, signal?: AbortSignal): Promise<Document | undefined> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No page number given. Using default 1 instead.');
            pageNumber = 1;
        }
        return await FuraffinityRequests.getHTML(ManageContent.hardLinks['buddylist'] + pageNumber, this._semaphore, signal);
    }
}
