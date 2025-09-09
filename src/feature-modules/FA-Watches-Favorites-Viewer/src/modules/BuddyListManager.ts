import { loadingSpinSpeedSetting, requestHelper } from '..';
import getWatchesFromPage from '../../../../library-modules/GlobalUtils/src/FA-Functions/getWatchesFromPage';
import { IgnoreList } from '../utils/IgnoreList';
import '../styles/Style.css';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';

export class BuddyListManager {
    watchList: HTMLElement[] = [];

    private sectionBody: HTMLElement;

    constructor() {
        window.dispatchEvent(new CustomEvent('ig-stop-detection'));

        const columnPage = document.getElementById('columnpage')!;
        this.sectionBody = columnPage.querySelector('div[class="section-body"]')!;
        this.sectionBody.innerHTML = '';

        void this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.showBuddyList();

        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'wfv-buddylist-button-container';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '8px';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => void this.importBuddyList(e));

        const importButton = document.createElement('button');
        importButton.id = 'wfv-import-button';
        importButton.classList.add('button', 'standard');
        importButton.textContent = 'Import';
        importButton.addEventListener('click', () => input.click());
        buttonContainer.appendChild(importButton);

        const exportButton = document.createElement('button');
        exportButton.id = 'wfv-export-button';
        exportButton.classList.add('button', 'standard');
        exportButton.textContent = 'Export';
        exportButton.addEventListener('click', () => void this.exportBuddyList());
        buttonContainer.appendChild(exportButton);

        const br = document.createElement('br');
        this.sectionBody.firstChild?.insertBeforeThis(br);
        br.insertAfterThis(buttonContainer);
    }

    private async showBuddyList(): Promise<void> {
        const loadingSpinner = new window.FALoadingSpinner(this.sectionBody as HTMLElement);
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
        this.sectionBody.appendChild(document.createElement('br'));
        this.sectionBody.appendChild(flexWatchList);
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

        const removeElement = watchElem.querySelector('a[class*="remove-link"]');
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
        const displayName = controls.querySelector('span[title]')! as HTMLElement;
        displayName.style.textDecoration = ignored ? 'line-through' : 'none';
        displayName.style.backgroundColor = ignored ? 'rgba(255, 0, 0, 0.2)' : 'transparent';
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

    private async importBuddyList(e: Event): Promise<void> {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file == null) {
            return;
        }
        
        try {
            const text = await file.text();
            const ignoreList = JSON.parse(text);
            await IgnoreList.setIgnoreList(ignoreList);
            
            Logger.logInfo('Buddy list imported successfully');
            window.location.reload();
        } catch (error) {
            Logger.logError('Failed to import buddy list', error);
        }
    }

    private async exportBuddyList(): Promise<void> {
        const ignoreList = await IgnoreList.getIgnoreList();
        const json = JSON.stringify(ignoreList, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'buddylist.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}
