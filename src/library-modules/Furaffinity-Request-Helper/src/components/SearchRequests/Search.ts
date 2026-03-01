import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { SearchRequests } from '../../modules/SearchRequests';
import { convertToNumber } from '../../utils/GeneralUtils';
import { BrowseOptions } from './Browse';
import checkTagsAll from '../../../../GlobalUtils/src/FA-Functions/checkTagsAll';
import { Logger } from '../../../../GlobalUtils/src/Logger';

export class Search {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/search/';
    }

    static async fetchPage(pageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
            pageNumber = 1;
        }

        searchOptions ??= new SearchOptions();

        const payload: { [key: string]: string | number | undefined } = {
            'page': pageNumber,
            'q': searchOptions.input,
            'perpage': searchOptions.perPage,
            'order-by': searchOptions.orderBy,
            'order-direction': searchOptions.orderDirection,
            'category': searchOptions.category,
            'arttype': searchOptions.type,
            'species': searchOptions.species,
            'range': searchOptions.range,
            'range_from': undefined,
            'range_to': undefined,
            'rating-general': searchOptions.ratingGeneral ? 1 : 0,
            'rating-mature': searchOptions.ratingMature ? 1 : 0,
            'rating-adult': searchOptions.ratingAdult ? 1 : 0,
            'type-art': searchOptions.typeArt ? 1 : 0,
            'type-music': searchOptions.typeMusic ? 1 : 0,
            'type-flash': searchOptions.typeFlash ? 1 : 0,
            'type-story': searchOptions.typeStory ? 1 : 0,
            'type-photos': searchOptions.typePhotos ? 1 : 0,
            'type-poetry': searchOptions.typePoetry ? 1 : 0,
            'mode': searchOptions.matching
        };

        if (searchOptions.rangeFrom instanceof Date && searchOptions.rangeFrom != null) {
            const year = searchOptions.rangeFrom.getFullYear();
            const month = (searchOptions.rangeFrom.getMonth() + 1).toString().padStart(2, '0');
            const day = searchOptions.rangeFrom.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            payload['range_from'] = formattedDate;
        } else if (typeof searchOptions.rangeFrom == 'string' && searchOptions.rangeFrom) {
            payload['range_from'] = searchOptions.rangeFrom;
        }

        if (searchOptions.rangeTo instanceof Date && searchOptions.rangeTo != null) {
            const year = searchOptions.rangeTo.getFullYear();
            const month = (searchOptions.rangeTo.getMonth() + 1).toString().padStart(2, '0');
            const day = searchOptions.rangeTo.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            payload['range_to'] = formattedDate;
        } else if (typeof searchOptions.rangeTo == 'string' && searchOptions.rangeTo) {
            payload['range_to'] = searchOptions.rangeTo;
        }

        for (const key in payload) {
            if (payload[key] == null || payload[key] === 0 || payload[key] === 'off') {
                delete payload[key];
            }
        }
        const payloadArray = Object.entries(payload).map(([key, value]) => [key, value?.toString() ?? '']);

        const url = Search.hardLink;
        const page = await FuraffinityRequests.postHTML(url, payloadArray, semaphore);
        checkTagsAll(page);
        return page;
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

    async getFiguresBetweenIds(fromId?: string | number, toId?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
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

    async getFiguresBetweenIdsBetweenPages(fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
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

    async getFiguresBetweenPages(fromPageNumber?: string | number, toPageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
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

    async getFigures(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => SearchRequests.getSearchFigures(pageNumber as number | undefined, searchOptions, this._semaphore),
            action, delay
        );
    }

    async getPage(pageNumber?: string | number, searchOptions?: SearchOptions, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);

        return await WaitAndCallAction.callFunctionAsync(
            () => Search.fetchPage(pageNumber as number | undefined, searchOptions, this._semaphore),
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
