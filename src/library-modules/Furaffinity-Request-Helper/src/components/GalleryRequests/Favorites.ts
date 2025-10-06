import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { IdArray } from '../../utils/ArrayHelper';
import { Page } from './Page';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { convertToNumber } from '../../utils/GeneralUtils';
import { Logger } from '../../../../GlobalUtils/src/Logger';

export class Favorites {
    private readonly semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this.semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/favorites/';
    }

    async getSubmissionDataFavId(username : string, submissionId?: string | number, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<number> {
        submissionId = convertToNumber(submissionId);
        fromDataFavId = convertToNumber(fromDataFavId);
        toDataFavId = convertToNumber(toDataFavId);
        maxPageNo = convertToNumber(maxPageNo);
        
        return await WaitAndCallAction.callFunctionAsync(getSubmissionDataFavId, [username, submissionId, fromDataFavId, toDataFavId, maxPageNo, this.semaphore], action, delay);
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        maxPageNo = convertToNumber(maxPageNo);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresTillId, [username, toId, undefined, maxPageNo, this.semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresSinceId, [username, fromId, undefined, maxPageNo, this.semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresBetweenIds, [username, fromId, toId, undefined, undefined, maxPageNo, this.semaphore], action, delay, true);
        }
    }

    /** @deprecated Use `getFiguresBetweenIdsBetweenDataIds` instead. */
    async getFiguresBetweenIdsBetweenPages(username: string, fromId?: string | number, toId?: string | number, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        return await this.getFiguresBetweenIdsBetweenDataIds(username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo, action, delay);
    }
        
    async getFiguresBetweenIdsBetweenDataIds(username: string, fromId?: string | number, toId?: string | number, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromDataFavId = convertToNumber(fromDataFavId);
        toDataFavId = convertToNumber(toDataFavId);
        maxPageNo = convertToNumber(maxPageNo);
        
        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresTillId, [username, toId, fromDataFavId, maxPageNo, this.semaphore], action, delay);
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresSinceId, [username, fromId, toDataFavId, maxPageNo, this.semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresBetweenIds, [username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo, this.semaphore], action, delay, true);
        }
    }

    async getFiguresBetweenPages(username: string, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[][]> {
        fromDataFavId = convertToNumber(fromDataFavId);
        toDataFavId = convertToNumber(toDataFavId);
        maxPageNo = convertToNumber(maxPageNo);
        
        if (fromDataFavId == null || fromDataFavId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresTillPage, [username, toDataFavId, maxPageNo, this.semaphore], action, delay, true);
        } else if (toDataFavId == null || toDataFavId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresSincePage, [username, fromDataFavId, maxPageNo, this.semaphore], action, delay);
        } else {
            return await WaitAndCallAction.callFunctionAsync(getFavoritesFiguresBetweenPages, [username, fromDataFavId, toDataFavId, maxPageNo, this.semaphore], action, delay, true);
        }
    }

    async getFigures(username: string, fromDataFavId?: string | number, direction?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<HTMLElement[]> {
        fromDataFavId = convertToNumber(fromDataFavId);
        direction = convertToNumber(direction);
        
        return await WaitAndCallAction.callFunctionAsync(getFavoritesFigures, [username, fromDataFavId, direction, this.semaphore], action, delay);
    }

    async getPage(username: string, fromDataFavId?: string | number, direction?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        fromDataFavId = convertToNumber(fromDataFavId);
        direction = convertToNumber(direction);
        
        return await WaitAndCallAction.callFunctionAsync(Page.getFavoritesPage, [username, fromDataFavId, direction, this.semaphore], action, delay);
    }
}

