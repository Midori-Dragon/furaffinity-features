import { PercentHelper } from '../utils/PercentHelper';
import { IdArray } from '../utils/ArrayHelper';
import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
import { Gallery } from '../components/GalleryRequests/Gallery';
import { Scraps } from '../components/GalleryRequests/Scraps';
import { Favorites } from '../components/GalleryRequests/Favorites';
import { Journals } from '../components/GalleryRequests/Journals';
import { Page } from '../components/GalleryRequests/Page';
import { Logger } from '../../../GlobalUtils/src/Logger';

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

    static async getSubmissionPageNo(username: string, submissionId: number | undefined, folderId: number | undefined, fromPageNumber: number | undefined, toPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<number> {
        if (submissionId == null || submissionId <= 0) {
            Logger.logError('No submissionId given');
            return -1;
        }
        if (fromPageNumber == null || fromPageNumber <= 0) {
            Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
            fromPageNumber = 1;
        }
        if (toPageNumber == null || toPageNumber === 0) {
            Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
            toPageNumber = 1;
        } else if (toPageNumber < 0) {
            toPageNumber = Number.MAX_SAFE_INTEGER;
        }

        const direction = fromPageNumber <= toPageNumber ? 1 : -1;
        const totalPages = Math.abs(toPageNumber - fromPageNumber) + 1;
        let completedPages = 0;
        for (let i = fromPageNumber; i <= toPageNumber; i += direction) {
            const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
            if (figures.length === 0) {
                i = toPageNumber;
            } else {
                const resultFigure = figures.find(figure => figure.id.trimStart('sid-') === submissionId.toString());
                if (resultFigure != null) {
                    return i;
                }
            }
            
            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
        }

        return -1;
    }

    static async getGalleryFiguresTillId(username: string, folderId: number | undefined, toId: number | undefined, fromPage: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (toId == null || toId <= 0) {
            Logger.logError('No toId given');
            return [];
        }

        const allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let i = 1;
        if (fromPage != null && fromPage >= 1) {
            i = fromPage;
        }
        while (running) {
            const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
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

    static async getGalleryFiguresSinceId(username: string, folderId: number | undefined, fromId: number | undefined, toPage: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[][]> {
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
                const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
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

        const allFigures = [];
        lastFigureId = undefined;
        running = true;
        while (running) {
            const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
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

    static async getGalleryFiguresBetweenIds(username: string, folderId: number | undefined, fromId: number | undefined, toId: number | undefined, fromPage: number | undefined, toPage: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
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
            const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
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

    static async getGalleryFiguresTillPage(username: string, folderId: number | undefined, toPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (toPageNumber == null || toPageNumber === 0) {
            Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
            toPageNumber = 1;
        } else if (toPageNumber < 0) {
            toPageNumber = Number.MAX_SAFE_INTEGER;
        }

        const allFigures = [];
        let completedPages = 0;
        for (let i = 1; i <= toPageNumber; i++) {
            const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
            if (figures.length === 0) {
                i = toPageNumber;
            } else {
                allFigures.push(figures);
            }

            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, toPageNumber);
        }

        return allFigures;
    }

    static async getGalleryFiguresSincePage(username: string, folderId: number | undefined, fromPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[][]> {
        if (fromPageNumber == null ||  fromPageNumber <= 0) {
            Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
            fromPageNumber = 1;
        }

        const allFigures = [];
        let lastFigureId: string | undefined;
        let running = true;
        let i = fromPageNumber;
        while (running) {
            const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
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

    static async getGalleryFiguresBetweenPages(username: string, folderId: number | undefined, fromPageNumber: number | undefined, toPageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
        if (fromPageNumber == null || fromPageNumber <= 0) {
            Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
            fromPageNumber = 1;
        }
        if (toPageNumber == null || toPageNumber === 0) {
            Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
            toPageNumber = 1;
        } else if (toPageNumber < 0) {
            toPageNumber = Number.MAX_SAFE_INTEGER;
        }

        const allFigures = [];
        const direction = fromPageNumber <= toPageNumber ? 1 : -1;
        const totalPages = Math.abs(toPageNumber - fromPageNumber) + 1;
        let completedPages = 0;
        for (let i = fromPageNumber; i <= toPageNumber; i += direction) {
            const figures = await GalleryRequests.getGalleryFigures(username, folderId, i, galleryType, semaphore);
            if (figures.length === 0) {
                i = toPageNumber;
            } else {
                allFigures.push(figures);
            }

            completedPages++;
            PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
        }

        return allFigures;
    }

    static async getGalleryFigures(username: string, folderId: number | undefined, pageNumber: number | undefined, galleryType: GalleryType, semaphore: Semaphore): Promise<HTMLElement[]> {
        if (pageNumber == null || pageNumber <= 0) {
            Logger.logWarning('No pageNumber given. Using default value of 1.');
            pageNumber = 1;
        }

        if (folderId == null || folderId <= 0) {
            Logger.logInfo(`Getting ${galleryType} of "${username}" on page "${pageNumber}".`);
        } else {
            Logger.logInfo(`Getting ${galleryType} of "${username}" in folder "${folderId}" on page "${pageNumber}".`);
        }
        
        const galleryDoc = await Page.getGalleryPage(username, folderId, pageNumber, galleryType, semaphore);
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
