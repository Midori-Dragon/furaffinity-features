import { Semaphore } from '../../utils/Semaphore';
import { Gallery } from './Gallery';
import { Scraps } from './Scraps';
import { Favorites } from './Favorites';
import { Journals } from './Journals';
import { Browse, BrowseOptions } from '../SearchRequests/Browse';
import { Search, SearchOptions } from '../SearchRequests/Search';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { GalleryType } from '../../modules/GalleryRequests';
import checkTagsAll from '../../../../GlobalUtils/src/FA-Functions/checkTagsAll';
import { Logger } from '../../../../GlobalUtils/src/Logger';

export class Page {
    static async getGalleryPage(username: string | undefined, folderId: number | undefined, pageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<Document | undefined> {
        if (galleryType === GalleryType.FAVORITES) {
            const dataFavId = folderId ?? pageNumber;
            return await Page.getFavoritesPage(username, dataFavId, pageNumber, semaphore);
        } else if (galleryType === GalleryType.JOURNALS) {
            return await Page.getJournalsPage(username, pageNumber, semaphore);
        } else if (galleryType === GalleryType.BROWSE) {
            return await Page.getBrowsePage(pageNumber, undefined, semaphore);
        } else if (galleryType === GalleryType.SEARCH) {
            return await Page.getSearchPage(pageNumber, undefined, semaphore);
        }

        if (username == null) {
            Logger.logError('No username given');
            return;
        }
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No page number given. Using default value of 1.');
            pageNumber = 1;
        }

        let url;
        if (!username.endsWith('/')) {
            username += '/';
        }
        switch (galleryType) {
        case GalleryType.GALLERY:
            url = Gallery.hardLink + username;
            break;
        case GalleryType.SCRAPS:
            url = Scraps.hardLink + username;
            break;
        }

        if (folderId != null && folderId !== -1) {
            url += `folder/${folderId}/`;
        }
        const page = await FuraffinityRequests.getHTML(url + pageNumber, semaphore);
        checkTagsAll(page);
        return page;
    }

    static async getFavoritesPage(username: string | undefined, dataFavId: number | undefined, direction: number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (username == null) {
            Logger.logError('No username given');
            return;
        }
        if (direction == null) {
            Logger.logWarning('No direction given. Using default 1 instead.');
            direction = 1;
        }

        if (!username.endsWith('/')) {
            username += '/';
        }
        let url = Favorites.hardLink;
        if (dataFavId != null && dataFavId >= 0) {
            url += `${username}${dataFavId}/`;
        } else {
            Logger.logWarning('No last data fav id given. Using default 1 instead.');
            url += username;
        }

        if (direction >= 0) {
            url += 'next/';
        } else {
            url += 'prev/';
        }

        const page = await FuraffinityRequests.getHTML(url, semaphore);
        checkTagsAll(page);
        return page;
    }

    static async getJournalsPage(username: string | undefined, pageNumber: number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (username == null) {
            Logger.logError('No username given');
            return;
        }
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
            pageNumber = 1;
        }

        if (!username.endsWith('/')) {
            username += '/';
        }
        const url = Journals.hardLink + username;
        return await FuraffinityRequests.getHTML(url + pageNumber, semaphore);
    }

    static async getBrowsePage(pageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
            pageNumber = 1;
        }

        if (browseOptions == null) {
            browseOptions = new BrowseOptions();
        }

        const payload: { [key: string]: string | number | undefined } = {
            'cat': browseOptions.category,
            'atype': browseOptions.type,
            'species': browseOptions.species,
            'gender': browseOptions.gender,
            'perpage': browseOptions.results,
            'page': pageNumber,
            'rating_general': browseOptions.ratingGeneral ? 'on' : 'off',
            'rating_mature': browseOptions.ratingMature ? 'on' : 'off',
            'rating_adult': browseOptions.ratingAdult ? 'on' : 'off',
        };
        for (const key in payload) {
            if (payload[key] == null || payload[key] === 0 || payload[key] === 'off') {
                delete payload[key];
            }
        }
        const payloadArray = Object.entries(payload).map(([key, value]) => [key, value?.toString() ?? '']);

        const url = Browse.hardLink;
        const page = await FuraffinityRequests.postHTML(url, payloadArray, semaphore);
        checkTagsAll(page);
        return page;
    }

    static async getSearchPage(pageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('Page number must be greater than 0. Using default 1 instead.');
            pageNumber = 1;
        }

        if (searchOptions == null) {
            searchOptions = new SearchOptions();
        }

        const payload: { [key: string]: string | number | undefined } = {
            'page': pageNumber,
            'q': searchOptions.input,
            'order-by': searchOptions.orderBy,
            'order-direction': searchOptions.orderDirection,
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
}
