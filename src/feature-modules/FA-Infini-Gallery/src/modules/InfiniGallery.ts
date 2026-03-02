import { isElementOnScreen } from '../utils/Utils';
import { GalleryManager } from './GalleryManager';
import { scriptName } from '../index';
import { showError } from '../utils/showError';

export class InfiniGallery {
    scanElem: HTMLElement;
    galleryManager: GalleryManager;

    private scanInterval = -1;

    constructor() {
        this.scanElem = document.getElementById('footer')!;
        this.galleryManager = new GalleryManager();

        window.addEventListener('ig-stop-detection', () => {
            this.stopScrollDetection();
        });
    }

    startScrollDetection(): void {
        this.scanInterval = setInterval(() => {
            // Check if the scan element is visible on the screen
            if (isElementOnScreen(this.scanElem)) {
                // Stop scroll detection and load the next page
                this.stopScrollDetection();
                void this.loadNextPage();
            }
        }, 100);
    }

    stopScrollDetection(): void {
        clearInterval(this.scanInterval);
    }

    async loadNextPage(): Promise<void> {
        try {
            await this.galleryManager.loadNextPage();
            this.startScrollDetection();
        } catch (error) {
            this.stopScrollDetection();
            const isEndOfGallery = error instanceof Error && (error.message === 'No figures found' || error.message === 'No watches found');
            if (!isEndOfGallery) {
                await showError(error, scriptName);
            }
        }
    }
}
