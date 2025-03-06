import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { FavsScanner } from '../modules/FavsScanner';
import { FigureDataSaver } from '../utils/FigureDataSaver';
import { checkMigrateNeeded, migrate } from '../utils/Migrate';

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
        const migrateNeeded = await checkMigrateNeeded();
        if (migrateNeeded) {
            const result = await window.FAMessageBox.show('Watches Favorite Viewer updated.Do you want to migrate your old data?', 'Confirm Migration', window.FAMessageBoxButtons.YesNoCancel, window.FAMessageBoxIcon.Question);
            if (result === window.FADialogResult.Yes) {
                await migrate();
            } else if (result === window.FADialogResult.Cancel) {
                return;
            }
        }

        this.wfButton.textContent = 'WF: 0.00%';

        const scanner = new FavsScanner();
        await scanner.init();
        const figures = await scanner.scanAllUsers((username, percent, userFigures) => {
            Logger.logInfo(`${percent}% | ${username} | ${userFigures.length}`);
            this.wfButton.textContent = `WF: ${percent.toFixed(2)}%`;
        });

        if (figures.length === 0) {
            await StorageWrapper.removeItemAsync(WatchScanButton.scanResultId);
            this.wfButton.textContent = 'WF Scan again';
            return;
        }

        await FigureDataSaver.saveFigures(figures);

        this.wfButton.textContent = `${figures.length}WF`;
        this.wfButton.onclick = null;
        this.wfButton.href = 'https://www.furaffinity.net/msg/submissions/?mode=wfv-favorites';
    }
}
