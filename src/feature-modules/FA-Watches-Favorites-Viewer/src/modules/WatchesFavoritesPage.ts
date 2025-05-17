import { loadingSpinSpeedSetting } from '..';
import checkTagsAll from '../../../../library-modules/GlobalUtils/src/FA-Functions/checkTagsAll';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { hideUpToParent } from '../utils/cleanUpToParent';
import { FigureDataSaver } from '../utils/FigureDataSaver';

export class WatchesFavoritesPage {
    private gallerySection: HTMLElement;

    constructor() {
        const standardPage = document.getElementById('standardpage')!;

        let galleryZero = standardPage.querySelector('section[id="gallery-0"]');
        if (galleryZero == null) {
            const messageCenterSubmissions = standardPage.querySelector('div[id="messagecenter-submissions"]')!;
            galleryZero = document.createElement('section');
            galleryZero.id = 'gallery-0';
            galleryZero.classList.add('gallery', 'messagecenter', 'with-checkboxes', 's-250', 'wfv-gallery');
            messageCenterSubmissions.appendChild(galleryZero);
        }

        this.gallerySection = galleryZero as HTMLElement;
        const sectionHeader = standardPage.querySelector('div[class*="section-header"]')?.parentElement;
        const headerElem = sectionHeader?.querySelector('h2');
        if (headerElem != null) {
            headerElem.textContent = 'Watches Favorites';
        }

        const allGalleries = standardPage.querySelectorAll('section[id^="gallery-"]');
        for (const gallery of Array.from(allGalleries)) {
            const figures = gallery.querySelectorAll('figure');
            for (const figure of Array.from(figures)) {
                figure.remove();
            }
        }

        hideUpToParent(this.gallerySection as HTMLElement, standardPage, sectionHeader);
        this.gallerySection.insertBeforeThis(document.createElement('br'));

        void this.show();
    }

    async show(): Promise<void> {
        const loadingSpinner = new window.FALoadingSpinner(this.gallerySection);
        loadingSpinner.delay = loadingSpinSpeedSetting.value;
        loadingSpinner.spinnerThickness = 6;
        loadingSpinner.visible = true;

        const figures = await FigureDataSaver.loadFigures();
        Logger.logInfo(`Loaded ${figures.length} figures`);
        const htmlFigures = figures.map(figure => figure.ToHTMLElement());
        this.gallerySection.append(...htmlFigures);

        window.dispatchEvent(new CustomEvent('ei-update-embedded'));
        checkTagsAll(document);

        loadingSpinner.visible = false;
    }
}
