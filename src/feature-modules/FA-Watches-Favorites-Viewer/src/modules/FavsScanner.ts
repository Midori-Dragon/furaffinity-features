import { maxFavsAmountSetting, requestHelper, showDublicateFavsSetting } from '..';
import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import getWatchesFromPage from '../../../../library-modules/GlobalUtils/src/FA-Functions/getWatchesFromPage';
import string from '../../../../library-modules/GlobalUtils/src/string';
import { WatchFavScanner } from '../components/WatchFavScanner';
import { IgnoreList } from '../utils/IgnoreList';

export class FavsScanner {
    static readonly id = 'wfv-last-favs';
    static readonly progressPercentId = 'wfv-scan-progress-percent';
    lastFavIds: Record<string, string> = {};
    ignoredUsers: string[] = [];

    async init(): Promise<void> {
        const json = await StorageWrapper.getItemAsync(FavsScanner.id) ?? '{}';
        this.lastFavIds = JSON.parse(json);
        this.ignoredUsers = await IgnoreList.getIgnoreList();
    }

    async scanAllUsers(callBack?: (username: string, percent: number) => void): Promise<HTMLElement[]> {
        await StorageWrapper.removeItemAsync(FavsScanner.progressPercentId);
        const watchesPages = await requestHelper.PersonalUserRequests.ManageContent.getAllWatchesPages();
        const watches = watchesPages.map(page => getWatchesFromPage(page)).flat();
        const usernames = watches.map(watch => watch.querySelector('img[alt]')?.getAttribute('alt'));
        
        let figures: HTMLElement[] = [];
        let percent = 0.0;
        let current = 0;
        const total = usernames.length;
        for (const username of usernames) {
            if (string.isNullOrWhitespace(username)) {
                continue;
            } else if (this.ignoredUsers.includes(username!)) {
                continue;
            }

            const userFigures = await this.scanUser(username!);
            figures.push(...userFigures);
            current++;
            percent = Math.round(current / total * 100.0);
            await StorageWrapper.setItemAsync(FavsScanner.progressPercentId, percent.toFixed(2));
            callBack?.(username!, percent);
        }

        figures = this.applyFigureSettings(figures);
        return figures;
    }

    async scanUser(username: string): Promise<HTMLElement[]> {
        const lastFavId = this.lastFavIds[username];
        const watchFavScanner = new WatchFavScanner(username, lastFavId);
        let figures = await watchFavScanner.scan();
        if (figures.length > maxFavsAmountSetting.value) {
            figures = figures.slice(0, maxFavsAmountSetting.value);
        }
        return figures;
    }

    applyFigureSettings(figures: HTMLElement[]): HTMLElement[] {
        if (!showDublicateFavsSetting.value) {
            const seenIds = new Set();
            figures = figures.filter(figure => {
                if (!seenIds.has(figure.id)) {
                    seenIds.add(figure.id);
                    return true;
                }
                return false;
            });
        }

        return figures;
    }
}
