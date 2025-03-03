import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { PakoWrapper } from '../../../../library-modules/GlobalUtils/src/PakoWrapper';
import { FavsScanner } from '../modules/FavsScanner';

export class WatchScanButton {
    static readonly scanResultId = 'wfv-scan-results';
    private wfButton: HTMLAnchorElement;

    constructor() {
        const ddmenu = document.getElementById('ddmenu')!;
        const nav = ddmenu.querySelector('ul[class*="navhideonmobile"]')!;
        const messageBar = nav.querySelector('li[class*="message-bar-desktop"]')!;
        
        this.wfButton = document.createElement('a');
        this.wfButton.id = 'wfButton';
        this.wfButton.className = 'notification-container inline';
        this.wfButton.title = 'Start a WF scan';
        this.wfButton.style.cursor = 'pointer';
        this.wfButton.textContent = 'WF Scan';
        this.wfButton.onclick = (): void => void this.startScan();
        messageBar.appendChild(this.wfButton);
    }

    private async startScan(): Promise<void> {
        const scanner = new FavsScanner();
        await scanner.init();
        const figures = await scanner.scanAllUsers((username, percent) => {
            Logger.logInfo(`${percent}% | ${username}`);
            this.wfButton.textContent = `WF: ${percent.toFixed(2)}%`;
        });

        if (figures.length === 0) {
            await StorageWrapper.removeItemAsync(WatchScanButton.scanResultId);
            this.wfButton.textContent = 'WF Scan again';
            return;
        }

        const figureStrings = figures.map(figure => figure.outerHTML);
        const json = JSON.stringify(figureStrings);
        const compressed = PakoWrapper.compress(json);
        await StorageWrapper.setItemAsync(WatchScanButton.scanResultId, compressed);

        this.wfButton.textContent = `${figures.length}WF`;
        this.wfButton.onclick = null;
        this.wfButton.href = 'https://www.furaffinity.net/msg/submissions/?mode=wfv-favorites';
    }
}
