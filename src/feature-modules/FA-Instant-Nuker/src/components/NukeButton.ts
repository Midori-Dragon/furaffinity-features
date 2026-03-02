import { requestHelper, selectNukeIconSetting, scriptName } from '..';
import { MessageType } from '../utils/MessageType';
import { NukeIconOptions } from '../utils/NukeIconOptions';
import { WhiteNukeSVG } from './WhiteNukeSVG';
import { showError } from '../utils/showError';

export class NukeButton {
    messageType: MessageType;
    nukeButton: HTMLButtonElement;

    constructor(messageType: MessageType) {
        this.messageType = messageType;
        this.nukeButton = document.createElement('button');
        this.nukeButton.type = 'button';
        this.nukeButton.classList.add('button', 'standard', 'nuke');

        if (selectNukeIconSetting.value === NukeIconOptions.Red) {
            const nukeIcon = document.createElement('div');
            nukeIcon.classList.add('in-button-icon', 'sprite-nuke');
            nukeIcon.style.margin = '0px';
            this.nukeButton.appendChild(nukeIcon);
        } else if (selectNukeIconSetting.value === NukeIconOptions.White) {
            this.nukeButton.innerHTML = WhiteNukeSVG.Svg;
        }

        this.nukeButton.addEventListener('click', () => void this.nuke());
    }

    async nuke(): Promise<void> {
        try {
            switch (this.messageType) {
                case MessageType.Watches:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Watches.nukeMessages();
                    break;
                case MessageType.JournalComments:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.JournalComments.nukeMessages();
                    break;
                case MessageType.Shouts:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Shouts.nukeMessages();
                    break;
                case MessageType.Favorites:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Favorites.nukeMessages();
                    break;
                case MessageType.Journals:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewMessages.Journals.nukeMessages();
                    break;
                case MessageType.Submission:
                    await requestHelper.PersonalUserRequests.MessageRequests.NewSubmissions.nukeSubmissions();
                    break;
            }
        } catch (error) {
            await showError(error, scriptName);
        } finally {
            location.reload();
        }
    }
}
