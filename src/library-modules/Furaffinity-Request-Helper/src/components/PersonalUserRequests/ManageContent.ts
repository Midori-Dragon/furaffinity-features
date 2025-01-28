import { Semaphore } from '../../utils/Semaphore';
import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
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

    async getFoldersPages(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [ManageContent.hardLinks['folders'], this._semaphore], action, delay);
    }

    async getAllWatchesPages(action?: (percentId?: string | number) => void, delay = 100): Promise<Document[]> {
        return await WaitAndCallAction.callFunctionAsync(getContentAllWatchesPagesLocal, [this._semaphore], action, delay);
    }

    async getWatchesPage(pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(getWatchesPageLocal, [pageNumber, this._semaphore], action, delay);
    }
}

async function getContentAllWatchesPagesLocal(semaphore: Semaphore): Promise<Document[]> {
    let usersDoc = await FuraffinityRequests.getHTML(ManageContent.hardLinks['buddylist'] + 'x', semaphore);
    const columnPage = usersDoc?.getElementById('columnpage');
    const sectionBody = columnPage?.querySelector('div[class="section-body"');
    const pages = sectionBody?.querySelectorAll(':scope > a');
    const userPageDocs = [];
    if (pages != null) {
        for (let i = 1; i <= pages.length; i++) {
            usersDoc = await getWatchesPageLocal(i, semaphore);
            if (usersDoc) userPageDocs.push(usersDoc);
        }
    }

    return userPageDocs;
}

async function getWatchesPageLocal(pageNumber: number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (pageNumber == null || pageNumber <= 0) {
        Logger.logWarning('No page number given. Using default 1 instead.');
        pageNumber = 1;
    }

    return await FuraffinityRequests.getHTML(ManageContent.hardLinks['buddylist'] + pageNumber, semaphore);
}
