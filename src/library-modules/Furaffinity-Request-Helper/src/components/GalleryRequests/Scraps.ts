import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { convertToNumber } from '../../utils/GeneralUtils';
import { elementsTillId, elementsSinceId, elementsBetweenIds, elementsTillPage, elementsSincePage, elementsBetweenPages, findElementPageNo } from '../../utils/FigurePagingUtils';
import checkTagsAll from '../../../../GlobalUtils/src/FA-Functions/checkTagsAll';
import { Logger } from '../../../../GlobalUtils/src/Logger';

export class Scraps {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/scraps/';
    }

    static async fetchPage(username: string | undefined, pageNumber: number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (username == null) {
            Logger.logError('No username given');
            return;
        }
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No page number given. Using default value of 1.');
            pageNumber = 1;
        }
        if (!username.endsWith('/')) {
            username += '/';
        }
        const page = await FuraffinityRequests.getHTML(Scraps.hardLink + username + pageNumber, semaphore);
        checkTagsAll(page);
        return page;
    }

    private async _fetchFigures(username: string, pageNumber: number | undefined): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            pageNumber = 1;
        }
        Logger.logInfo(`Getting scraps of "${username}" on page "${pageNumber}".`);
        const galleryDoc = await Scraps.fetchPage(username, pageNumber, this._semaphore);
        if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
            Logger.logInfo(`No images found at scraps of "${username}" on page "${pageNumber}".`);
            return [];
        }
        const figures = galleryDoc.getElementsByTagName('figure');
        if (figures == null || figures.length === 0) {
            Logger.logInfo(`No figures found at scraps of "${username}" on page "${pageNumber}".`);
            return [];
        }
        return Array.from(figures);
    }

    async getSubmissionPageNo(username: string, submissionId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<number> {
        submissionId = convertToNumber(submissionId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            (percentId) => findElementPageNo((page) => this._fetchFigures(username, page), submissionId as number | undefined, 'sid-', fromPageNumber as number | undefined, toPageNumber as number | undefined, percentId),
            action, delay
        );
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsTillId((page) => this._fetchFigures(username, page), toId as number | undefined, undefined),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsSinceId((page) => this._fetchFigures(username, page), fromId as number | undefined, undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => elementsBetweenIds((page) => this._fetchFigures(username, page), fromId as number | undefined, toId as number | undefined, undefined, undefined, percentId),
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
                () => elementsTillId((page) => this._fetchFigures(username, page), toId as number | undefined, fromPageNumber as number | undefined),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsSinceId((page) => this._fetchFigures(username, page), fromId as number | undefined, toPageNumber as number | undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => elementsBetweenIds((page) => this._fetchFigures(username, page), fromId as number | undefined, toId as number | undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, percentId),
                action, delay
            );
        }
    }

    async getFiguresBetweenPages(username: string, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => elementsTillPage((page) => this._fetchFigures(username, page), toPageNumber as number | undefined, percentId),
                action, delay
            );
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => elementsSincePage((page) => this._fetchFigures(username, page), fromPageNumber as number | undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => elementsBetweenPages((page) => this._fetchFigures(username, page), fromPageNumber as number | undefined, toPageNumber as number | undefined, percentId),
                action, delay
            );
        }
    }

    async getFigures(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => this._fetchFigures(username, pageNumber as number | undefined),
            action, delay
        );
    }

    async getPage(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => Scraps.fetchPage(username, pageNumber as number | undefined, this._semaphore),
            action, delay
        );
    }
}
