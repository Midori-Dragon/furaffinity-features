import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
import { Gallery } from '../components/GalleryRequests/Gallery';
import { Scraps } from '../components/GalleryRequests/Scraps';
import { Favorites } from '../components/GalleryRequests/Favorites';
import { Journals } from '../components/GalleryRequests/Journals';
import { Page } from '../components/GalleryRequests/Page';
import { IGalleryFolder } from '../types/GalleryFolder';
import { Logger } from '../../../GlobalUtils/src/Logger';
import { elementsTillId, elementsSinceId, elementsBetweenIds, elementsTillPage, elementsSincePage, elementsBetweenPages, findElementPageNo } from '../utils/FigurePagingUtils';

export class GalleryRequests {
    readonly Gallery: Gallery;
    readonly Scraps: Scraps;
    readonly Favorites: Favorites;
    readonly Journals: Journals;

    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.Gallery = new Gallery(this._semaphore);
        this.Scraps = new Scraps(this._semaphore);
        this.Favorites = new Favorites(this._semaphore);
        this.Journals = new Journals(this._semaphore);
    }

    static async getSubmissionPageNo(username: string, submissionId: number | undefined, folder: IGalleryFolder | undefined, fromPageNumber: number | undefined, toPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<number> {
        if (submissionId == null || submissionId <= 0) {
            Logger.logError('No submissionId given');
            return -1;
        }
        return await findElementPageNo(
            (page) => GalleryRequests.getGalleryFigures(username, folder, page, galleryType, semaphore),
            submissionId, 'sid-', fromPageNumber, toPageNumber, percentId
        );
    }

    static async getGalleryFiguresTillId(username: string, folder: IGalleryFolder | undefined, toId: number | undefined, fromPage: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[][]> {
        return await elementsTillId(
            (page) => GalleryRequests.getGalleryFigures(username, folder, page, galleryType, semaphore),
            toId, fromPage
        );
    }

    static async getGalleryFiguresSinceId(username: string, folder: IGalleryFolder | undefined, fromId: number | undefined, toPage: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[][]> {
        return await elementsSinceId(
            (page) => GalleryRequests.getGalleryFigures(username, folder, page, galleryType, semaphore),
            fromId, toPage
        );
    }

    static async getGalleryFiguresBetweenIds(username: string, folder: IGalleryFolder | undefined, fromId: number | undefined, toId: number | undefined, fromPage: number | undefined, toPage: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsBetweenIds(
            (page) => GalleryRequests.getGalleryFigures(username, folder, page, galleryType, semaphore),
            fromId, toId, fromPage, toPage, percentId
        );
    }

    static async getGalleryFiguresTillPage(username: string, folder: IGalleryFolder | undefined, toPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsTillPage(
            (page) => GalleryRequests.getGalleryFigures(username, folder, page, galleryType, semaphore),
            toPageNumber, percentId
        );
    }

    static async getGalleryFiguresSincePage(username: string, folder: IGalleryFolder | undefined, fromPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[][]> {
        return await elementsSincePage(
            (page) => GalleryRequests.getGalleryFigures(username, folder, page, galleryType, semaphore),
            fromPageNumber
        );
    }

    static async getGalleryFiguresBetweenPages(username: string, folder: IGalleryFolder | undefined, fromPageNumber: number | undefined, toPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsBetweenPages(
            (page) => GalleryRequests.getGalleryFigures(username, folder, page, galleryType, semaphore),
            fromPageNumber, toPageNumber, percentId
        );
    }

    static async getGalleryFigures(username: string, folder: IGalleryFolder | undefined, pageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No pageNumber given. Using default value of 1.');
            pageNumber = 1;
        }

        if (folder == null) {
            Logger.logInfo(`Getting ${galleryType} of "${username}" on page "${pageNumber}".`);
        } else {
            Logger.logInfo(`Getting ${galleryType} of "${username}" in folder "${folder.id}"${folder.name != null ? ` (${folder.name})` : ''} on page "${pageNumber}".`);
        }

        const galleryDoc = await Page.getGalleryPage(username, folder, pageNumber, galleryType, semaphore);
        if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
            Logger.logInfo(`No images found at ${galleryType} of "${username}" on page "${pageNumber}".`);
            return [];
        }

        const figures = galleryDoc.getElementsByTagName('figure');
        if (figures == null || figures.length === 0) {
            Logger.logInfo(`No figures found at ${galleryType} of "${username}" on page "${pageNumber}".`);
            return [];
        }

        return Array.from(figures);
    }
}

export enum GalleryType {
    GALLERY = 'gallery',
    FAVORITES = 'favorites',
    SCRAPS = 'scraps',
    JOURNALS = 'journals',
    BROWSE = 'browse',
    SEARCH = 'search'
}
