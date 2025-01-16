import { isElementOnScreen } from '../utils/Utils';
import { GalleryManager } from './GalleryManager';

export class InfiniGallery {
    scanElem: HTMLElement;
    galleryManager: GalleryManager;

    private scanInterval = -1;

    constructor() {
        this.scanElem = document.getElementById('footer')!;
        this.galleryManager = new GalleryManager();
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
        } catch {
            this.stopScrollDetection();
        }
    }
}
