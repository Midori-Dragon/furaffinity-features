import { IdArray } from './ArrayHelper';
import { PercentHelper } from './PercentHelper';
import { Logger } from '../../../GlobalUtils/src/Logger';

export type GetElementsFn = (page: number) => Promise<HTMLElement[]>;

export async function elementsTillId(getElements: GetElementsFn, toId: number | undefined, fromPage?: number): Promise<HTMLElement[][]> {
    if (toId == null || toId <= 0) {
        Logger.logError('No toId given');
        return [];
    }

    const allElements: HTMLElement[][] = [];
    let lastElementId: string | undefined;
    let running = true;
    let i = (fromPage != null && fromPage >= 1) ? fromPage : 1;

    while (running) {
        const elements = await getElements(i);
        let currElementId = lastElementId;
        if (elements.length !== 0) {
            currElementId = elements[0].id;
        }
        if (currElementId === lastElementId) {
            running = false;
        } else {
            if (IdArray.containsId(elements, toId)) {
                allElements.push(IdArray.getTillId(elements, toId));
                running = false;
            } else {
                allElements.push(elements);
                i++;
            }
        }
    }

    return allElements;
}

export async function elementsSinceId(getElements: GetElementsFn, fromId: number | undefined, toPage?: number): Promise<HTMLElement[][]> {
    if (fromId == null || fromId <= 0) {
        Logger.logError('No fromId given');
        return [];
    }

    const direction = toPage == null || toPage <= 0 ? -1 : 1;
    let lastElementId: string | undefined;
    let running = true;
    let i = toPage == null || toPage <= 0 ? 1 : toPage;

    if (toPage == null || toPage <= 0) {
        while (running) {
            const elements = await getElements(i);
            let currElementId = lastElementId;
            if (elements.length !== 0) {
                currElementId = elements[0].id;
            }
            if (currElementId === lastElementId) {
                running = false;
            } else {
                if (IdArray.containsId(elements, fromId)) {
                    running = false;
                } else {
                    i++;
                }
            }
        }
    }

    const allElements: HTMLElement[][] = [];
    lastElementId = undefined;
    running = true;

    while (running) {
        const elements = await getElements(i);
        let currElementId: string | undefined = lastElementId;
        if (elements.length !== 0) {
            currElementId = elements[0].id;
        }
        if (currElementId === lastElementId) {
            running = false;
        } else {
            if (IdArray.containsId(elements, fromId)) {
                const elementsPush = IdArray.getSinceId(elements, fromId);
                if (direction < 0) {
                    elementsPush.reverse();
                    running = false;
                }
                allElements.push(elementsPush);
            } else {
                if (direction < 0) {
                    elements.reverse();
                }
                allElements.push(elements);
            }
            i += direction;
        }
    }

    if (direction < 0) {
        allElements.reverse();
    }

    return allElements;
}

export async function elementsBetweenIds(getElements: GetElementsFn, fromId: number | undefined, toId: number | undefined, fromPage?: number, toPage?: number, percentId?: string | number): Promise<HTMLElement[][]> {
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

    let i = (fromPage != null && fromPage >= 1) ? fromPage : 1;
    const allElements: HTMLElement[][] = [];
    let lastElementId: string | undefined;
    let running = true;
    let completedPages = 0;

    while (running) {
        if (toPage != null && toPage >= 1 && i >= toPage) {
            running = false;
        }
        const elements = await getElements(i);
        let currElementId = lastElementId;
        if (elements.length !== 0) {
            currElementId = elements[0].id;
        }
        if (currElementId === lastElementId) {
            running = false;
        } else {
            if (IdArray.containsId(elements, fromId)) {
                allElements.push(IdArray.getSinceId(elements, fromId));
            }
            if (IdArray.containsId(elements, toId)) {
                allElements.push(IdArray.getBetweenIds(elements, fromId, toId));
                running = false;
            } else {
                allElements.push(elements);
                i++;
            }
        }

        completedPages++;
        if (toPage != null && toPage >= 1) {
            PercentHelper.updatePercentValue(percentId, completedPages, toPage);
        }
    }

    return allElements;
}

