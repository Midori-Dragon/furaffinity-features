import { maxFavsAmountSetting, requestHelper, showDublicateFavsSetting, showFavFromWatcherSetting } from '..';
import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import getWatchesFromPage from '../../../../library-modules/GlobalUtils/src/FA-Functions/getWatchesFromPage';
import string from '../../../../library-modules/GlobalUtils/src/string';
import { WatchFavScanner } from '../components/WatchFavScanner';
import { IgnoreList } from '../utils/IgnoreList';
import { Semaphore } from '../../../../library-modules/GlobalUtils/src/Semaphore';
import { LastSidList } from '../utils/LastSidList';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { FAFigure } from '../components/FAFigure';

export class FavsScanner {
    static readonly progressPercentId = 'wfv-scan-progress-percent';
    lastFavIds: Record<string, string> = {};
    ignoredUsers: string[] = [];
    amountOperations = 0;

    async init(): Promise<void> {
        this.lastFavIds = await LastSidList.getSidList();
        this.ignoredUsers = await IgnoreList.getIgnoreList();
    }

    async scanAllUsers(callBack?: (username: string, percent: number, userFigures: FAFigure[]) => void): Promise<FAFigure[]> {
        await StorageWrapper.removeItemAsync(FavsScanner.progressPercentId);
        const watchesPages = await requestHelper.PersonalUserRequests.ManageContent.getAllWatchesPages();
        const watches = watchesPages.map(page => getWatchesFromPage(page)).flat();
        let usernames = watches.map(watch => watch.querySelector('img[alt]')?.getAttribute('alt'));
        
        // Create a semaphore with max concurrency of 2
        const semaphore = new Semaphore(requestHelper.maxAmountRequests);
        
        // Filter out null/whitespace usernames and ignored users
        usernames = usernames.filter(username => 
            !string.isNullOrWhitespace(username) && 
            !this.ignoredUsers.includes(username!)
        );

        let figures: FAFigure[] = [];
        let percent = 0.0;
        let current = 0;
        const total = usernames.length;
        
        // Use Promise.all with a map to process users concurrently with semaphore control
        await Promise.all(usernames.map(async (username) => {
            // Acquire a semaphore permit
            await semaphore.acquire();
            
            try {
                const userFigures = await this.scanUser(username!);
                
                // Synchronize access to shared resources
                synchronized: {
                    figures.push(...userFigures);
                    current++;
                    percent = (current / total * 100.0);
                    await StorageWrapper.setItemAsync(FavsScanner.progressPercentId, percent.toFixed(2));
                    callBack?.(username!, percent, userFigures);
                }
            } finally {
                // Always release the semaphore
                semaphore.release();
            }
        }));

        figures = this.applyFigureSettings(figures);
        return figures;
    }

    async scanUser(username: string): Promise<FAFigure[]> {
        if (this.amountOperations >= 80) {
            Logger.logWarning(`Amount of operations reached 80. Stopping scan for ${username}.`);
            return [];
        }

        const lastFavId = this.lastFavIds[username]?.trimStart('sid-');
        const watchFavScanner = new WatchFavScanner(username, lastFavId);
        let figures = await watchFavScanner.scan(true);
        if (figures.length > maxFavsAmountSetting.value) {
            this.amountOperations++;
            figures = figures.slice(0, maxFavsAmountSetting.value);
        }
        return figures;
    }

    applyFigureSettings(figures: FAFigure[]): FAFigure[] {
        if (!showDublicateFavsSetting.value) {
            Logger.logInfo('Removing duplicate favorites');
            const seenIds = new Set();
            figures = figures.filter(figure => {
                if (!seenIds.has(figure.id)) {
                    seenIds.add(figure.id);
                    return true;
                }
                return false;
            });
        }

        if (!showFavFromWatcherSetting.value) {
            Logger.logInfo('Adding watch information to favorites');
            for (const figure of figures) {
                try {
                    figure.figCaption.fromId = '';
                    figure.figCaption.fromUsername = '';
                } catch {
                    Logger.logError(`Failed to get from watch for ${figure.id}`);
                }
            }
        }

        return figures;
    }
}