async function getSubmissionDataFavId(username: string, submissionId: number | undefined, fromDataFavId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined, semaphore: Semaphore): Promise<number> {
    if (submissionId == null || submissionId <= 0) {
        Logger.logError('No submissionId given');
        return -1;
    }
    if (fromDataFavId == null || fromDataFavId <= 0) {
        Logger.logWarning('fromDataFavId must be greater than 0. Using default 1 instead.');
        fromDataFavId = -1;
    }
    if (toDataFavId == null || toDataFavId <= 0) {
        Logger.logWarning('toDataFavId must be greater than 0. Using default 1 instead.');
        toDataFavId = -1;
    }
    if (maxPageNo == null || maxPageNo <= 0) {
        Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
        maxPageNo = Number.MAX_SAFE_INTEGER;
    }

    let dataFavId = fromDataFavId;
    let lastFigureId: string | undefined;
    let running = true;
    let i = 0;
    while (running && i < maxPageNo) {
        const figures = await getFavoritesFigures(username, dataFavId, 1, semaphore);
        let currFigureId = lastFigureId;
        if (figures.length !== 0) {
            currFigureId = figures[0].id;
            const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
            if (dataFavIdString == null) {
                running = false;
                break;
            }
            dataFavId = parseInt(dataFavIdString);
            const resultFigure = figures.find(figure => figure.id.trimStart('sid-') === submissionId.toString());
            if (resultFigure != null) {
                return parseInt(resultFigure.getAttribute('data-fav-id')!);
            }
        }
        if (currFigureId === lastFigureId) {
            running = false;
        }
        i++;
    }

    return -1;
}

async function getFavoritesFiguresTillId(username: string, toId: number | undefined, fromDataFavId: number | undefined, maxPageNo: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (toId == null || toId <= 0) {
        Logger.logError('No toId given');
        return [];
    }
    if (fromDataFavId == null || fromDataFavId <= 0) {
        Logger.logWarning('No fromDataFavId given. Using default 1 instead.');
        fromDataFavId = -1;
    }
    if (maxPageNo == null || maxPageNo <= 0) {
        Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
        maxPageNo = Number.MAX_SAFE_INTEGER;
    }

    let running = true;
    let dataFavId = fromDataFavId;
    const allFigures = [];
    let lastFigureId: string | undefined;
    let i = 0;
    while (running && i < maxPageNo) {
        const figures = await getFavoritesFigures(username, dataFavId, 1, semaphore);
        let currFigureId = lastFigureId;
        if (figures.length !== 0) {
            currFigureId = figures[0].id;
            const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
            if (dataFavIdString == null) {
                running = false;
                break;
            }
            dataFavId = parseInt(dataFavIdString);
        }
        if (currFigureId === lastFigureId) {
            running = false;
        } else {
            if (IdArray.containsId(figures, toId)) {
                allFigures.push(IdArray.getTillId(figures, toId));
                running = false;
            } else {
                allFigures.push(figures);
            }
        }
        i++;
    }

    return allFigures;
}

async function getFavoritesFiguresSinceId(username: string, fromId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (fromId == null || fromId <= 0) {
        Logger.logError('No fromId given');
        return [];
    }
    if (toDataFavId == null || toDataFavId <= 0) {
        Logger.logWarning('No toDataFavId given. Using default 1 instead.');
        toDataFavId = -1;
    }
    if (maxPageNo == null || maxPageNo <= 0) {
        Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
        maxPageNo = Number.MAX_SAFE_INTEGER;
    }

    let dataFavId = toDataFavId >= 0 ? toDataFavId : -1;
    const direction = toDataFavId >= 0 ? -1 : 1;
    let lastFigureId: string | undefined;
    let running = true;
    let i = 0;

    if (toDataFavId < 0) {
        while (running && i < maxPageNo) {
            const figures = await getFavoritesFigures(username, dataFavId, direction, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, fromId)) {
                    running = false;
                    const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                    if (dataFavIdString == null) {
                        running = false;
                        break;
                    }
                    dataFavId = parseInt(dataFavIdString);
                }
            }
            i++;
        }
        running = true;
        i = 0;
    }

    const allFigures = [];
    while (running && i < maxPageNo) {
        const figures = await getFavoritesFigures(username, dataFavId, direction, semaphore);
        let currFigureId = lastFigureId;
        if (figures.length !== 0) {
            currFigureId = figures[0].id;
            const dataFavIdString = direction >= 0 ? figures[figures.length - 1].getAttribute('data-fav-id') : figures[0].getAttribute('data-fav-id');
            if (dataFavIdString == null) {
                running = false;
                break;
            }
            dataFavId = parseInt(dataFavIdString);
        }
        if (currFigureId === lastFigureId) {
            running = false;
        } else {
            if (direction < 0) {
                if (IdArray.containsId(figures, fromId)) {
                    allFigures.push(IdArray.getSinceId(figures, fromId).reverse());
                    running = false;
                } else {
                    allFigures.push(Array.from(figures).reverse());
                }
            } else {
                if (IdArray.containsId(figures, toDataFavId, 'data-fav-id')) {
                    allFigures.push(IdArray.getTillId(figures, toDataFavId, 'data-fav-id'));
                    running = false;
                } else {
                    allFigures.push(figures);
                }
            }
        }
        i++;
    }
    if (direction < 0) {
        allFigures.reverse();
    }

    return allFigures;
}

