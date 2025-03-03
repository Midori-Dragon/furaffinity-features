import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
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

    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.MessageRequests = new Message(this._semaphore);
        this.AccountInformation = new AccountInformation(this._semaphore);
        this.UserProfile = new UserProfile(this._semaphore);
        this.ManageContent = new ManageContent(this._semaphore);
        this.Security = new Security(this._semaphore);
    }
}
