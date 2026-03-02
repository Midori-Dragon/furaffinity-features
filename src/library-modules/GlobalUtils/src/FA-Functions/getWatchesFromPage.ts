import { Logger } from '../Logger';

export default function getWatchesFromPage(page: Document): HTMLElement[] {
    try {
        const watchList: HTMLElement[] = [];
        const pageColumnPage = page.getElementById('columnpage')!;
        const pageSectionBody = pageColumnPage.querySelector('div[class="section-body"]')!;
        const pageWatches = pageSectionBody.querySelector('div[class="flex-watchlist"]')!;
        const watches = pageWatches.querySelectorAll<HTMLElement>('div[class="flex-item-watchlist aligncenter"]');

        for (const watch of Array.from(watches)) {
            watchList.push(watch);
        }

        return watchList;
    } catch (error) {
        Logger.logError('Failed to parse watches from page:', error);
        return [];
    }
}
