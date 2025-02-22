import { Semaphore } from '../../utils/Semaphore';
import { NewSubmissions } from './MessageRequests/NewSubmissions';
import { NewMessages } from './MessageRequests/NewMessages';

export class Message {
    readonly NewSubmissions: NewSubmissions;
    readonly NewMessages: NewMessages;

    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.NewSubmissions = new NewSubmissions(this._semaphore);
        this.NewMessages = new NewMessages(this._semaphore);
    }

    static get hardActions(): Record<string, string> {
        return {
            remove: 'remove_checked',
            nuke: 'nuke_notifications',
        };
    };
}
