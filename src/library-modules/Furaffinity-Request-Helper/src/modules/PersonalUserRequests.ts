import { RequestContext } from '../utils/RequestContext';
import { Message } from '../components/PersonalUserRequests/Message';
import { AccountInformation } from '../components/PersonalUserRequests/AccountInformation';
import { UserProfile } from '../components/PersonalUserRequests/UserProfile';
import { ManageContent } from '../components/PersonalUserRequests/ManageContent';
import { Security } from '../components/PersonalUserRequests/Security';

export class PersonalUserRequests {
    readonly MessageRequests: Message;
    readonly AccountInformation: AccountInformation;
    readonly UserProfile: UserProfile;
    readonly ManageContent: ManageContent;
    readonly Security: Security;

    private readonly _context: RequestContext;

    constructor(context: RequestContext) {
        this._context = context;
        this.MessageRequests = new Message(this._context);
        this.AccountInformation = new AccountInformation(this._context);
        this.UserProfile = new UserProfile(this._context);
        this.ManageContent = new ManageContent(this._context);
        this.Security = new Security(this._context);
    }
}