async function getFavoritesFiguresBetweenIds(username: string, fromId: number | undefined, toId: number | undefined, fromDataFavId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (fromId == null || fromId <= 0) {
        Logger.logError('No fromId given');
        return [];
    }
    if (toId == null || toId <= 0) {
        Logger.logError('No toId given');
        return [];
    }
    if (fromDataFavId == null || fromDataFavId <= 0) {
        Logger.logWarning('No fromDataFavId given. Using default 1 instead.');
        fromDataFavId = -1;
    }
    if (toDataFavId == null || toDataFavId <= 0) {
        Logger.logWarning('No toDataFavId given. Using default 1 instead.');
        toDataFavId = -1;
    }
    if (maxPageNo == null || maxPageNo <= 0) {
        Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
        maxPageNo = Number.MAX_SAFE_INTEGER;
    }

    const direction = fromDataFavId >= 0 ? 1 : (toDataFavId >= 0 ? -1 : 1);
    let dataFavId = fromDataFavId >= 0 ? fromDataFavId : toDataFavId;
    let lastFigureId: string | undefined;
    let running = true;
    let i = 0;
    if (fromDataFavId < 0 && toDataFavId < 0) {
        while (running && i < maxPageNo) {
            const figures = await getFavoritesFigures(username, dataFavId, direction, semaphore);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
                const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                if (dataFavIdString == null) {
                    running = false;
                    break;
                }
                dataFavId = parseInt(dataFavIdString);
            }
            if (currFigureId === lastFigureId) {
                running = false;
            } else {
                if (IdArray.containsId(figures, fromId)) {
                    running = false;
                }
            }
            i++;
        }
        running = true;
        i = 0;
    }

    const allFigures = [];
    lastFigureId = undefined;
    while (running && i < maxPageNo) {
        const figures = await getFavoritesFigures(username, dataFavId, direction, semaphore);
        let currFigureId: string | undefined = lastFigureId;
        if (figures.length !== 0) {
            currFigureId = figures[0].id;
            const dataFavIdString = direction >= 0 ? figures[figures.length - 1].getAttribute('data-fav-id') : figures[0].getAttribute('data-fav-id');
            if (dataFavIdString == null) {
                running = false;
                break;
            }
            dataFavId = parseInt(dataFavIdString);
        }
        if (currFigureId === lastFigureId) {
            running = false;
        } else {
            if (direction < 0) {
                if (IdArray.containsId(figures, fromId)) {
                    allFigures.push(IdArray.getSinceId(figures, fromId).reverse());
                    running = false;
                } else if (IdArray.containsId(figures, toId)) {
                    allFigures.push(IdArray.getTillId(figures, toId).reverse());
                } else {
                    allFigures.push(Array.from(figures).reverse());
                }
            } else {
                if (IdArray.containsId(figures, toId)) {
                    allFigures.push(IdArray.getTillId(figures, toId));
                    running = false;
                } else if (IdArray.containsId(figures, fromId)) {
                    allFigures.push(IdArray.getSinceId(figures, fromId));
                } else {
                    allFigures.push(figures);
                }
            }
        }
        i++;
    }
    if (direction < 0) {
        allFigures.reverse();
    }

    return allFigures;
}

async function getFavoritesFiguresTillPage(username: string, toDataFavId: number | undefined, maxPageNo: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (toDataFavId == null || toDataFavId <= 0) {
        Logger.logWarning('toDataFavId must be greater than 0. Using default 1 instead.');
        toDataFavId = -1;
    }
    if (maxPageNo == null || maxPageNo <= 0) {
        Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
        maxPageNo = Number.MAX_SAFE_INTEGER;
    }

    let dataFavId = toDataFavId;
    const allFigures = [];
    let lastFigureId: string | undefined;
    let running = true;
    let i = 0;
    while (running && i < maxPageNo) {
        const figures = await getFavoritesFigures(username, dataFavId, 1, semaphore);
        let currFigureId = lastFigureId;
        if (figures.length !== 0) {
            currFigureId = figures[0].id;
            const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
            if (dataFavIdString == null) {
                running = false;
                break;
            }
            dataFavId = parseInt(dataFavIdString);
        }
        if (currFigureId === lastFigureId) {
            running = false;
        } else {
            if (IdArray.containsId(figures, toDataFavId, 'data-fav-id')) {
                allFigures.push(IdArray.getTillId(figures, toDataFavId, 'data-fav-id'));
                running = false;
            } else {
                allFigures.push(figures);
            }
        }
        i++;
    }

    return allFigures;
}

