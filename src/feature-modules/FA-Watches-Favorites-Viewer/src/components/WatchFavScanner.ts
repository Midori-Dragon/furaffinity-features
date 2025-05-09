import { requestHelper } from '..';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { LastSidList } from '../utils/LastSidList';
import { FAFigure } from './FAFigure';

export class WatchFavScanner {
    username: string;
    lastSid: string | number | undefined;

    constructor(username: string, lastSid?: string | number) {
        this.username = username;
        this.lastSid = lastSid;
    }

    async scan(updateLastSid = false): Promise<FAFigure[]> {
        let initSuccess = false;
        if (this.lastSid == null || this.lastSid === -1) {
            Logger.logWarning('No last sid given. Initializing...');
            initSuccess = await this.init();
            if (!initSuccess) {
                return [];
            }
        }

        const userPage = await requestHelper.UserRequests.getUserPage(this.username);
        const userpageNavHeader = userPage?.body.querySelector('userpage-nav-header');
        const userNameSpan = userpageNavHeader?.querySelector('span[class="js-displayName"]');
        const userDisplayName = userNameSpan?.textContent;

        const figures = await requestHelper.UserRequests.GalleryRequests.Favorites.getFiguresBetweenIds(this.username, -1, this.lastSid);
        
        let newFigures = figures.flat();

        for (const figure of newFigures) {
            try {
                const figCaption = figure.querySelector('figcaption');
                figCaption?.setAttribute('wfv-from-user', this.username);
                figCaption?.setAttribute('wfv-from-userDisplay', userDisplayName ?? '');
            }
            catch {
                Logger.logError(`Failed to process figure for: ${this.username}`);
                continue;
            }
        }

        if (!initSuccess) {
            const lastSidIndex = newFigures.findIndex(figure => figure.id === `sid-${this.lastSid}`);
            newFigures = newFigures.slice(0, lastSidIndex);
        }

        if (updateLastSid && newFigures.length !== 0) {
            this.lastSid = newFigures[0].id.trimStart('sid-');
            const success = await LastSidList.setSid(this.username, this.lastSid);
            if (!success) {
                Logger.logError(`Failed to save last sid for: ${this.username}`);
                return [];
            }
        }
        
        return newFigures.map(figure => new FAFigure(figure));
    }

    async init(): Promise<boolean> {
        const favPage = await requestHelper.UserRequests.GalleryRequests.Favorites.getPage(this.username);
        const section = favPage?.getElementById('gallery-favorites');
        this.lastSid = section?.querySelector('figure')?.id.trimStart('sid-');
        return this.lastSid != null;
    }
}
