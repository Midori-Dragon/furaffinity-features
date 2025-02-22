import { MessageType } from '../utils/MessageType';
import { NukeButton } from '../components/NukeButton';

export class MessageNuker {
    constructor() {
        const messagesForm = document.getElementById('messages-form');
        const messageSections = messagesForm?.querySelectorAll('section[class="section_container"][id*="messages-"]');
        if (messageSections == null) {
            return;
        }

        for (const section of Array.from(messageSections)) {
            const sectionType = this.getSectionTypeFromElement(section as HTMLElement);
            if (sectionType === MessageType.None) {
                continue;
            }

            const nukeButton = new NukeButton(sectionType);
            const sectionControls = section.querySelector('div[class*="section_controls"]');
            if (!sectionControls) {
                continue;
            }

            sectionControls.appendChild(nukeButton.nukeButton);
        }
    }

    getSectionTypeFromElement(section: HTMLElement): MessageType {
        const sectionString = section.id.trimStart('messages-');
        switch (sectionString) {
        default: return MessageType.None;
        case 'watches': return MessageType.Watches;
        case 'comments-journal': return MessageType.JournalComments;
        case 'shouts': return MessageType.Shouts;
        case 'favorites': return MessageType.Favorites;
        case 'journals': return MessageType.Journals;   
        }
    }
}
