import { Semaphore } from '../../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { MessageTypeRequests } from './MessageTypeRequests';


export class NewMessages {
    readonly Watches: MessageTypeRequests;
    readonly JournalComments: MessageTypeRequests;
    readonly Shouts: MessageTypeRequests;
    readonly Favorites: MessageTypeRequests;
    readonly Journals: MessageTypeRequests;

    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.Watches = new MessageTypeRequests(semaphore,
            ['remove-watches', 'Remove Selected Watches'],
            ['nuke-watches', 'Nuke Watches'],
            'watches[]'
        );
        this.JournalComments = new MessageTypeRequests(semaphore,
            ['remove-journal-comments', 'Remove Selected Comments'],
            ['nuke-journal-comments', 'Nuke Journal Comments'],
            'comments-journals[]'
        );
        this.Shouts = new MessageTypeRequests(semaphore,
            ['remove-shouts', 'Remove Selected Shouts'],
            ['nuke-shouts', 'Nuke Shouts'],
            'shouts[]'
        );
        this.Favorites = new MessageTypeRequests(semaphore,
            ['remove-favorites', 'Remove Selected Favorites'],
            ['nuke-favorites', 'Nuke Favorites'],
            'favorites[]'
        );
        this.Journals = new MessageTypeRequests(semaphore,
            ['remove-journals', 'Remove Selected Journals'],
            ['nuke-journals', 'Nuke Journals'],
            'journals[]'
        );
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    static readonly hardActions: Record<string, [string, string]> = {
        remove: ['remove-all', 'Remove Selected'],
        nuke: ['nuke-all', 'Nuke Selected'],
    };

    async getMessagesPage(action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(NewMessages.hardLink, this._semaphore), action, delay);
    }

    async removeMessages(userIds?: string[] | number[], journalCommentIds?: string[] | number[], shoutIds?: string[] | number[], favoriteIds?: string[] | number[], journalIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        userIds ??= [];
        journalCommentIds ??= [];
        shoutIds ??= [];
        favoriteIds ??= [];
        journalIds ??= [];

        return await WaitAndCallAction.callFunctionAsync(() => this._removeMessages(userIds!, journalCommentIds!, shoutIds!, favoriteIds!, journalIds!), action, delay);
    }

    private async _removeMessages(userIds: string[] | number[], journalCommentIds: string[] | number[], shoutIds: string[] | number[], favoriteIds: string[] | number[], journalIds: string[] | number[]): Promise<Document | undefined> {
        const payload: [string, string][] = [
            NewMessages.hardActions['remove'],
        ];

        for (const id of userIds) payload.push(['watches[]', id.toString()]);
        for (const id of journalCommentIds) payload.push(['journalcomments[]', id.toString()]);
        for (const id of shoutIds) payload.push(['shouts[]', id.toString()]);
        for (const id of favoriteIds) payload.push(['favorites[]', id.toString()]);
        for (const id of journalIds) payload.push(['journals[]', id.toString()]);

        if (payload.length === 1) {
            throw new Error('No messages to remove');
        }

        return await FuraffinityRequests.postHTML(NewMessages.hardLink, payload, this._semaphore);
    }
}
