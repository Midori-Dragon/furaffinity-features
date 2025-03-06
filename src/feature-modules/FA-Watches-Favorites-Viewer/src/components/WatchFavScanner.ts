import { requestHelper } from '..';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { LastSidList } from '../utils/LastSidList';

export class WatchFavScanner {
    username: string;
    lastSid: string | number | undefined;

    constructor(username: string, lastSid?: string | number) {
        this.username = username;
        this.lastSid = lastSid;
    }

    async scan(updateLastSid = false): Promise<HTMLElement[]> {
        let initSuccess = false;
        if (this.lastSid == null || this.lastSid === -1) {
            Logger.logWarning('No last sid given. Initializing...');
            initSuccess = await this.init();
            if (!initSuccess) {
                return [];
            }
        }

        const figures = await requestHelper.UserRequests.GalleryRequests.Favorites.getFiguresBetweenIds(this.username, -1, this.lastSid);
        let newFigures = figures.flat();

        for (const figure of newFigures) {
            try {
                figure.setAttribute('wfv-from-user', this.username);
                figure.setAttribute('wfv-from-userDisplay', this.username);
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
            await LastSidList.setSid(this.username, this.lastSid);
        }
        
        return newFigures;
    }

    async init(): Promise<boolean> {
        const favPage = await requestHelper.UserRequests.GalleryRequests.Favorites.getPage(this.username);
        const section = favPage?.getElementById('gallery-favorites');
        this.lastSid = section?.querySelector('figure')?.id.trimStart('sid-');
        return this.lastSid != null;
    }
}
