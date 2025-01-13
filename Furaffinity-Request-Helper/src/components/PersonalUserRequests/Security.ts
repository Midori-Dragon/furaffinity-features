import { Semaphore } from '../../utils/Semaphore';
import { WaitAndCallAction } from '../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../modules/FuraffinityRequests';

export class Security {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    public static get hardLinks(): Record<string, string> {
        return {
            sessions: FuraffinityRequests.fullUrl + '/controls/sessions/logins/',
            logs: FuraffinityRequests.fullUrl + '/controls/logs/',
            labels: FuraffinityRequests.fullUrl + '/controls/labels/',
        };
    }

    async getSessionsPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [Security.hardLinks['sessions'], this._semaphore], action, delay);
    }

    async getLogsPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [Security.hardLinks['logs'], this._semaphore], action, delay);
    }

    async getLabelsPage(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(FuraffinityRequests.getHTML, [Security.hardLinks['labels'], this._semaphore], action, delay);
    }
}
