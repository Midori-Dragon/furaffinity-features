import { Semaphore } from '../../../utils/Semaphore';
import { WaitAndCallAction } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';
import { Message } from '../Message';
import { convertToNumber } from '../../../utils/GeneralUtils';
import { Logger } from '../../../../../GlobalUtils/src/Logger';

export class NewSubmissions {
    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
    }

    static get hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/submissions/';
    }

    async getSubmissionsPage(firstSubmissionId?: string | number, action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        firstSubmissionId = convertToNumber(firstSubmissionId);
        
        return await WaitAndCallAction.callFunctionAsync(getSubmissionsPageLocal, [firstSubmissionId, this._semaphore], action, delay);
    }

    async removeSubmissions(submissionIds?: string[] | number[], action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(removeSubmissionsLocal, [submissionIds, this._semaphore], action, delay);
    }

    async nukeSubmissions(action?: (percentId?: string | number) => void, delay = 100): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(nukeSubmissionsLocal, [this._semaphore], action, delay);
    }
}

async function getSubmissionsPageLocal(firstSubmissionId: number | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (firstSubmissionId == null || firstSubmissionId <= 0) {
        return await FuraffinityRequests.getHTML(`${NewSubmissions.hardLink}new@72/`, semaphore);
    } else {
        return await FuraffinityRequests.getHTML(`${NewSubmissions.hardLink}new~${firstSubmissionId}@72/`, semaphore);
    }
}

async function removeSubmissionsLocal(submissionIds: string[] | number[] | undefined, semaphore: Semaphore): Promise<Document | undefined> {
    if (submissionIds == null || submissionIds.length === 0) {
        Logger.logError('No submission ids to remove');
        return;
    }

    const payload: [key: string, value: string][] = [
        ['messagecenter-action', Message.hardActions['remove']],
    ];
    for (const submissionId of submissionIds) {
        payload.push(['submissions', submissionId.toString()]);
    }

    return await FuraffinityRequests.postHTML(`${NewSubmissions.hardLink}new@72/`, payload, semaphore);
}

async function nukeSubmissionsLocal(semaphore: Semaphore): Promise<Document | undefined> {
    const payload: { [key: string]: string | number | undefined } = {
        'messagecenter-action': Message.hardActions['nuke'],
    };
    const payloadArray = Object.entries(payload).map(([key, value]) => [key, value?.toString() ?? '']);

    return await FuraffinityRequests.postHTML(`${NewSubmissions.hardLink}new@72/`, payloadArray, semaphore);
}
