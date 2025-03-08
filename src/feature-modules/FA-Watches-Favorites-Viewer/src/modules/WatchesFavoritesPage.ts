import { loadingSpinSpeedSetting } from '..';
import checkTagsAll from '../../../../library-modules/GlobalUtils/src/FA-Functions/checkTagsAll';
import { cleanUpToParent } from '../utils/cleanUpToParent';
import { FigureDataSaver } from '../utils/FigureDataSaver';

export class WatchesFavoritesPage {
    private gallerySection: HTMLElement;

    constructor() {
        const standardPage = document.getElementById('standardpage')!;

        let gallery = standardPage.querySelector('section[id="gallery-0"]');
        if (gallery == null) {
            const messageCenterSubmissions = standardPage.querySelector('div[id="messagecenter-submissions"]')!;
            gallery = document.createElement('section');
            gallery.id = 'gallery-0';
            gallery.classList.add('gallery', 'messagecenter', 'with-checkboxes', 's-250', 'wfv-gallery');
            messageCenterSubmissions.appendChild(gallery);
        }

        this.gallerySection = gallery as HTMLElement;
        const sectionHeader = standardPage.querySelector('div[class*="section-header"]')?.parentElement;
        const headerElem = sectionHeader?.querySelector('h2');
        if (headerElem != null) {
            headerElem.textContent = 'Watches Favorites';
        }
        cleanUpToParent(this.gallerySection as HTMLElement, standardPage, sectionHeader);
        this.gallerySection.insertBeforeThis(document.createElement('br'));

        const figures = this.gallerySection.querySelectorAll('figure');
        for (const figure of Array.from(figures)) {
            figure.remove();
        }

        void this.show();
    }

    async show(): Promise<void> {
        const loadingSpinner = new window.FALoadingSpinner(this.gallerySection);
        loadingSpinner.delay = loadingSpinSpeedSetting.value;
        loadingSpinner.spinnerThickness = 6;
        loadingSpinner.visible = true;

        const figures = await FigureDataSaver.loadFigures();
        this.gallerySection.append(...figures);

        window.dispatchEvent(new CustomEvent('ei-update-embedded'));
        checkTagsAll(document);

        loadingSpinner.visible = false;
    }
}
