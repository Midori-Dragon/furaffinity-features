import { MessageType } from '../utils/MessageType';
import { NukeButton } from '../components/NukeButton';

export class SubmissionNuker {
    constructor() {
        const standardPage = document.getElementById('standardpage');
        const actionsSection = standardPage?.querySelectorAll('section[class*="actions-section"]');
        if (actionsSection == null) {
            return;
        }

        for (const section of Array.from(actionsSection)) {
            const sectionOptions = section.querySelector('div[class*="section-options"]');
            if (sectionOptions == null) {
                continue;
            }

            const nukeButton = new NukeButton(MessageType.Submission);
            sectionOptions.appendChild(nukeButton.nukeButton);
        }
    }
}
