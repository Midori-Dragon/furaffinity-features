import { Logger } from '../../../GlobalUtils/src/Logger';
import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../utils/WaitAndCallAction';
import { FuraffinityRequests } from './FuraffinityRequests';

export class SubmissionRequests {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLinks(): Record<string, string> {
        return {
            view: FuraffinityRequests.fullUrl + '/view/',
            fav: FuraffinityRequests.fullUrl + '/fav/',
            unfav: FuraffinityRequests.fullUrl + '/unfav/',
            journal: FuraffinityRequests.fullUrl + '/journal/',
        };
    }

    async getSubmissionPage(submissionId?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._getSubmissionPage(submissionId), action, delay);
    }

    async favSubmission(submissionId?: string | number, favKey?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<string | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._favSubmission(submissionId, favKey), action, delay);
    }

    async unfavSubmission(submissionId?: string | number, unfavKey?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<string | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._unfavSubmission(submissionId, unfavKey), action, delay);
    }

    async getJournalPage(journalId?: string | number, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._getJournalPage(journalId), action, delay);
    }

    private async _getSubmissionPage(submissionId: string | number | undefined): Promise<Document | undefined> {
        if (submissionId == null || submissionId === '' || submissionId === -1) {
            Logger.logError('No submissionId given');
            throw new Error('No submissionId given');
        }
        const url = SubmissionRequests.hardLinks['view'] + submissionId;
        return await FuraffinityRequests.getHTML(url, this._semaphore);
    }

    private async _favSubmission(submissionId: string | number | undefined, favKey: string | number | undefined): Promise<string | undefined> {
        if (submissionId == null || submissionId === '' || submissionId === -1) {
            Logger.logError('No submissionId given');
            throw new Error('No submissionId given');
        }
        if (favKey == null || favKey === '' || favKey === -1) {
            Logger.logError('No favKey given');
            throw new Error('No favKey given');
        }
        const url = SubmissionRequests.hardLinks['fav'] + submissionId + '?key=' + favKey;
        const resultDoc = await FuraffinityRequests.getHTML(url, this._semaphore);
        if (resultDoc == null) {
            Logger.logError('Failed to fetch fav page');
            throw new Error('Failed to fetch fav page');
        }
        const standardpage = resultDoc.getElementById('standardpage');
        if (standardpage) {
            const blocked = standardpage.querySelector('div[class="redirect-message"]');
            if (blocked != null && (blocked.textContent?.includes('blocked') ?? false)) {
                const errorMessage = blocked.textContent?.trim() ?? 'Cannot fav: you are blocked by this user';
                Logger.logError(errorMessage);
                throw new Error(errorMessage);
            }
        }
        return this._getFavKey(resultDoc);
    }

    private async _unfavSubmission(submissionId: string | number | undefined, unfavKey: string | number | undefined): Promise<string | undefined> {
        if (submissionId == null || submissionId === '' || submissionId === -1) {
            Logger.logError('No submissionId given');
            throw new Error('No submissionId given');
        }
        if (unfavKey == null || unfavKey === '' || unfavKey === -1) {
            Logger.logError('No unfavKey given');
            throw new Error('No unfavKey given');
        }
        const url = SubmissionRequests.hardLinks['unfav'] + submissionId + '?key=' + unfavKey;
        const resultDoc = await FuraffinityRequests.getHTML(url, this._semaphore);
        if (resultDoc == null) {
            Logger.logError('Failed to fetch unfav page');
            throw new Error('Failed to fetch unfav page');
        }
        return this._getFavKey(resultDoc);
    }

    private async _getJournalPage(journalId: string | number | undefined): Promise<Document | undefined> {
        if (journalId == null || journalId === '' || journalId === -1) {
            Logger.logError('No journalId given');
            throw new Error('No journalId given');
        }
        const url = SubmissionRequests.hardLinks['journal'] + journalId;
        return await FuraffinityRequests.getHTML(url, this._semaphore);
    }

    private _getFavKey(doc: Document): string | undefined {
        const columnPage = doc.getElementById('columnpage');
        const navbar = columnPage?.querySelector('div[class*="favorite-nav"');
        const buttons = navbar?.querySelectorAll('a[class*="button"][href]');
        if (!buttons || buttons.length === 0) {
            return;
        }
        let favButton;
        for (const button of Array.from(buttons)) {
            if (button?.textContent?.toLowerCase().includes('fav') ?? false) {
                favButton = button;
            }
        }
        if (favButton != null) {
            return favButton.getAttribute('href')?.split('?key=')[1];
        }
    }
}
