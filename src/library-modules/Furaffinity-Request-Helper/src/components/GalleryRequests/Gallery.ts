import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { Page } from './Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { GalleryRequests, GalleryType } from '../../modules/GalleryRequests';
import { IGalleryFolder } from '../../types/GalleryFolder';
import { convertToNumber } from '../../utils/GeneralUtils';

export class Gallery {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/gallery/';
    }

    async getSubmissionPageNo(username: string, submissionId?: string | number, folder?: IGalleryFolder, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<number> {
        submissionId = convertToNumber(submissionId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            (percentId) => GalleryRequests.getSubmissionPageNo(username, submissionId as number | undefined, folder, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore, percentId),
            action, delay
        );
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresTillId(username, undefined, toId as number | undefined, undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSinceId(username, undefined, fromId as number | undefined, undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenIds(username, undefined, fromId as number | undefined, toId as number | undefined, undefined, undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresInFolderBetweenIds(username: string, folder?: IGalleryFolder, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresTillId(username, folder, toId as number | undefined, undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSinceId(username, folder, fromId as number | undefined, undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenIds(username, folder, fromId as number | undefined, toId as number | undefined, undefined, undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresBetweenIdsBetweenPages(username: string, fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresTillId(username, undefined, toId as number | undefined, fromPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSinceId(username, undefined, fromId as number | undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenIds(username, undefined, fromId as number | undefined, toId as number | undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresInFolderBetweenIdsBetweenPages(username: string, folder?: IGalleryFolder, fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresTillId(username, folder, toId as number | undefined, fromPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSinceId(username, folder, fromId as number | undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenIds(username, folder, fromId as number | undefined, toId as number | undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresBetweenPages(username: string, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresTillPage(username, undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSincePage(username, undefined, fromPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenPages(username, undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresInFolderBetweenPages(username: string, folder?: IGalleryFolder, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresTillPage(username, folder, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSincePage(username, folder, fromPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenPages(username, folder, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.GALLERY, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFigures(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => GalleryRequests.getGalleryFigures(username, undefined, pageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
            action, delay
        );
    }

    async getFiguresInFolder(username: string, folder?: IGalleryFolder, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => GalleryRequests.getGalleryFigures(username, folder, pageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
            action, delay
        );
    }

    async getPage(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => Page.getGalleryPage(username, undefined, pageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
            action, delay
        );
    }

    async getPageInFolder(username: string, folder?: IGalleryFolder, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => Page.getGalleryPage(username, folder, pageNumber as number | undefined, GalleryType.GALLERY, this._semaphore),
            action, delay
        );
    }
}
