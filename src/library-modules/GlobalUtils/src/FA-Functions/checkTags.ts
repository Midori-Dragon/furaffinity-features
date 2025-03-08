import { Logger } from '../Logger';

export default function (element: HTMLElement): void {
    const userLoggedIn = document.body.getAttribute('data-user-logged-in') === '1';
    if (!userLoggedIn) {
        Logger.logWarning('User is not logged in, skipping tag check');
        setBlockedState(element, false);
        return;
    }
    const tagsHideMissingTags = document.body.getAttribute('data-tag-blocklist-hide-tagless') === '1';

    const tags = element.getAttribute('data-tags')?.trim().split(/\s+/);
    let blockReason = '';

    if (tags != null && tags.length > 0 && tags[0] !== '') {
        // image has tags
        const blockedTags = getBannedTags(tags);

        if (blockedTags.length <= 0) {
            setBlockedState(element, false);
        } else {
            setBlockedState(element, true);
            Logger.logInfo(`${element.id} blocked tags: ${blockedTags.join(', ')}`);

            // provide hint
            blockReason = 'Blocked tags:\n';
            for (const tag of blockedTags) {
                blockReason += '• ' + tag + '\n';
            }
        }
    } else {
        // image has no tags
        setBlockedState(element, tagsHideMissingTags);

        // provide hint
        if (tagsHideMissingTags) {
            blockReason = 'Content is missing tags.';
        }
    }

    if (blockReason !== '' && element.id !== 'submissionImg') {
        // apply hint to everything but main image on submission view page
        //element.setAttribute('data-block-reason', block_reason);
        element.setAttribute('title', blockReason);
    }
}

function getBannedTags(tags: string[] | undefined | null): string[] {
    const blockedTags = document.body.getAttribute('data-tag-blocklist') ?? '';
    const tagsBlocklist = Array.from(blockedTags.split(' '));
    
    let bTags = [];

    if (tags == null || tags.length === 0) {
        return [];
    }

    for (const tag of tags) {
        for (const blockedTag of tagsBlocklist) {
            if (tag === blockedTag) {
                bTags.push(blockedTag);
            }
        }
    }

    // Remove dupes and return
    return [...new Set(bTags)];
}

function setBlockedState(element: HTMLElement, isBlocked: boolean): void {
    element.classList[isBlocked ? 'add' : 'remove']('blocked-content');
}
