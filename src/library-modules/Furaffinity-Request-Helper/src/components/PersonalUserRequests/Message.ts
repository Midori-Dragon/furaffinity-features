import { RequestContext } from '../../utils/RequestContext';
import { NewSubmissions } from './MessageRequests/NewSubmissions';
import { NewMessages } from './MessageRequests/NewMessages';

export class Message {
    readonly NewSubmissions: NewSubmissions;
    readonly NewMessages: NewMessages;

    private readonly _context: RequestContext;

    constructor(context: RequestContext) {
        this._context = context;
        this.NewSubmissions = new NewSubmissions(this._context);
        this.NewMessages = new NewMessages(this._context);
    }

    static get hardActions(): Record<string, string> {
        return {
            remove: 'remove_checked',
            nuke: 'nuke_notifications',
        };
    };
}
