import { Semaphore } from '../../../utils/Semaphore';
import { WaitAndCallAction } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { NewWatches } from './NewWatches';
import { NewJournalComments } from './NewJournalComments';
import { NewShouts } from './NewShouts';
import { NewFavorites } from './NewFavorites';
import { NewJournals } from './NewJournals';
import { Logger } from '../../../../../GlobalUtils/src/Logger';

export class NewMessages {
    readonly Watches: NewWatches;
    readonly JournalComments: NewJournalComments;
    readonly Shouts: NewShouts;
    readonly Favorites: NewFavorites;
    readonly Journals: NewJournals;

    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.Watches = new NewWatches(this._semaphore);
        this.JournalComments = new NewJournalComments(this._semaphore);
        this.Shouts = new NewShouts(this._semaphore);
        this.Favorites = new NewFavorites(this._semaphore);
        this.Journals = new NewJournals(this._semaphore);
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    static get hardActions(): Record<string, [string, string]> {
        return {
            remove: ['remove-all', 'Remove Selected'],
            nuke: ['nuke-all', 'Nuke Selected'],
        };
    }

    async getMessagesPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(getMessagesPageLocal, [this._semaphore], action, delay);
    }

    async removeMessages(userIds?: string[] | number[], journalCommentIds?: string[] | number[], shoutIds?: string[] | number[], favoriteIds?: string[] | number[], journalIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        userIds ??= [];
        journalCommentIds ??= [];
        shoutIds ??= [];
        favoriteIds ??= [];
        journalIds ??= [];
        
        return await WaitAndCallAction.callFunctionAsync(removeMessagesLocal, [userIds, journalCommentIds, shoutIds, favoriteIds, journalIds, this._semaphore], action, delay);
    }
}

async function getMessagesPageLocal(semaphore: Semaphore): Promise<Document | undefined> {
    return await FuraffinityRequests.getHTML(NewMessages.hardLink, semaphore);
}

async function removeMessagesLocal(userIds: string[] | number[], journalCommentIds: string[] | number[], shoutIds: string[] | number[], favoriteIds: string[] | number[], journalIds: string[] | number[], semaphore: Semaphore): Promise<Document | undefined> {
    const payload: [key: string, value: string][] = [
        NewMessages.hardActions['remove'],
    ];

    if (userIds != null && userIds.length !== 0) {
        for (const submissionId of userIds) {
            payload.push(['watches[]', submissionId.toString()]);
        }
    }

    if (journalCommentIds != null && journalCommentIds.length !== 0) {
        for (const submissionId of journalCommentIds) {
            payload.push(['journalcomments[]', submissionId.toString()]);
        }
    }

    if (shoutIds != null && shoutIds.length !== 0) {
        for (const submissionId of shoutIds) {
            payload.push(['shouts[]', submissionId.toString()]);
        }
    }

    if (favoriteIds != null && favoriteIds.length !== 0) {
        for (const submissionId of favoriteIds) {
            payload.push(['favorites[]', submissionId.toString()]);
        }
    }

    if (journalIds != null && journalIds.length !== 0) {
        for (const submissionId of journalIds) {
            payload.push(['journals[]', submissionId.toString()]);
        }
    }

    if (payload.length === 0) {
        Logger.logError('No messages to remove');
        return;
    }

    return await FuraffinityRequests.postHTML(NewMessages.hardLink, payload, semaphore);
}
