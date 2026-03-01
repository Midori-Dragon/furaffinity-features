import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { Page } from './Page';
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

    async getSubmissionPageNo(username: string, submissionId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<number> {
        submissionId = convertToNumber(submissionId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            (percentId) => GalleryRequests.getSubmissionPageNo(username, submissionId as number | undefined, undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore, percentId),
            action, delay
        );
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresTillId(username, undefined, toId as number | undefined, undefined, GalleryType.SCRAPS, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSinceId(username, undefined, fromId as number | undefined, undefined, GalleryType.SCRAPS, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenIds(username, undefined, fromId as number | undefined, toId as number | undefined, undefined, undefined, GalleryType.SCRAPS, this._semaphore, percentId),
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
                () => GalleryRequests.getGalleryFiguresTillId(username, undefined, toId as number | undefined, fromPageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSinceId(username, undefined, fromId as number | undefined, toPageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenIds(username, undefined, fromId as number | undefined, toId as number | undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresBetweenPages(username: string, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresTillPage(username, undefined, toPageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore, percentId),
                action, delay
            );
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => GalleryRequests.getGalleryFiguresSincePage(username, undefined, fromPageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => GalleryRequests.getGalleryFiguresBetweenPages(username, undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFigures(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => GalleryRequests.getGalleryFigures(username, undefined, pageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore),
            action, delay
        );
    }

    async getPage(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => Page.getGalleryPage(username, undefined, pageNumber as number | undefined, GalleryType.SCRAPS, this._semaphore),
            action, delay
        );
    }
}
