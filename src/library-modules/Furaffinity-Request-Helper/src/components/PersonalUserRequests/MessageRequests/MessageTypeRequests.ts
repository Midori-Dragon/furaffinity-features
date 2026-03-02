import { Logger } from '../../../../../GlobalUtils/src/Logger';
import { Semaphore } from '../../../../../GlobalUtils/src/Semaphore';
import { WaitAndCallAction, DEFAULT_ACTION_DELAY } from '../../../utils/WaitAndCallAction';
import { FuraffinityRequests } from '../../../modules/FuraffinityRequests';

export class MessageTypeRequests {
    private readonly _semaphore: Semaphore;
    private readonly _removeAction: [string, string];
    private readonly _nukeAction: [string, string];
    private readonly _fieldName: string;

    private get _hardLink(): string {
        return FuraffinityRequests.fullUrl + '/msg/others/';
    }

    constructor(semaphore: Semaphore, removeAction: [string, string], nukeAction: [string, string], fieldName: string) {
        this._semaphore = semaphore;
        this._removeAction = removeAction;
        this._nukeAction = nukeAction;
        this._fieldName = fieldName;
    }

    async removeMessages(ids?: string[] | number[], action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._removeMessages(ids), action, delay);
    }

    async nukeMessages(action?: (percentId?: string | number) => void, delay = DEFAULT_ACTION_DELAY): Promise<Document | undefined> {
        return await WaitAndCallAction.callFunctionAsync(() => this._nukeMessages(), action, delay);
    }

    private async _removeMessages(ids?: string[] | number[]): Promise<Document | undefined> {
        if (ids == null || ids.length === 0) {
            Logger.logError('No message ids to remove');
            throw new Error('No message ids to remove');
        }
        const payload: [string, string][] = [this._removeAction];
        for (const id of ids) {
            payload.push([this._fieldName, id.toString()]);
        }
        return await FuraffinityRequests.postHTML(this._hardLink, payload, this._semaphore);
    }

    private async _nukeMessages(): Promise<Document | undefined> {
        const payload: [string, string][] = [this._nukeAction];
        return await FuraffinityRequests.postHTML(this._hardLink, payload, this._semaphore);
    }
}
