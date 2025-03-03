import { Semaphore } from '../../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { Logger } from '../../../../../GlobalUtils/src/Logger';

export class NewWatches {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    static get hardActions(): Record<string, [string, string]> {
        return {
            remove: ['remove-watches', 'Remove Selected Watches'],
            nuke: ['nuke-watches', 'Nuke Watches'],
        };
    }

    async removeMessages(userIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(removeWatchMessagesLocal, [userIds, this._semaphore], action, delay);
    }

    async nukeMessages(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(nukeWatchMessagesLocal, [this._semaphore], action, delay);
    }
}

async function removeWatchMessagesLocal(userIds: string[] | number[] | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (userIds == null || userIds.length === 0) {
        Logger.logError('No submission ids to remove');
        return;
    }

    const payload: [key: string, value: string][] = [
        NewWatches.hardActions['remove'],
    ];
    for (const submissionId of userIds) {
        payload.push(['watches[]', submissionId.toString()]);
    }

    return await FuraffinityRequests.postHTML(NewWatches.hardLink, payload, semaphore);
}

async function nukeWatchMessagesLocal(semaphore: Semaphore): Promise<Document | undefined> {
    const payload: [key: string, value: string][] = [
        NewWatches.hardActions['nuke'],
    ];

    return await FuraffinityRequests.postHTML(NewWatches.hardLink, payload, semaphore);
}
