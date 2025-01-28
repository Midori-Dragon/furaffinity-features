import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../utils/Semaphore';
import { Page } from '../GalleryRequests/Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { SearchRequests } from '../../modules/SearchRequests';
import { convertToNumber } from '../../utils/GeneralUtils';

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
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresTillId, [toId, undefined, searchOptions, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresSinceId, [fromId, undefined, searchOptions, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresBetweenIds, [fromId, toId, undefined, undefined, searchOptions, this._semaphore], action, delay, true);
        }
    }

    async getFiguresBetweenIdsBetweenPages(fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresTillId, [toId, fromPageNumber, searchOptions, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresSinceId, [fromId, toPageNumber, searchOptions, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresBetweenIds, [fromId, toId, fromPageNumber, toPageNumber, searchOptions, this._semaphore], action, delay, true);
        }
    }

    async getFiguresBetweenPages(fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresTillPage, [toPageNumber, searchOptions, this._semaphore], action, delay, true);
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresSincePage, [fromPageNumber, searchOptions, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFiguresBetweenPages, [fromPageNumber, toPageNumber, searchOptions, this._semaphore], action, delay, true);
        }
    }

    async getFigures(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFigures, [pageNumber, searchOptions, this._semaphore], action, delay);
    }

    async getPage(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(Page.getSearchPage, [pageNumber, searchOptions, this._semaphore], action, delay);
    }
}

export class SearchOptions {
    input: string | undefined;
    orderBy: string | undefined;
    orderDirection: string | undefined;
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
        this.orderBy = SearchOptions.orderBy['relevancy'];
        this.orderDirection = SearchOptions.orderDirection['descending'];
        this.range = SearchOptions.range['alltime'];
        this.rangeFrom = undefined;
        this.rangeTo = undefined;
        this.matching = SearchOptions.matching['all'];
    }

    static get orderBy(): Record<string, string> {
        return {
            'relevancy': 'relevancy',
            'date': 'date',
            'popularity': 'popularity'
        };
    }

    static get orderDirection(): Record<string, string> {
        return {
            'ascending': 'asc',
            'descending': 'desc'
        };
    }

    static get range(): Record<string, string> {
        return {
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
    }

    static get matching(): Record<string, string> {
        return {
            'all': 'all',
            'any': 'any',
            'extended': 'extended'
        };
    }
}
