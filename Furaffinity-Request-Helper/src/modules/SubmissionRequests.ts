import { Semaphore } from '../utils/Semaphore';
import { WaitAndCallAction } from '../utils/WaitAndCallAction';
import { Logger } from '../utils/Logging';
import { FuraffinityRequests } from './FuraffinityRequests';

export class SubmissionRequests {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    public static get hardLinks(): Record<string, string> {
        return {
            view: FuraffinityRequests.fullUrl + '/view/',
            fav: FuraffinityRequests.fullUrl + '/fav/',
            unfav: FuraffinityRequests.fullUrl + '/unfav/',
            journal: FuraffinityRequests.fullUrl + '/journal/',
        };
    }

    public async getSubmissionPage(submissionId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(getSubmissionPageLocal, [submissionId, this._semaphore], action, delay);
    }

    public async favSubmission(submissionId?: string | number, favKey?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<string | undefined> {
        return await WaitAndCallAction.callFunctionAsync(favSubmissionLocal, [submissionId, favKey, this._semaphore], action, delay);
    }

    public async unfavSubmission(submissionId?: string | number, unfavKey?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<string | undefined> {
        return await WaitAndCallAction.callFunctionAsync(unfavSubmissionLocal, [submissionId, unfavKey, this._semaphore], action, delay);
    }

    public async getJournalPage(journalId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(getJournalPageLocal, [journalId, this._semaphore], action, delay);
    }
}

async function getSubmissionPageLocal(submissionId: string | number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (submissionId == null || submissionId === '' || submissionId === -1) {
        Logger.logError('No submissionId given');
        return;
    }

    const url = SubmissionRequests.hardLinks['view'] + submissionId;
    return await FuraffinityRequests.getHTML(url, semaphore);
}

async function favSubmissionLocal(submissionId: string | number | undefined, favKey: string | number | undefined, semaphore: Semaphore): Promise<string | undefined> {
    if (submissionId == null || submissionId === '' || submissionId === -1) {
        Logger.logError('No submissionId given');
        return;
    }
    if (favKey == null || favKey === '' || favKey === -1) {
        Logger.logError('No favKey given');
        return;
    }

    const url = SubmissionRequests.hardLinks['fav'] + submissionId + '?key=' + favKey;
    const resultDoc = await FuraffinityRequests.getHTML(url, semaphore);
    if (resultDoc == null) {
        return;
    }
    try {
        const standardpage = resultDoc.getElementById('standardpage');
        if (standardpage) {
            const blocked = standardpage.querySelector('div[class="redirect-message"]');
            if (blocked?.textContent?.includes('blocked') ?? false) {
                return;
            }
        }
        const unfavKey = getFavKeyLocal(resultDoc);
        return unfavKey;
    } catch { }
}

async function unfavSubmissionLocal(submissionId: string | number | undefined, unfavKey: string | number | undefined, semaphore: Semaphore): Promise<string | undefined> {
    if (submissionId == null || submissionId === '' || submissionId === -1) {
        Logger.logError('No submissionId given');
        return;
    }
    if (unfavKey == null || unfavKey === '' || unfavKey === -1) {
        Logger.logError('No unfavKey given');
        return;
    }

    const url = SubmissionRequests.hardLinks['unfav'] + submissionId + '?key=' + unfavKey;
    const resultDoc = await FuraffinityRequests.getHTML(url, semaphore);
    if (resultDoc) {
        const favKey = getFavKeyLocal(resultDoc);
        return favKey;
    }
}

async function getJournalPageLocal(journalId: string | number | undefined, semaphore: Semaphore): Promise<Document | undefined>{
    if (journalId == null || journalId === '' || journalId === -1) {
        Logger.logError('No journalId given');
        return;
    }

    const url = SubmissionRequests.hardLinks['journal'] + journalId;
    return await FuraffinityRequests.getHTML(url, semaphore);
}

function getFavKeyLocal(doc: Document): string | undefined {
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
        const favKey = favButton.getAttribute('href')?.split('?key=')[1];
        return favKey;
    }
}
