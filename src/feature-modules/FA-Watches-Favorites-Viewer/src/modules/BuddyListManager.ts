import { loadingSpinSpeedSetting, requestHelper } from '..';
import getWatchesFromPage from '../../../../library-modules/GlobalUtils/src/FA-Functions/getWatchesFromPage';
import { IgnoreList } from '../utils/IgnoreList';
import '../styles/Style.css';

export class BuddyListManager {
    watchList: HTMLElement[] = [];

    constructor() {
        window.dispatchEvent(new CustomEvent('ig-stop-detection'));
        void this.showBuddyList();
    }

    private async showBuddyList(): Promise<void> {
        const columnPage = document.getElementById('columnpage')!;
        const sectionBody = columnPage.querySelector('div[class="section-body"]')!;
        sectionBody.innerHTML = '';

        const loadingSpinner = new window.FALoadingSpinner(sectionBody as HTMLElement);
        loadingSpinner.delay = loadingSpinSpeedSetting.value;
        loadingSpinner.spinnerThickness = 6;
        loadingSpinner.visible = true;

        const watchesPages = await requestHelper.PersonalUserRequests.ManageContent.getAllWatchesPages();
        const watchesToRemove = [];
        for (const watchesPage of watchesPages) {
            const watches = getWatchesFromPage(watchesPage);
            for (const watch of watches) {
                const success = await this.editWatchElem(watch);
                if (!success) {
                    watchesToRemove.push(watch);
                }
            }
            watchesToRemove.forEach(watch => watch.remove());
            this.watchList.push(...watches);
        }

        loadingSpinner.visible = false;

        const flexWatchList = document.createElement('div');
        flexWatchList.classList.add('flex-watchlist');
        sectionBody.appendChild(document.createElement('br'));
        sectionBody.appendChild(flexWatchList);
        flexWatchList.append(...this.watchList);
    }

    private async editWatchElem(watchElem: HTMLElement): Promise<boolean> {
        const imgElem = watchElem.querySelector('img[alt]');
        if (imgElem == null) {
            return false;
        }
        const username = imgElem.getAttribute('alt')!;
        const ignored = await IgnoreList.isIgnored(username);

        const ignoreText = document.createElement('span');
        ignoreText.classList.add('wfv-ignore-text');
        ignoreText.addEventListener('click', () => void this.handleIgnoreClick(watchElem));
        imgElem.insertAfterThis(ignoreText);

        const flexItemWatchlistAvatar = watchElem.querySelector('div[class*="flex-item-watchlist-avatar"]')! as HTMLElement;
        flexItemWatchlistAvatar.classList.add('wfv-watch-container');
        flexItemWatchlistAvatar.style.cursor = 'pointer';

        imgElem.addEventListener('click', () => void this.handleIgnoreClick(watchElem));

        const hrefElements = watchElem.querySelectorAll('a[href]');
        if (hrefElements != null) {
            for (const hrefElement of Array.from(hrefElements)) {
                hrefElement.removeAttribute('href');
            }
        }

        const removeElement = watchElem.querySelector('a[style]');
        removeElement?.remove();

        watchElem.appendChild(document.createElement('br'));

        this.watchElemSetIgnoreStatus(watchElem, ignored);

        return true;
    }

    private watchElemSetIgnoreStatus(watchElem: HTMLElement, ignored: boolean): void {
        const ignoreText = watchElem.querySelector('span[class*="wfv-ignore-text"]')! as HTMLElement;
        ignoreText.textContent = ignored ? 'Include' : 'Ignore';

        const flexItemWatchlistAvatar = watchElem.querySelector('div[class*="flex-item-watchlist-avatar"]')! as HTMLElement;
        flexItemWatchlistAvatar.classList.toggle('ignored', ignored);

        const controls = watchElem.querySelector('div[class*="flex-item-watchlist-controls"]')! as HTMLElement;
        const displayName = controls.querySelector('strong')! as HTMLElement;
        displayName.style.textDecoration = ignored ? 'line-through' : 'none';
        displayName.style.backgroundColor = ignored ? 'rgba(255, 0, 0, 0.2)' : 'transparent';
        // const name = displayName.textContent?.trimEnd(' [✓]').trimEnd(' [✗]');
        // displayName.textContent = `${name} [${ignored ? '✗' : '✓'}]`;
    }

    private async handleIgnoreClick(watchElem: HTMLElement): Promise<void> {
        const imgElem = watchElem.querySelector('img[alt]')!;
        const username = imgElem.getAttribute('alt')!;
        const ignored = await IgnoreList.isIgnored(username);
        if (ignored) {
            void IgnoreList.remove(username);
        } else {
            void IgnoreList.add(username);
        }
        this.watchElemSetIgnoreStatus(watchElem, !ignored);
    }
}
