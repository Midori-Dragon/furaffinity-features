import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../utils/Semaphore';
import { Page } from '../GalleryRequests/Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { GalleryRequests, GalleryType } from '../../modules/GalleryRequests';
import { convertToNumber } from '../../utils/GeneralUtils';

export class Scraps {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/scraps/';
    }

    async getSubmissionPageNo(username : string, submissionId?: string | number, folderId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<number> {
        submissionId = convertToNumber(submissionId);
        folderId = convertToNumber(folderId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getSubmissionPageNo, [username, submissionId, folderId, fromPageNumber, toPageNumber, GalleryType.SCRAPS, this._semaphore], action, delay);
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillId, [username, undefined, toId, undefined, GalleryType.SCRAPS, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSinceId, [username, undefined, fromId, undefined, GalleryType.SCRAPS, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenIds, [username, undefined, fromId, toId, undefined, undefined, GalleryType.SCRAPS, this._semaphore], action, delay, true);
        }
    }

    async getFiguresBetweenIdsBetweenPages(username: string, fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillId, [username, undefined, toId, fromPageNumber, GalleryType.SCRAPS, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSinceId, [username, undefined, fromId, toPageNumber, GalleryType.SCRAPS, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenIds, [username, undefined, fromId, toId, fromPageNumber, toPageNumber, GalleryType.SCRAPS, this._semaphore], action, delay, true);
        }
    }

    async getFiguresBetweenPages(username: string, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromPageNumber == null ||fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillPage, [username, undefined, toPageNumber, GalleryType.SCRAPS, this._semaphore], action, delay, true);
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSincePage, [username, undefined, fromPageNumber, GalleryType.SCRAPS, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenPages, [username, undefined, fromPageNumber, toPageNumber, GalleryType.SCRAPS, this._semaphore], action, delay, true);
        }
    }

    async getFigures(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFigures, [username, undefined, pageNumber, GalleryType.SCRAPS, this._semaphore], action, delay);
    }

    async getPage(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(Page.getGalleryPage, [username, undefined, pageNumber, GalleryType.SCRAPS, this._semaphore], action, delay);
    }
}
