import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { IdArray } from '../../utils/ArrayHelper';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';
import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { convertToNumber } from '../../utils/GeneralUtils';
import { Logger } from '../../../../GlobalUtils/src/Logger';
import checkTagsAll from '../../../../GlobalUtils/src/FA-Functions/checkTagsAll';

export class Favorites {
    private readonly semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this.semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/favorites/';
    }

    static async fetchPage(username: string | undefined, dataFavId: number | undefined, direction: number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
        if (username == null) {
            throw new Error('Cannot fetch favorites page: no username given');
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

    async getSubmissionDataFavId(username: string, submissionId?: string | number, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<number> {
        submissionId = convertToNumber(submissionId);
        fromDataFavId = convertToNumber(fromDataFavId);
        toDataFavId = convertToNumber(toDataFavId);
        maxPageNo = convertToNumber(maxPageNo);

        return await WaitAndCallAction.callFunctionAsync(
            () => this._getSubmissionDataFavId(username, submissionId as number | undefined, fromDataFavId as number | undefined, toDataFavId as number | undefined, maxPageNo as number | undefined),
            action, delay
        );
    }

    async getFiguresBetweenIds(username: string, fromId?: string | number, toId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        maxPageNo = convertToNumber(maxPageNo);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresTillId(username, toId as number | undefined, undefined, maxPageNo as number | undefined),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresSinceId(username, fromId as number | undefined, undefined, maxPageNo as number | undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresBetweenIds(username, fromId as number | undefined, toId as number | undefined, undefined, undefined, maxPageNo as number | undefined),
                action, delay
            );
        }
    }

    /** @deprecated Use `getFiguresBetweenIdsBetweenDataIds` instead. */
    async getFiguresBetweenIdsBetweenPages(username: string, fromId?: string | number, toId?: string | number, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        return await this.getFiguresBetweenIdsBetweenDataIds(username, fromId, toId, fromDataFavId, toDataFavId, maxPageNo, action, delay);
    }

    async getFiguresBetweenIdsBetweenDataIds(username: string, fromId?: string | number, toId?: string | number, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromId = convertToNumber(fromId);
        toId = convertToNumber(toId);
        fromDataFavId = convertToNumber(fromDataFavId);
        toDataFavId = convertToNumber(toDataFavId);
        maxPageNo = convertToNumber(maxPageNo);

        if (fromId == null || fromId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresTillId(username, toId as number | undefined, fromDataFavId as number | undefined, maxPageNo as number | undefined),
                action, delay
            );
        } else if (toId == null || toId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresSinceId(username, fromId as number | undefined, toDataFavId as number | undefined, maxPageNo as number | undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresBetweenIds(username, fromId as number | undefined, toId as number | undefined, fromDataFavId as number | undefined, toDataFavId as number | undefined, maxPageNo as number | undefined),
                action, delay
            );
        }
    }

    async getFiguresBetweenPages(username: string, fromDataFavId?: string | number, toDataFavId?: string | number, maxPageNo?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[][]> {
        fromDataFavId = convertToNumber(fromDataFavId);
        toDataFavId = convertToNumber(toDataFavId);
        maxPageNo = convertToNumber(maxPageNo);

        if (fromDataFavId == null || fromDataFavId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresTillPage(username, toDataFavId as number | undefined, maxPageNo as number | undefined),
                action, delay
            );
        } else if (toDataFavId == null || toDataFavId <= 0) {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresSincePage(username, fromDataFavId as number | undefined, maxPageNo as number | undefined),
                action, delay
            );
        } else {
            return await WaitAndCallAction.callFunctionAsync(
                () => this._getFiguresBetweenPages(username, fromDataFavId as number | undefined, toDataFavId as number | undefined, maxPageNo as number | undefined),
                action, delay
            );
        }
    }

    async getFigures(username: string, fromDataFavId?: string | number, direction?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<HTMLElement[]> {
        fromDataFavId = convertToNumber(fromDataFavId);
        direction = convertToNumber(direction);

        return await WaitAndCallAction.callFunctionAsync(
            () => this._getFigures(username, fromDataFavId as number | undefined, direction as number | undefined),
            action, delay
        );
    }

    async getPage(username: string, fromDataFavId?: string | number, direction?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        fromDataFavId = convertToNumber(fromDataFavId);
        direction = convertToNumber(direction);

        return await WaitAndCallAction.callFunctionAsync(
            () => Favorites.fetchPage(username, fromDataFavId as number | undefined, direction as number | undefined, this.semaphore),
            action, delay
        );
    }

    private async _getSubmissionDataFavId(username: string, submissionId: number | undefined, fromDataFavId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined): Promise<number> {
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
            const figures = await this._getFigures(username, dataFavId, 1);
            let currFigureId = lastFigureId;
            if (figures.length !== 0) {
                currFigureId = figures[0].id;
                const dataFavIdString = figures[figures.length - 1].getAttribute('data-fav-id');
                if (dataFavIdString == null) {
                    running = false;
                    break;
                }
                dataFavId = parseInt(dataFavIdString);
                const resultFigure = figures.find(figure => figure.id.trimStart('sid-') === submissionId!.toString());
                if (resultFigure != null) {
                    return parseInt(resultFigure.getAttribute('data-fav-id')!);
                }
            }
            if (currFigureId === lastFigureId) {
                running = false;
            }
            i++;
        }
        if (i >= maxPageNo) {
            Logger.logWarning('Max page number reached. Aborting.');
        }

        return -1;
    }

    private async _getFiguresTillId(username: string, toId: number | undefined, fromDataFavId: number | undefined, maxPageNo: number | undefined): Promise<HTMLElement[][]> {
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
            const figures = await this._getFigures(username, dataFavId, 1);
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
        if (i >= maxPageNo) {
            Logger.logWarning('Max page number reached. Aborting.');
        }

        return allFigures;
    }

    private async _getFiguresSinceId(username: string, fromId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined): Promise<HTMLElement[][]> {
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
                const figures = await this._getFigures(username, dataFavId, direction);
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
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            running = true;
            i = 0;
        }

        const allFigures = [];
        while (running && i < maxPageNo) {
            const figures = await this._getFigures(username, dataFavId, direction);
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
        if (i >= maxPageNo) {
            Logger.logWarning('Max page number reached. Aborting.');
        }

        return allFigures;
    }

    private async _getFiguresBetweenIds(username: string, fromId: number | undefined, toId: number | undefined, fromDataFavId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined): Promise<HTMLElement[][]> {
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
                const figures = await this._getFigures(username, dataFavId, direction);
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
            if (i >= maxPageNo) {
                Logger.logWarning('Max page number reached. Aborting.');
            }
            running = true;
            i = 0;
        }

        const allFigures = [];
        lastFigureId = undefined;
        while (running && i < maxPageNo) {
            const figures = await this._getFigures(username, dataFavId, direction);
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
        if (i >= maxPageNo) {
            Logger.logWarning('Max page number reached. Aborting.');
        }
        if (direction < 0) {
            allFigures.reverse();
        }

        return allFigures;
    }

    private async _getFiguresTillPage(username: string, toDataFavId: number | undefined, maxPageNo: number | undefined): Promise<HTMLElement[][]> {
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
            const figures = await this._getFigures(username, dataFavId, 1);
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
        if (i >= maxPageNo) {
            Logger.logWarning('Max page number reached. Aborting.');
        }

        return allFigures;
    }

    private async _getFiguresSincePage(username: string, fromDataFavId: number | undefined, maxPageNo: number | undefined): Promise<HTMLElement[][]> {
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
            const figures = await this._getFigures(username, dataFavId, 1);
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
        if (i >= maxPageNo) {
            Logger.logWarning('Max page number reached. Aborting.');
        }

        return allFigures;
    }

    private async _getFiguresBetweenPages(username: string, fromDataFavId: number | undefined, toDataFavId: number | undefined, maxPageNo: number | undefined): Promise<HTMLElement[][]> {
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
            const figures = await this._getFigures(username, dataFavId, 1);
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
        if (i >= maxPageNo) {
            Logger.logWarning('Max page number reached. Aborting.');
        }

        return allFigures;
    }

    private async _getFigures(username: string, dataFavId: number | undefined, direction: number | undefined): Promise<HTMLElement[]> {
        Logger.logInfo(`Getting Favorites of "${username}" since id "${dataFavId}" and direction "${direction}".`);
        const galleryDoc = await Favorites.fetchPage(username, dataFavId, direction, this.semaphore);
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
}
