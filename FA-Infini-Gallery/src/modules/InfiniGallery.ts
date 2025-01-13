import { isElementOnScreen } from '../utils/Utils';
import { GalleryManager } from './GalleryManager';

export class InfiniGallery {
    public scanElem: HTMLElement;
    public galleryManager: GalleryManager;

    private scanInterval: number;

    constructor() {
        this.scanElem = document.getElementById('footer')!;
        this.galleryManager = new GalleryManager();
        this.scanInterval = -1;
    }

    public startScrollDetection(): void {
        this.scanInterval = setInterval(() => {
            // Check if the scan element is visible on the screen
            if (isElementOnScreen(this.scanElem)) {
                // Stop scroll detection and load the next page
                this.stopScrollDetection();
                void this.loadNextPage();
            }
        }, 100);
    }

    public stopScrollDetection(): void {
        clearInterval(this.scanInterval);
    }

    public async loadNextPage(): Promise<void> {
        try {
            await this.galleryManager.loadNextPage();
            this.startScrollDetection();
        } catch {
            this.stopScrollDetection();
        }
    }
}
