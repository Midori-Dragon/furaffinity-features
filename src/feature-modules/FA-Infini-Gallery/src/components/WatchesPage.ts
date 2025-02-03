import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { requestHelper, showPageSeparatorSetting } from '../index';
import { IGalleryPage } from '../modules/IGalleryPage';
import { createSeparatorElem } from '../utils/Utils';

export class WatchesPage implements IGalleryPage {
    pageNo: number;
    gallery: HTMLElement;

    constructor(pageNo: number) {
        this.pageNo = pageNo;

        const columnpage = document.getElementById('columnpage')!;
        this.gallery = columnpage.querySelector('div[class="section-body"]')!;
        this.gallery.style.display = 'flex';
        this.gallery.style.flexWrap = 'wrap';
    }

    async getPage(): Promise<Document | undefined> {
        Logger.logInfo(`Getting page WatchesPage '${this.pageNo}'`);
        const page = await requestHelper.PersonalUserRequests.ManageContent.getWatchesPage(this.pageNo);
        return page;
    }

    async loadPage(prevWatches?: HTMLElement[]): Promise<HTMLElement[]> {
        const page = await this.getPage();
        if (page == null) {
            throw new Error('No page found');
        }

        prevWatches ??= [];
        const prevHrefs = prevWatches.map(watch => (watch.querySelector('a[href]') as HTMLLinkElement)?.href);

        let watches = this.getWatchesFromPage(page);
        watches = watches.filter(watch => !prevHrefs.includes((watch.querySelector('a[href]') as HTMLLinkElement)?.href));

        if (watches.length !== 0) {
            // Check if we should show a page separator
            if (showPageSeparatorSetting.value) {
                const separator = createSeparatorElem(this.pageNo);
                separator.style.width = 'fit-content';
                separator.style.margin = '14px auto';
                this.gallery.appendChild(document.createElement('br'));
                this.gallery.appendChild(separator);
                this.gallery.appendChild(document.createElement('br'));
            }

            // Add the watches to the gallery
            const watchesContainer = document.createElement('div');
            watchesContainer.className = 'flex-watchlist';
            this.gallery.appendChild(watchesContainer);
            watchesContainer.append(...watches);
        } else {
            throw new Error('No watches found');
        }

        return watches;
    }

    private getWatchesFromPage(page: Document): HTMLElement[] {
        try {
            const watchList: HTMLElement[] = [];
            const pageColumnPage = page.getElementById('columnpage')!;
            const pageSectionBody = pageColumnPage.querySelector('div[class="section-body"]')!;
            const pageWatches = pageSectionBody.querySelector('div[class="flex-watchlist"]')!;
            const watches = pageWatches.querySelectorAll('div[class="flex-item-watchlist aligncenter"]')!;

            for (const watch of Array.from(watches).map(elem => elem as HTMLElement)) {
                watchList.push(watch);
            }

            return watchList;
        } catch (e) {
            Logger.logError(e);
            return [];
        }
    }
}