async function getFavoritesFiguresSincePage(username: string, fromDataFavId: number | undefined, maxPageNo: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (fromDataFavId == null || fromDataFavId <= 0) {
        Logger.logWarning('fromDataFavId must be greater than 0. Using default 1 instead.');
        fromDataFavId = -1;
    }
    if (maxPageNo == null || maxPageNo <= 0) {
        Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
        maxPageNo = Number.MAX_SAFE_INTEGER;
    }

    let dataFavId = fromDataFavId;
    const allFigures = [];
    let lastFigureId: string | undefined;
    let running = true;
    let i = 0;
    while (running && i < maxPageNo) {
        const figures = await getFavoritesFigures(username, dataFavId, 1, semaphore);
        let currFigureId = lastFigureId;
        if (figures.length !== 0) {
            currFigureId = figures[0].id;
            const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
            if (dataFavIdString == null) {
                running = false;
                break;
            }
            dataFavId = parseInt(dataFavIdString);
        }
        if (currFigureId === lastFigureId) {
            running = false;
        } else {
            if (IdArray.containsId(figures, fromDataFavId, 'data-fav-id')) {
                allFigures.push(IdArray.getSinceId(figures, fromDataFavId, 'data-fav-id'));
            } else {
                allFigures.push(figures);
            }
        }
        i++;
    }

    return allFigures;
}

async function getFavoritesFiguresBetweenPages(username: string, fromDataFavId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined, semaphore: Semaphore): Promise<HTMLElement[][]> {
    if (fromDataFavId == null || fromDataFavId <= 0) {
        Logger.logWarning('fromDataFavId must be greater than 0. Using default 1 instead.');
        fromDataFavId = -1;
    }
    if (toDataFavId == null || toDataFavId <= 0) {
        Logger.logWarning('toDataFavId must be greater than 0. Using default 1 instead.');
        toDataFavId = -1;
    }
    if (maxPageNo == null || maxPageNo <= 0) {
        Logger.logWarning('maxPageNo must be greater than 0. Using default ' + Number.MAX_SAFE_INTEGER + ' instead.');
        maxPageNo = Number.MAX_SAFE_INTEGER;
    }

    let dataFavId = fromDataFavId;
    const allFigures = [];
    let lastFigureId: string | undefined;
    let running = true;
    let i = 0;
    while (running && i < maxPageNo) {
        const figures = await getFavoritesFigures(username, dataFavId, 1, semaphore);
        let currFigureId = lastFigureId;
        if (figures.length !== 0) {
            currFigureId = figures[0].id;
            const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
            if (dataFavIdString == null) {
                running = false;
                break;
            }
            dataFavId = parseInt(dataFavIdString);
        }
        if (currFigureId === lastFigureId) {
            running = false;
        } else {
            if (IdArray.containsId(figures, fromDataFavId, 'data-fav-id')) {
                allFigures.push(IdArray.getSinceId(figures, fromDataFavId, 'data-fav-id'));
            } else if (IdArray.containsId(figures, toDataFavId, 'data-fav-id')) {
                allFigures.push(IdArray.getTillId(figures, toDataFavId, 'data-fav-id'));
                running = false;
            } else {
                allFigures.push(figures);
            }
        }
        i++;
    }

    return allFigures;
}

async function getFavoritesFigures(username: string, dataFavId: number | undefined, direction: number | undefined, semaphore: Semaphore): Promise<HTMLElement[]> {
    Logger.logInfo(`Getting Favorites of "${username}" since id "${dataFavId}" and direction "${direction}".`);
    const galleryDoc = await Page.getFavoritesPage(username, dataFavId, direction, semaphore);
    if (!galleryDoc || !(galleryDoc instanceof Document) || galleryDoc.getElementById('no-images')) {
        Logger.logInfo(`No images found at favorites of "${username}" on page "${dataFavId}".`);
        return [];
    }

    const figures = galleryDoc.getElementsByTagName('figure');
    if (figures == null || figures.length === 0) {
        Logger.logInfo(`No figures found at favorites of "${username}" on page "${dataFavId}".`);
        return [];
    }

    return Array.from(figures);
}
