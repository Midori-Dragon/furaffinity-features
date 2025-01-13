import { Semaphore } from '../../utils/Semaphore';
import { NewSubmissions } from './MessageRequests/NewSubmissions';

export class Message {
    public readonly NewSubmissions: NewSubmissions;

    private readonly _semaphore: Semaphore;
    
    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.NewSubmissions = new NewSubmissions(this._semaphore);
    }

    public static get hardActions(): Record<string, string> {
        return {
            remove: 'remove_checked',
            nuke: 'nuke_notifications',
        };
    };
}
