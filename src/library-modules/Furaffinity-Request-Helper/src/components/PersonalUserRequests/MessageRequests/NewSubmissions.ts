import { Logger } from '../../../../../GlobalUtils/src/Logger';
import { Semaphore } from '../../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { Message } from '../Message';
import { convertToNumber } from '../../../utils/GeneralUtils';

export class NewSubmissions {
    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/submissions/';
    }

    async getSubmissionsPage(firstSubmissionId?: string | number, signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        firstSubmissionId = convertToNumber(firstSubmissionId);
        return await WaitAndCallAction.callFunctionAsync(() => this._getSubmissionsPage(firstSubmissionId as number | undefined, signal), action, delay);
    }

    async removeSubmissions(submissionIds?: string[] | number[], signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._removeSubmissions(submissionIds, signal), action, delay);
    }

    async nukeSubmissions(signal?: AbortSignal, action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._nukeSubmissions(signal), action, delay);
    }

    private async _getSubmissionsPage(firstSubmissionId: number | undefined, signal?: AbortSignal): Promise<Document | undefined> {
        if (firstSubmissionId == null || firstSubmissionId <= 0) {
            return await FuraffinityRequests.getHTML(`${NewSubmissions.hardLink}new@72/`, this._semaphore, signal);
        } else {
            return await FuraffinityRequests.getHTML(`${NewSubmissions.hardLink}new~${firstSubmissionId}@72/`, this._semaphore, signal);
        }
    }

    private async _removeSubmissions(submissionIds: string[] | number[] | undefined, signal?: AbortSignal): Promise<Document | undefined> {
        if (submissionIds == null || submissionIds.length === 0) {
            Logger.logError('No submission ids to remove');
            throw new Error('No submission ids to remove');
        }
        const payload: [string, string][] = [
            ['messagecenter-action', Message.hardActions['remove']],
        ];
        for (const submissionId of submissionIds) {
            payload.push(['submissions[]', submissionId.toString()]);
        }
        return await FuraffinityRequests.postHTML(`${NewSubmissions.hardLink}new@72/`, payload, this._semaphore, signal);
    }

    private async _nukeSubmissions(signal?: AbortSignal): Promise<Document | undefined> {
        const payload: [string, string][] = [
            ['messagecenter-action', Message.hardActions['nuke']],
        ];
        return await FuraffinityRequests.postHTML(`${NewSubmissions.hardLink}new@72/`, payload, this._semaphore, signal);
    }
}
