import { Semaphore } from '../../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { Logger } from '../../../../../GlobalUtils/src/Logger';

export class NewJournalComments {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    static get hardActions(): Record<string, [string, string]> {
        return {
            remove: ['remove-journal-comments', 'Remove Selected Comments'],
            nuke: ['nuke-journal-comments', 'Nuke Journal Comments'],
        };
    }

    async removeMessages(commentIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(removeJournalCommentMessagesLocal, [commentIds, this._semaphore], action, delay);
    }

    async nukeMessages(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(nukeJournalCommentMessagesLocal, [this._semaphore], action, delay);
    }
}

async function removeJournalCommentMessagesLocal(commentIds: string[] | number[] | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (commentIds == null || commentIds.length === 0) {
        Logger.logError('No submission ids to remove');
        return;
    }

    const payload: [key: string, value: string][] = [
        NewJournalComments.hardActions['remove'],
    ];
    for (const submissionId of commentIds) {
        payload.push(['comments-journals[]', submissionId.toString()]);
    }

    return await FuraffinityRequests.postHTML(NewJournalComments.hardLink, payload, semaphore);
}

async function nukeJournalCommentMessagesLocal(semaphore: Semaphore): Promise<Document | undefined> {
    const payload: [key: string, value: string][] = [
        NewJournalComments.hardActions['nuke'],
    ];

    return await FuraffinityRequests.postHTML(NewJournalComments.hardLink, payload, semaphore);
}
