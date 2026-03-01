import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { convertToNumber } from '../../utils/GeneralUtils';
import { Logger } from '../../../../GlobalUtils/src/Logger';
import { elementsTillId, elementsSinceId, elementsBetweenIds, elementsTillPage, elementsSincePage, elementsBetweenPages, findElementPageNo } from '../../utils/FigurePagingUtils';

export class Journals {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/journals/';
    }

    static async fetchPage(username: string | undefined, pageNumber: number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (username == null) {
            Logger.logError('No username given');
            return;
        }
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
            pageNumber = 1;
        }
        if (!username.endsWith('/')) {
            username += '/';
        }
        const url = Journals.hardLink + username;
        return await FuraffinityRequests.getHTML(url + pageNumber, semaphore);
    }

    async getJournalPageNo(username: string, journalId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<number> {
        journalId = convertToNumber(journalId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            (percentId) => findElementPageNo((pg) => this._getSections(username, pg), journalId as number | undefined, 'jid-', fromPageNumber as number | undefined, toPageNumber as number | undefined, percentId),
            action, delay
        );
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsTillId((pg) => this._getSections(username, pg), toId as number | undefined, undefined),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsSinceId((pg) => this._getSections(username, pg), fromId as number | undefined, undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsBetweenIds((pg) => this._getSections(username, pg), fromId as number | undefined, toId as number | undefined, undefined, undefined),
                action, delay
            );
        }
    }

    async getFiguresBetweenIdsBetweenPages(username: string, fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsTillId((pg) => this._getSections(username, pg), toId as number | undefined, fromPageNumber as number | undefined),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsSinceId((pg) => this._getSections(username, pg), fromId as number | undefined, toPageNumber as number | undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsBetweenIds((pg) => this._getSections(username, pg), fromId as number | undefined, toId as number | undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined),
                action, delay
            );
        }
    }

    async getSectionsBetweenPages(username: string, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => elementsTillPage((pg) => this._getSections(username, pg), toPageNumber as number | undefined, percentId),
                action, delay
            );
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsSincePage((pg) => this._getSections(username, pg), fromPageNumber as number | undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => elementsBetweenPages((pg) => this._getSections(username, pg), fromPageNumber as number | undefined, toPageNumber as number | undefined, percentId),
                action, delay
            );
        }
    }

    async getSections(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => this._getSections(username, pageNumber as number | undefined),
            action, delay
        );
    }

    async getPage(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => Journals.fetchPage(username, pageNumber as number | undefined, this._semaphore),
            action, delay
        );
    }

    private async _getSections(username: string, pageNumber: number | undefined): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('pageNumber must be greater than 0. Using default 1 instead.');
            pageNumber = 1;
        }

        Logger.logInfo(`Getting Journals of "${username}" on page "${pageNumber}".`);

        const galleryDoc = await Journals.fetchPage(username, pageNumber, this._semaphore);
        if (!galleryDoc) {
            Logger.logWarning(`No journals found at "${username}" on page "${pageNumber}".`);
            return [];
        }

        const columnPage = galleryDoc.getElementById('columnpage');
        if (!columnPage) {
            Logger.logWarning(`No column page found at "${username}" on page "${pageNumber}".`);
            return [];
        }
        const sections = columnPage.getElementsByTagName('section');
        if (sections == null || sections.length === 0) {
            Logger.logWarning(`No journals found at "${username}" on page "${pageNumber}".`);
            return [];
        }

        return Array.from(sections);
    }
}
