import { requestHelper } from '..';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';

export class WatchFavScanner {
    username: string;
    lastSid: string | number | undefined;

    constructor(username: string, lastSid?: string | number) {
        this.username = username;
        this.lastSid = lastSid;
        console.log('lastSid: ' + lastSid);
    }

    async scan(): Promise<HTMLElement[]> {
        if (this.lastSid == null || this.lastSid === -1) {
            Logger.logWarning('No last sid given. Initializing...');
            const success = await this.init();
            if (!success) {
                return [];
            }
        }
        
        const figures = await requestHelper.UserRequests.GalleryRequests.Favorites.getFiguresBetweenIds(this.username, -1, this.lastSid);
        return figures.flat();
    }

    async init(): Promise<boolean> {
        const favPage = await requestHelper.UserRequests.GalleryRequests.Favorites.getPage(this.username);
        const section = favPage?.getElementById('gallery-favorites');
        this.lastSid = section?.querySelector('figure')?.id;
        return this.lastSid != null;
    }
}
