import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { Semaphore } from '../../utils/Semaphore';
import { IdArray } from '../../utils/ArrayHelper';
import { PercentHelper } from '../../utils/PercentHelper';
import { Page } from './Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { convertToNumber } from '../../utils/GeneralUtils';
import { Logger } from '../../../../GlobalUtils/src/utils/Logger';

export class Journals {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/journals/';
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsTillId, [username, toId, undefined, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsSinceId, [username, fromId, undefined, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsBetweenIds, [username, fromId, toId, undefined, undefined, this._semaphore], action, delay);
        }
    }

    async getFiguresBetweenIdsBetweenPages(username: string, fromId?: string | number, toId?: string | number, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsTillId, [username, toId, fromPageNumber, this._semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsSinceId, [username, fromId, toPageNumber, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsBetweenIds, [username, fromId, toId, fromPageNumber, toPageNumber, this._semaphore], action, delay);
        }
    }

    async getSectionsBetweenPages(username: string, fromPageNumber?: string | number, toPageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromPageNumber = convertToNumber(fromPageNumber);
        toPageNumber = convertToNumber(toPageNumber);
        
        if (fromPageNumber == null || fromPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsTillPage, [username, toPageNumber, this._semaphore], action, delay, true);
        } else if (toPageNumber == null || toPageNumber <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsSincePage, [username, fromPageNumber, this._semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(getJournalsSectionsBetweenPages, [username, fromPageNumber, toPageNumber, this._semaphore], action, delay, true);
        }
    }

    async getSections(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(getJournalsSections, [username, pageNumber, this._semaphore], action, delay);
    }

    async getPage(username: string, pageNumber?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        pageNumber = convertToNumber(pageNumber);
        
        return await WaitAndCallAction.callFunctionAsync(Page.getJournalsPage, [username, pageNumber, this._semaphore], action, delay);
    }
}

async function getJournalsSectionsTillId(username: string, toId: number | undefined, fromPage: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (toId == null || toId <= 0) {
        Logger.logError('No toId given');
        return [];
    }

    const allSections = [];
    let lastSectionId: string | undefined;
    let running = true;
    let i = 1;
    if (fromPage != null && fromPage >= 1) {
        i = fromPage;
    }
    while (running) {
        const sections = await getJournalsSections(username, i, semaphore);
        let currSectionId = lastSectionId;
        if (sections.length !== 0) {
            currSectionId = sections[0].id;
        }
        if (currSectionId === lastSectionId) {
            running = false;
        } else {
            if (IdArray.containsId(sections, toId)) {
                allSections.push(IdArray.getTillId(sections, toId));
                running = false;
            } else {
                allSections.push(sections);
                i++;
            }
        }
    }

    return allSections;
}

