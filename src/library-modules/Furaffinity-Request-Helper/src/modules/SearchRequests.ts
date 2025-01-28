import { Semaphore } from '../utils/Semaphore';
import { PercentHelper } from '../utils/PercentHelper';
import { IdArray } from '../utils/ArrayHelper';
import { Page } from '../components/GalleryRequests/Page';
import { Browse, BrowseOptions } from '../components/SearchRequests/Browse';
import { Search, SearchOptions } from '../components/SearchRequests/Search';
import { Logger } from '../../../GlobalUtils/src/Logger';

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
    static async getBrowseFiguresTillId(toId: number | undefined, fromPage: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (toId == null || toId <= 0) {
            Logger.logError('No toId given');
            return [];
        }

        let allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let i = 1;
        if (fromPage != null && fromPage >= 1) {
            i = fromPage;
        }
        while (running) {
            const figures = await SearchRequests.getBrowseFigures(i, browseOptions, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, toId)) {
                    allFigures.push(IdArray.getTillId(figures, toId));
                    running = false;
                } else {
                    allFigures.push(figures);
                    i++;
                }
            }
        }

        return allFigures;
    }

    static async getBrowseFiguresSinceId(fromId: number | undefined, toPage: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (fromId == null || fromId <= 0) {
            Logger.logError('No fromId given');
            return [];
        }

        const direction = toPage == null || toPage <= 0 ? -1 : 1;

        let lastFigureId: string | undefined;
        let running = true;
        let i = toPage == null || toPage <= 0 ? 1 : toPage;
        if (toPage == null || toPage <= 0) {
            while (running) {
                const figures = await SearchRequests.getBrowseFigures(i, browseOptions, semaphore);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                } else {
                    if (IdArray.containsId(figures, fromId)) {
                        running = false;
                    } else {
                        i++;
                    }
                }
            }
        }

        let allFigures = [];
        lastFigureId = undefined;
        running = true;
        while (running) {
            const figures = await SearchRequests.getBrowseFigures(i, browseOptions, semaphore);
            let currFigureId: string | undefined = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, fromId)) {
                    const figuresPush = IdArray.getSinceId(figures, fromId);
                    if (direction < 0) {
                        figuresPush.reverse();
                        running = false;
                    }
                    allFigures.push(figuresPush);
                } else {
                    if (direction < 0) {
                        figures.reverse();
                    }
                    allFigures.push(figures);
                }
                i += direction;
            }
        }
        if (direction < 0) {
            allFigures.reverse();
        }

        return allFigures;
    }

    static async getBrowseFiguresBetweenIds(fromId: number | undefined, toId: number | undefined, fromPage: number | undefined, toPage: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (fromId == null || fromId <= 0) {
            Logger.logError('No fromId given');
            return [];
        }
        if (toId == null || toId <= 0) {
            Logger.logError('No toId given');
            return [];
        }
        if (fromPage == null || fromPage <= 0 || toPage == null || toPage <= 1) {
            Logger.logWarning('No fromPage or toPage given. Percentages can not be calculated.');
            percentId = undefined;
        }
        
        let i = 1;
        if (fromPage != null && fromPage >= 1) {
            i = fromPage;
        }

        const allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let completedPages = 0;
        while (running) {
            if (toPage != null && toPage >= 1 && i >= toPage) {
                running = false;
            }
            const figures = await SearchRequests.getBrowseFigures(i, browseOptions, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, fromId)) {
                    allFigures.push(IdArray.getSinceId(figures, fromId));
                }
                if (IdArray.containsId(figures, toId)) {
                    allFigures.push(IdArray.getBetweenIds(figures, fromId, toId));
                    running = false;
                } else {
                    allFigures.push(figures);
                    i++;
                }
            }

            completedPages++;
            if (toPage != null && toPage >= 1) {
                PercentHelper.updatePercentValue(percentId, completedPages, toPage);
            }
        }

        return allFigures;
    }

    static async getBrowseFiguresTillPage(toPageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (toPageNumber == null || toPageNumber <= 0) {
            Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
            toPageNumber = 1;
        }

        const allFigures = [];
        let completedPages = 0;
        for (let i = 1; i <= toPageNumber; i++) {
            const figures = await SearchRequests.getBrowseFigures(i, browseOptions, semaphore);
            if (figures.length !== 0) {
                allFigures.push(figures);
            }

            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, toPageNumber);
        }

        return allFigures;
    }

    static async getBrowseFiguresSincePage(fromPageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (fromPageNumber == null || fromPageNumber <= 0) {
            Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
            fromPageNumber = 1;
        }

        const allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let i = fromPageNumber;
        while (running) {
            const figures = await SearchRequests.getBrowseFigures(i, browseOptions, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                allFigures.push(figures);
                i++;
            }
        }

        return allFigures;
    }

    static async getBrowseFiguresBetweenPages(fromPageNumber: number | undefined, toPageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (fromPageNumber == null || fromPageNumber <= 0) {
            Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
            fromPageNumber = 1;
        }
        if (toPageNumber == null || toPageNumber <= 0) {
            Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
            toPageNumber = 1;
        }

        const allFigures = [];
        const direction = fromPageNumber <= toPageNumber ? 1 : -1;
        const totalPages = Math.abs(toPageNumber - fromPageNumber) + 1;
        let completedPages = 0;
        for (let i = fromPageNumber; i <= toPageNumber; i += direction) {
            const figures = await SearchRequests.getBrowseFigures(i, browseOptions, semaphore);
            if (figures.length !== 0) {
                allFigures.push(figures);
            }

            PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
        }

        return allFigures;
    }

    static async getBrowseFigures(pageNumber: number | undefined, browseOptions: BrowseOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No pageNumber given. Using default value of 1.');
            pageNumber = 1;
        }
        const galleryDoc = await Page.getBrowsePage(pageNumber, browseOptions, semaphore);
        if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
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
    static async getSearchFiguresTillId(toId: number | undefined, fromPage: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (toId == null || toId <= 0) {
            Logger.logError('No toId given');
            return [];
        }

        let allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let i = 1;
        if (fromPage != null && fromPage >= 1) {
            i = fromPage;
        }
        while (running) {
            const figures = await SearchRequests.getSearchFigures(i, searchOptions, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, toId)) {
                    allFigures.push(IdArray.getTillId(figures, toId));
                    running = false;
                } else {
                    allFigures.push(figures);
                    i++;
                }
            }
        }

        return allFigures;
    }

    static async getSearchFiguresSinceId(fromId: number | undefined, toPage: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (fromId == null || fromId <= 0) {
            Logger.logError('No fromId given');
            return [];
        }

        const direction = toPage == null || toPage <= 0 ? -1 : 1;

        let lastFigureId: string | undefined;
        let running = true;
        let i = toPage == null || toPage <= 0 ? 1 : toPage;
        if (toPage == null || toPage <= 0) {
            while (running) {
                const figures = await SearchRequests.getSearchFigures(i, searchOptions, semaphore);
                let currFigureId = lastFigureId;
                if (figures.length !== 0) {
                    currFigureId = figures[0].id;
                }
                if (currFigureId === lastFigureId) {
                    running = false;
                } else {
                    if (IdArray.containsId(figures, fromId)) {
                        running = false;
                    } else {
                        i++;
                    }
                }
            }
        }

        let allFigures = [];
        lastFigureId = undefined;
        running = true;
        while (running) {
            const figures = await SearchRequests.getSearchFigures(i, searchOptions, semaphore);
            let currFigureId: string | undefined = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, fromId)) {
                    const figuresPush = IdArray.getSinceId(figures, fromId);
                    if (direction < 0) {
                        figuresPush.reverse();
                        running = false;
                    }
                    allFigures.push(figuresPush);
                } else {
                    if (direction < 0) {
                        figures.reverse();
                    }
                    allFigures.push(figures);
                }
                i += direction;
            }
        }
        if (direction < 0) {
            allFigures.reverse();
        }

        return allFigures;
    }

    static async getSearchFiguresBetweenIds(fromId: number | undefined, toId: number | undefined, fromPage: number | undefined, toPage: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (fromId == null || fromId <= 0) {
            Logger.logError('No fromId given');
            return [];
        }
        if (toId == null || toId <= 0) {
            Logger.logError('No toId given');
            return [];
        }
        if (fromPage == null || fromPage <= 0 || toPage == null || toPage <= 1) {
            Logger.logWarning('No fromPage or toPage given. Percentages can not be calculated.');
            percentId = undefined;
        }

        let i = 1;
        if (fromPage != null && fromPage >= 1) {
            i = fromPage;
        }

        const allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let completedPages = 0;
        while (running) {
            if (toPage != null && toPage >= 1 && i >= toPage) {
                running = false;
            }
            const figures = await SearchRequests.getSearchFigures(i, searchOptions, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, fromId)) {
                    allFigures.push(IdArray.getSinceId(figures, fromId));
                }
                if (IdArray.containsId(figures, toId)) {
                    allFigures.push(IdArray.getBetweenIds(figures, fromId, toId));
                    running = false;
                } else {
                    allFigures.push(figures);
                    i++;
                }
            }

            completedPages++;
            if (toPage != null && toPage >= 1) {
                PercentHelper.updatePercentValue(percentId, completedPages, toPage);
            }
        }

        return allFigures;
    }

    static async getSearchFiguresTillPage(toPageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (toPageNumber == null || toPageNumber <= 0) {
            Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
            toPageNumber = 1;
        }

        const allFigures = [];
        let completedPages = 0;
        for (let i = 1; i <= toPageNumber; i++) {
            const figures = await SearchRequests.getSearchFigures(i, searchOptions, semaphore);
            if (figures.length !== 0) {
                allFigures.push(figures);
            }

            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, toPageNumber);
        }

        return allFigures;
    }

    static async getSearchFiguresSincePage(fromPageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (fromPageNumber == null || fromPageNumber <= 0) {
            Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
            fromPageNumber = 1;
        }

        const allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let i = fromPageNumber;
        while (running) {
            const figures = await SearchRequests.getSearchFigures(i, searchOptions, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                allFigures.push(figures);
                i++;
            }
        }

        return allFigures;
    }

    static async getSearchFiguresBetweenPages(fromPageNumber: number | undefined, toPageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (fromPageNumber == null || fromPageNumber <= 0) {
            Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
            fromPageNumber = 1;
        }
        if (toPageNumber == null || toPageNumber <= 0) {
            Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
            toPageNumber = 1;
        }

        const allFigures = [];
        const direction = fromPageNumber <= toPageNumber ? 1 : -1;
        const totalPages = Math.abs(toPageNumber - fromPageNumber) + 1;
        let completedPages = 0;
        for (let i = fromPageNumber; i <= toPageNumber; i += direction) {
            const figures = await SearchRequests.getSearchFigures(i, searchOptions, semaphore);
            if (figures.length !== 0) {
                allFigures.push(figures);
            }

            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
        }

        return allFigures;
    }

    static async getSearchFigures(pageNumber: number | undefined, searchOptions: SearchOptions | undefined, semaphore: Semaphore): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No pageNumber given. Using default value of 1.');
            pageNumber = 1;
        }
        const galleryDoc = await Page.getSearchPage(pageNumber, searchOptions, semaphore);
        if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
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
