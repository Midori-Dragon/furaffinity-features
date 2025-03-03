import { Semaphore } from '../../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { Logger } from '../../../../../GlobalUtils/src/Logger';

export class NewFavorites {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    static get hardActions(): Record<string, [string, string]> {
        return {
            remove: ['remove-favorites', 'Remove Selected Favorites'],
            nuke: ['nuke-favorites', 'Nuke Favorites'],
        };
    }

    async removeMessages(submissionIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(removeFavoriteMessagesLocal, [submissionIds, this._semaphore], action, delay);
    }

    async nukeMessages(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(nukeFavoriteMessagesLocal, [this._semaphore], action, delay);
    }
}

async function removeFavoriteMessagesLocal(submissionIds: string[] | number[] | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (submissionIds == null || submissionIds.length === 0) {
        Logger.logError('No submission ids to remove');
        return;
    }

    const payload: [key: string, value: string][] = [
        NewFavorites.hardActions['remove'],
    ];
    for (const submissionId of submissionIds) {
        payload.push(['favorites[]', submissionId.toString()]);
    }

    return await FuraffinityRequests.postHTML(NewFavorites.hardLink, payload, semaphore);
}

async function nukeFavoriteMessagesLocal(semaphore: Semaphore): Promise<Document | undefined> {
    const payload: [key: string, value: string][] = [
        NewFavorites.hardActions['nuke'],
    ];

    return await FuraffinityRequests.postHTML(NewFavorites.hardLink, payload, semaphore);
}
