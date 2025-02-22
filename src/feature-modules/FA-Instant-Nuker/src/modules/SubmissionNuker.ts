import { MessageType } from '../utils/MessageType';
import { NukeButton } from '../components/NukeButton';

export class SubmissionNuker {
    constructor() {
        const standardPage = document.getElementById('standardpage');
        const actionsSection = standardPage?.querySelector('section[class*="actions-section"]');
        const sectionOptions = actionsSection?.querySelector('div[class*="section-options"]');
        if (sectionOptions == null) {
            return;
        }

        const nukeButton = new NukeButton(MessageType.Submission);
        sectionOptions.appendChild(nukeButton.nukeButton);
    }
}
