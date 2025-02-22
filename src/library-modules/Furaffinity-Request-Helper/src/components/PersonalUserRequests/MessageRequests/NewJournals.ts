import { Semaphore } from '../../../utils/Semaphore';
import { WaitAndCallAction } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { Logger } from '../../../../../GlobalUtils/src/Logger';

export class NewJournals {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    static get hardActions(): Record<string, [string, string]> {
        return {
            remove: ['remove-journals', 'Remove Selected Journals'],
            nuke: ['nuke-journals', 'Nuke Journals'],
        };
    }

    async removeMessages(journalIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(removeJournalMessagesLocal, [journalIds, this._semaphore], action, delay);
    }

    async nukeMessages(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(nukeJournalMessagesLocal, [this._semaphore], action, delay);
    }
}

async function removeJournalMessagesLocal(journalIds: string[] | number[] | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (journalIds == null || journalIds.length === 0) {
        Logger.logError('No submission ids to remove');
        return;
    }

    const payload: [key: string, value: string][] = [
        NewJournals.hardActions['remove'],
    ];
    for (const submissionId of journalIds) {
        payload.push(['journals[]', submissionId.toString()]);
    }

    return await FuraffinityRequests.postHTML(NewJournals.hardLink, payload, semaphore);
}

async function nukeJournalMessagesLocal(semaphore: Semaphore): Promise<Document | undefined> {
    const payload: [key: string, value: string][] = [
        NewJournals.hardActions['nuke'],
    ];

    return await FuraffinityRequests.postHTML(NewJournals.hardLink, payload, semaphore);
}
