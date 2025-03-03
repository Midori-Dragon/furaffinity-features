import { Semaphore } from '../../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { Logger } from '../../../../../GlobalUtils/src/Logger';

export class NewShouts {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    static get hardActions(): Record<string, [string, string]> {
        return {
            remove: ['remove-shouts', 'Remove Selected Shouts'],
            nuke: ['nuke-shouts', 'Nuke Shouts'],
        };
    }

    async removeMessages(shoutIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(removeShoutMessagesLocal, [shoutIds, this._semaphore], action, delay);
    }

    async nukeMessages(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(nukeShoutMessagesLocal, [this._semaphore], action, delay);
    }
}

async function removeShoutMessagesLocal(shoutIds: string[] | number[] | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (shoutIds == null || shoutIds.length === 0) {
        Logger.logError('No submission ids to remove');
        return;
    }

    const payload: [key: string, value: string][] = [
        NewShouts.hardActions['remove'],
    ];
    for (const submissionId of shoutIds) {
        payload.push(['shouts[]', submissionId.toString()]);
    }

    return await FuraffinityRequests.postHTML(NewShouts.hardLink, payload, semaphore);
}

async function nukeShoutMessagesLocal(semaphore: Semaphore): Promise<Document | undefined> {
    const payload: [key: string, value: string][] = [
        NewShouts.hardActions['nuke'],
    ];

    return await FuraffinityRequests.postHTML(NewShouts.hardLink, payload, semaphore);
}