export async function elementsTillPage(getElements: GetElementsFn, toPage: number | undefined, percentId?: string | number): Promise<HTMLElement[][]> {
    if (toPage == null || toPage === 0) {
        Logger.logWarning('toPage must be greater than 0. Using default 1 instead.');
        toPage = 1;
    } else if (toPage < 0) {
        toPage = Number.MAX_SAFE_INTEGER;
    }

    const allElements: HTMLElement[][] = [];
    let completedPages = 0;

    for (let i = 1; i <= toPage; i++) {
        const elements = await getElements(i);
        if (elements.length === 0) {
            i = toPage;
        } else {
            allElements.push(elements);
        }
        completedPages++;
        PercentHelper.updatePercentValue(percentId, completedPages, toPage);
    }

    return allElements;
}

export async function elementsSincePage(getElements: GetElementsFn, fromPage: number | undefined): Promise<HTMLElement[][]> {
    if (fromPage == null || fromPage <= 0) {
        Logger.logWarning('fromPage must be greater than 0. Using default 1 instead.');
        fromPage = 1;
    }

    const allElements: HTMLElement[][] = [];
    let lastElementId: string | undefined;
    let running = true;
    let i = fromPage;

    while (running) {
        const elements = await getElements(i);
        let currElementId = lastElementId;
        if (elements.length !== 0) {
            currElementId = elements[0].id;
        }
        if (currElementId === lastElementId) {
            running = false;
        } else {
            allElements.push(elements);
            i++;
        }
    }

    return allElements;
}

export async function elementsBetweenPages(getElements: GetElementsFn, fromPage: number | undefined, toPage: number | undefined, percentId?: string | number): Promise<HTMLElement[][]> {
    if (fromPage == null || fromPage <= 0) {
        Logger.logWarning('fromPage must be greater than 0. Using default 1 instead.');
        fromPage = 1;
    }
    if (toPage == null || toPage === 0) {
        Logger.logWarning('toPage must be greater than 0. Using default 1 instead.');
        toPage = 1;
    } else if (toPage < 0) {
        toPage = Number.MAX_SAFE_INTEGER;
    }

    const allElements: HTMLElement[][] = [];
    const direction = fromPage <= toPage ? 1 : -1;
    const totalPages = Math.abs(toPage - fromPage) + 1;
    let completedPages = 0;

    for (let i = fromPage; i <= toPage; i += direction) {
        const elements = await getElements(i);
        if (elements.length === 0) {
            i = toPage;
        } else {
            allElements.push(elements);
        }
        completedPages++;
        PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
    }

    return allElements;
}

export async function findElementPageNo(getElements: GetElementsFn, elementId: number | undefined, idPrefix: string, fromPage?: number, toPage?: number, percentId?: string | number): Promise<number> {
    if (elementId == null || elementId <= 0) {
        Logger.logError('No elementId given');
        return -1;
    }
    if (fromPage == null || fromPage <= 0) {
        Logger.logWarning('fromPage must be greater than 0. Using default 1 instead.');
        fromPage = 1;
    }
    if (toPage == null || toPage === 0) {
        Logger.logWarning('toPage must be greater than 0. Using default 1 instead.');
        toPage = 1;
    } else if (toPage < 0) {
        toPage = Number.MAX_SAFE_INTEGER;
    }

    const direction = fromPage <= toPage ? 1 : -1;
    const totalPages = Math.abs(toPage - fromPage) + 1;
    let completedPages = 0;

    for (let i = fromPage; i <= toPage; i += direction) {
        const elements = await getElements(i);
        if (elements.length === 0) {
            i = toPage;
        } else {
            const resultElement = elements.find(el => el.id.trimStart(idPrefix) === elementId.toString());
            if (resultElement != null) {
                return i;
            }
        }
        completedPages++;
        PercentHelper.updatePercentValue(percentId, completedPages, totalPages);
    }

    return -1;
}
