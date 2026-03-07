import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
import { Browse, BrowseOptions } from '../components/SearchRequests/Browse';
import { Search, SearchOptions } from '../components/SearchRequests/Search';
import { Logger } from '../../../GlobalUtils/src/Logger';
import { elementsTillId, elementsSinceId, elementsBetweenIds, elementsTillPage, elementsSincePage, elementsBetweenPages } from '../utils/FigurePagingUtils';

export class SearchRequests {
    readonly Browse: Browse;
    readonly Search: Search;

    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.Browse = new Browse(this._semaphore);
        this.Search = new Search(this._semaphore);
    }

    //#region Browse
    static async getBrowseFiguresTillId(toId: number | undefined, fromPage: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[][]> {
        return await elementsTillId(
            (page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore, signal),
            toId, fromPage
        );
    }

    static async getBrowseFiguresSinceId(fromId: number | undefined, toPage: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[][]> {
        return await elementsSinceId(
            (page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore, signal),
            fromId, toPage
        );
    }

    static async getBrowseFiguresBetweenIds(fromId: number | undefined, toId: number | undefined, fromPage: number | undefined, toPage: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, signal?: AbortSignal, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsBetweenIds(
            (page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore, signal),
            fromId, toId, fromPage, toPage, percentId
        );
    }

    static async getBrowseFiguresTillPage(toPageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, signal?: AbortSignal, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsTillPage(
            (page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore, signal),
            toPageNumber, percentId
        );
    }

    static async getBrowseFiguresSincePage(fromPageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[][]> {
        return await elementsSincePage(
            (page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore, signal),
            fromPageNumber
        );
    }

    static async getBrowseFiguresBetweenPages(fromPageNumber: number | undefined, toPageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, signal?: AbortSignal, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsBetweenPages(
            (page) => SearchRequests.getBrowseFigures(page, browseOptions, semaphore, signal),
            fromPageNumber, toPageNumber, percentId
        );
    }

    static async getBrowseFigures(pageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No pageNumber given. Using default value of 1.');
            pageNumber = 1;
        }
        const galleryDoc = await Browse.fetchPage(pageNumber, browseOptions, semaphore, signal);
        if (galleryDoc == null || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
            Logger.logInfo(`No images found at browse on page "${pageNumber}".`);
            return [];
        }

        const figures = galleryDoc.getElementsByTagName('figure');
        if (figures == null || figures.length === 0) {
            Logger.logInfo(`No figures found at browse on page "${pageNumber}".`);
            return [];
        }

        return Array.from(figures);
    }
    //#endregion

    //#region Search
    static async getSearchFiguresTillId(toId: number | undefined, fromPage: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[][]> {
        return await elementsTillId(
            (page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore, signal),
            toId, fromPage
        );
    }

    static async getSearchFiguresSinceId(fromId: number | undefined, toPage: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[][]> {
        return await elementsSinceId(
            (page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore, signal),
            fromId, toPage
        );
    }

    static async getSearchFiguresBetweenIds(fromId: number | undefined, toId: number | undefined, fromPage: number | undefined, toPage: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, signal?: AbortSignal, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsBetweenIds(
            (page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore, signal),
            fromId, toId, fromPage, toPage, percentId
        );
    }

    static async getSearchFiguresTillPage(toPageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, signal?: AbortSignal, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsTillPage(
            (page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore, signal),
            toPageNumber, percentId
        );
    }

    static async getSearchFiguresSincePage(fromPageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[][]> {
        return await elementsSincePage(
            (page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore, signal),
            fromPageNumber
        );
    }

    static async getSearchFiguresBetweenPages(fromPageNumber: number | undefined, toPageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, signal?: AbortSignal, percentId?: string | number): Promise<HTMLElement[][]> {
        return await elementsBetweenPages(
            (page) => SearchRequests.getSearchFigures(page, searchOptions, semaphore, signal),
            fromPageNumber, toPageNumber, percentId
        );
    }

    static async getSearchFigures(pageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, signal?: AbortSignal): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No pageNumber given. Using default value of 1.');
            pageNumber = 1;
        }
        const galleryDoc = await Search.fetchPage(pageNumber, searchOptions, semaphore, signal);
        if (galleryDoc == null || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
            Logger.logInfo(`No images found at search on page "${pageNumber}".`);
            return [];
        }

        const figures = galleryDoc.getElementsByTagName('figure');
        if (figures == null || figures.length === 0) {
            Logger.logInfo(`No figures found at search on page "${pageNumber}".`);
            return [];
        }

        return Array.from(figures);
    }
    //#endregion
}