async function getJournalsSectionsSinceId(username: string, fromId: number | undefined, toPage: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (fromId == null || fromId <= 0) {
        Logger.logError('No fromId given');
        return [];
    }

    const direction = toPage == null || toPage <= 0 ? -1 : 1;

    let lastSectionId: string | undefined;
    let running = true;
    let i = toPage == null || toPage <= 0 ? 1 : toPage;
    if (toPage == null || toPage <= 0) {
        while (running) {
            const figures = await getJournalsSections(username, i, semaphore);
            let currSectionId = lastSectionId;
            if (figures.length !== 0) {
                currSectionId = figures[0].id;
            }
            if (currSectionId === lastSectionId) {
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

    const allSections = [];
    lastSectionId = undefined;
    running = true;
    while (running) {
        const figures = await getJournalsSections(username, i, semaphore);
        let currSectionId: string | undefined = lastSectionId;
        if (figures.length !== 0) {
            currSectionId = figures[0].id;
        }
        if (currSectionId === lastSectionId) {
            running = false;
        } else {
            if (IdArray.containsId(figures, fromId)) {
                const figuresPush = IdArray.getSinceId(figures, fromId);
                if (direction < 0) {
                    figuresPush.reverse();
                    running = false;
                }
                allSections.push(figuresPush);
            } else {
                if (direction < 0) {
                    figures.reverse();
                }
                allSections.push(figures);
            }
            i += direction;
        }
    }
    if (direction < 0) {
        allSections.reverse();
    }

    return allSections;
}

async function getJournalsSectionsBetweenIds(username: string, fromId: number | undefined, toId: number | undefined, fromPage: number | undefined, toPage: number | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
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

    const allSections = [];
    let lastSectionId: string | undefined;
    let running = true;
    let completedPages = 0;
    while (running) {
        if (toPage != null && toPage >= 1 && i >= toPage) {
            running = false;
        }
        const sections = await getJournalsSections(username, i, semaphore);
        let currSectionId = lastSectionId;
        if (sections.length !== 0) {
            currSectionId = sections[0].id;
        }
        if (currSectionId === lastSectionId) {
            running = false;
        } else {
            if (IdArray.containsId(sections, fromId)) {
                allSections.push(IdArray.getSinceId(sections, fromId));
            }
            if (IdArray.containsId(sections, toId)) {
                allSections.push(IdArray.getBetweenIds(sections, fromId, toId));
                running = false;
            } else {
                allSections.push(sections);
                i++;
            }
        }

        completedPages++;
        if (toPage != null && toPage >= 1) {
            PercentHelper.updatePercentValue(percentId, completedPages, toPage);
        }
    }

    return allSections;
}

async function getJournalsSectionsTillPage(username: string, toPageNumber: number | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
    if (toPageNumber == null || toPageNumber <= 0) {
        Logger.logWarning('toPageNumber must be greater than 0. Using default 1 instead.');
        toPageNumber = 1;
    }

    const allSections = [];
    let completedPages = 0;
    for (let i = 1; i <= toPageNumber; i++) {
        const sections = await getJournalsSections(username, i, semaphore);
        if (sections.length !== 0) {
            allSections.push(sections);
        }

        completedPages++;
        PercentHelper.updatePercentValue(percentId, completedPages, toPageNumber);
    }

    return allSections;
}

/**
 * @param {string} username
 * @param {number} fromPageNumber
 * @param {Semaphore} semaphore
 */
async function getJournalsSectionsSincePage(username: string, fromPageNumber: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (fromPageNumber == null || fromPageNumber <= 0) {
        Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
        fromPageNumber = 1;
    }

    const allSections = [];
    let lastSectionId: string | undefined;
    let running = true;
    let i = fromPageNumber;
    while (running) {
        const sections = await getJournalsSections(username, i, semaphore);
        let currSectionId = lastSectionId;
        if (sections.length !== 0) {
            currSectionId = sections[0].id;
        }
        if (currSectionId === lastSectionId) {
            running = false;
        } else {
            allSections.push(sections);
            i++;
        }
    }

    return allSections;
}

async function getJournalsSectionsBetweenPages(username: string, fromPageNumber: number | undefined, toPageNumber: number | undefined, semaphore: Semaphore, percentId?: string | number): Promise<HTMLElement[][]> {
    if (fromPageNumber == null || fromPageNumber <= 0) {
        Logger.logWarning('fromPageNumber must be greater than 0. Using default 1 instead.');
        fromPageNumber = 1;
    }
    if (toPageNumber == null || toPageNumber <= 0) {
        Logger.logError('toPageNumber must be greater than 0. Using default 1 instead.');
        toPageNumber = 1;
    }

    const allSections = [];
    const direction = fromPageNumber < toPageNumber ? 1 : -1;
    const totalPages = Math.abs(toPageNumber - fromPageNumber) + 1;
    let completedPages = 0;
    for (let i = fromPageNumber; i <= toPageNumber; i += direction) {
        const sections = await getJournalsSections(username, i, semaphore);
        if (sections.length !== 0) {
            allSections.push(sections);
        }

        completedPages++;
        PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
    }

    return allSections;
}

async function getJournalsSections(username: string, pageNumber: number | undefined, semaphore: Semaphore): Promise<HTMLElement[]> {
    if (pageNumber == null || pageNumber <= 0) {
        Logger.logWarning('pageNumber must be greater than 0. Using default 1 instead.');
        pageNumber = 1;
    }

    const galleryDoc = await Page.getJournalsPage(username, pageNumber, semaphore);
    if (!galleryDoc) {
        Logger.logWarning(`No journals found at "${username}" on page "${pageNumber}".`);
        return [];
    }

    const columnPage = galleryDoc.getElementById('columnpage');
    if (!columnPage) {
        Logger.logWarning(`No column page found at "${username}" on page "${pageNumber}".`);
        return [];
    }
    const sections = columnPage.getElementsByTagName('section');
    if (sections == null || sections.length === 0) {
        Logger.logWarning(`No journals found at "${username}" on page "${pageNumber}".`);
        return [];
    }

    return Array.from(sections);
}
