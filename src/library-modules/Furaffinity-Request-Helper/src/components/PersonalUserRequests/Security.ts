import { Semaphore } from '../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';

export class Security {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLinks(): Record<string, string> {
        return {
            sessions: FuraffinityRequests.fullUrl + '/controls/sessions/logins/',
            logs: FuraffinityRequests.fullUrl + '/controls/logs/',
            labels: FuraffinityRequests.fullUrl + '/controls/labels/',
        };
    }

    async getSessionsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(Security.hardLinks['sessions'], this._semaphore, signal), action, delay);
    }

    async getLogsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(Security.hardLinks['logs'], this._semaphore, signal), action, delay);
    }

    async getLabelsPage(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => FuraffinityRequests.getHTML(Security.hardLinks['labels'], this._semaphore, signal), action, delay);
    }
}
