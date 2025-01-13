import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../utils/Semaphore';
import { Page } from './Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { GalleryRequests, GalleryType } from '../../modules/GalleryRequests';
import { convertToNumber } from '../../utils/GeneralUtils';

export class Gallery {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    public static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/gallery/';
    }

    public async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillId, [username, undefined, toId, undefined, GalleryType.GALLERY, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSinceId, [username, undefined, fromId, undefined, GalleryType.GALLERY, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenIds, [username, undefined, fromId, toId, undefined, undefined, GalleryType.GALLERY, this._semaphore], action, delay, true);
        }
    }

    public async getFiguresInFolderBetweenIds(username: string, folderId?: string | number, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        folderId = convertToNumber(folderId);
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillId, [username, folderId, toId, undefined, GalleryType.GALLERY, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSinceId, [username, folderId, fromId, undefined, GalleryType.GALLERY, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenIds, [username, folderId, fromId, toId, undefined, undefined, GalleryType.GALLERY, this._semaphore], action, delay, true);
        }
    }

    public async getFiguresBetweenIdsBetweenPages(username: string, fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillId, [username, undefined, toId, fromPageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSinceId, [username, undefined, fromId, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenIds, [username, undefined, fromId, toId, fromPageNumber, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay, true);
        }
    }

    public async getFiguresInFolderBetweenIdsBetweenPages(username: string, folderId?: string | number, fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        folderId = convertToNumber(folderId);
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillId, [username, folderId, toId, fromPageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSinceId, [username, folderId, fromId, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenIds, [username, folderId, fromId, toId, fromPageNumber, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay, true);
        }
    }

    public async getFiguresBetweenPages(username: string, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillPage, [username, undefined, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay, true);
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSincePage, [username, undefined, fromPageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenPages, [username, undefined, fromPageNumber, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay, true);
        }
    }

    public async getFiguresInFolderBetweenPages(username: string, folderId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        folderId = convertToNumber(folderId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresTillPage, [username, folderId, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay, true);
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresSincePage, [username, folderId, fromPageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFiguresBetweenPages, [username, folderId, fromPageNumber, toPageNumber, GalleryType.GALLERY, this._semaphore], action, delay, true);
        }
    }

    public async getFigures(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFigures, [username, undefined, pageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
    }

    public async getFiguresInFolder(username: string, folderId?: string | number, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        folderId = convertToNumber(folderId);
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(GalleryRequests.getGalleryFigures, [username, folderId, pageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
    }

    public async getPage(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(Page.getGalleryPage, [username, undefined, pageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
    }

    public async getPageInFolder(username: string, folderId?: string | number, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        folderId = convertToNumber(folderId);
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(Page.getGalleryPage, [username, folderId, pageNumber, GalleryType.GALLERY, this._semaphore], action, delay);
    }
}
