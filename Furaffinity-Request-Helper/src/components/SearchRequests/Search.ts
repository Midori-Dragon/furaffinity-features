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

    public static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/search/';
    }

    public get newSearchOptions(): SearchOptions {
        return new SearchOptions();
    }
    public static get newSearchOptions(): SearchOptions {
        return new SearchOptions();
    }

    public get SearchOptions(): typeof SearchOptions {
        return SearchOptions;
    }
    public static get SearchOptions(): typeof SearchOptions {
        return SearchOptions;
    }

    public async getFiguresBetweenIds(fromId?: string | number, toId?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
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

    public async getFiguresBetweenIdsBetweenPages(fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
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

    public async getFiguresBetweenPages(fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
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

    public async getFigures(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(SearchRequests.getSearchFigures, [pageNumber, searchOptions, this._semaphore], action, delay);
    }

    public async getPage(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(Page.getSearchPage, [pageNumber, searchOptions, this._semaphore], action, delay);
    }
}

export class SearchOptions {
    public input: string | undefined;
    public orderBy: string | undefined;
    public orderDirection: string | undefined;
    public range: string | undefined;
    public rangeFrom: string | Date | undefined;
    public rangeTo: string | Date | undefined;
    public ratingGeneral: boolean;
    public ratingMature: boolean;
    public ratingAdult: boolean;
    public typeArt: boolean;
    public typeMusic: boolean;
    public typeFlash: boolean;
    public typeStory: boolean;
    public typePhotos: boolean;
    public typePoetry: boolean;
    public matching: string | undefined;

    constructor() {
        this.input = '';
        this.orderBy = SearchOptions.orderBy['relevancy'];
        this.orderDirection = SearchOptions.orderDirection['descending'];
        this.range = SearchOptions.range['alltime'];
        this.rangeFrom = undefined;
        this.rangeTo = undefined;
        this.ratingGeneral = true;
        this.ratingMature = true;
        this.ratingAdult = true;
        this.typeArt = true;
        this.typeMusic = true;
        this.typeFlash = true;
        this.typeStory = true;
        this.typePhotos = true;
        this.typePoetry = true;
        this.matching = SearchOptions.matching['all'];
    }

    public static get orderBy(): Record<string, string> {
        return {
            'relevancy': 'relevancy',
            'date': 'date',
            'popularity': 'popularity'
        };
    }

    public static get orderDirection(): Record<string, string> {
        return {
            'ascending': 'asc',
            'descending': 'desc'
        };
    }

    public static get range(): Record<string, string> {
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

    public static get matching(): Record<string, string> {
        return {
            'all': 'all',
            'any': 'any',
            'extended': 'extended'
        };
    }
}
