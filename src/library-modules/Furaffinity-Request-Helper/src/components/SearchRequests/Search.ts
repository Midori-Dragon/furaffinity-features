import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { Page } from '../GalleryRequests/Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { SearchRequests } from '../../modules/SearchRequests';
import { convertToNumber } from '../../utils/GeneralUtils';
import { BrowseOptions } from './Browse';

export class Search {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/search/';
    }

    get newSearchOptions(): SearchOptions {
        return new SearchOptions();
    }
    static get newSearchOptions(): SearchOptions {
        return new SearchOptions();
    }

    get SearchOptions(): typeof SearchOptions {
        return SearchOptions;
    }
    static get SearchOptions(): typeof SearchOptions {
        return SearchOptions;
    }

    async getFiguresBetweenIds(fromId?: string | number, toId?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => SearchRequests.getSearchFiguresTillId(toId as number | undefined, undefined, searchOptions, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => SearchRequests.getSearchFiguresSinceId(fromId as number | undefined, undefined, searchOptions, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => SearchRequests.getSearchFiguresBetweenIds(fromId as number | undefined, toId as number | undefined, undefined, undefined, searchOptions, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresBetweenIdsBetweenPages(fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => SearchRequests.getSearchFiguresTillId(toId as number | undefined, fromPageNumber as number | undefined, searchOptions, this._semaphore),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => SearchRequests.getSearchFiguresSinceId(fromId as number | undefined, toPageNumber as number | undefined, searchOptions, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => SearchRequests.getSearchFiguresBetweenIds(fromId as number | undefined, toId as number | undefined, fromPageNumber as number | undefined, toPageNumber as number | undefined, searchOptions, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFiguresBetweenPages(fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);

        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => SearchRequests.getSearchFiguresTillPage(toPageNumber as number | undefined, searchOptions, this._semaphore, percentId),
                action, delay
            );
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => SearchRequests.getSearchFiguresSincePage(fromPageNumber as number | undefined, searchOptions, this._semaphore),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                (percentId) => SearchRequests.getSearchFiguresBetweenPages(fromPageNumber as number | undefined, toPageNumber as number | undefined, searchOptions, this._semaphore, percentId),
                action, delay
            );
        }
    }

    async getFigures(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => SearchRequests.getSearchFigures(pageNumber as number | undefined, searchOptions, this._semaphore),
            action, delay
        );
    }

    async getPage(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => Page.getSearchPage(pageNumber as number | undefined, searchOptions, this._semaphore),
            action, delay
        );
    }
}

export class SearchOptions {
    input: string | undefined;
    perPage: number;
    orderBy: string | undefined;
    orderDirection: string | undefined;
    category: number | undefined;
    type: number | undefined;
    species: number | undefined;
    range: string | undefined;
    rangeFrom: string | Date | undefined;
    rangeTo: string | Date | undefined;
    ratingGeneral = true;
    ratingMature = true;
    ratingAdult = true;
    typeArt = true;
    typeMusic = true;
    typeFlash = true;
    typeStory = true;
    typePhotos = true;
    typePoetry = true;
    matching: string | undefined;

    constructor() {
        this.input = '';
        this.perPage = 72;
        this.orderBy = SearchOptions.orderBy['relevancy'];
        this.orderDirection = SearchOptions.orderDirection['descending'];
        this.category = BrowseOptions.category['all'];
        this.type = BrowseOptions.type['all'];
        this.species = BrowseOptions.species['any'];
        this.range = SearchOptions.range['alltime'];
        this.rangeFrom = undefined;
        this.rangeTo = undefined;
        this.matching = SearchOptions.matching['all'];
    }

    static readonly orderBy: Record<string, string> = {
        'relevancy': 'relevancy',
        'date': 'date',
        'popularity': 'popularity'
    };
    static readonly orderDirection: Record<string, string> = {
        'ascending': 'asc',
        'descending': 'desc'
    };
    static readonly range: Record<string, string> = {
        '1day': '1day',
        '3days': '3days',
        '7days': '7days',
        '30days': '30days',
        '90days': '90days',
        '1year': '1year',
        '3years': '3years',
        '5years': '5years',
        'alltime': 'all',
        'manual': 'manual'
    };
    static readonly matching: Record<string, string> = {
        'all': 'all',
        'any': 'any',
        'extended': 'extended'
    };
}
