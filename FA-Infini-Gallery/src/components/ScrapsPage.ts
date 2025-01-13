import { requestHelper, showPageSeparatorSetting } from '../index';
import { IGalleryPage } from '../modules/IGalleryPage';
import { createSeparatorElem, getFiguresFromPage, getUserNameFromUrl } from '../utils/Utils';

export class ScrapsPage implements IGalleryPage {
    public pageNo: number;
    public gallery: HTMLElement;
    
    constructor(pageNo: number) {
        this.pageNo = pageNo;
        this.gallery = document.querySelector('section[id*="gallery"]')!;
    }

    public async getPage(): Promise<Document | undefined> {
        const username = getUserNameFromUrl(window.location.toString());
        const page = await requestHelper.UserRequests.GalleryRequests.Scraps.getPage(username, this.pageNo);
        return page;
    }

    public async loadPage(): Promise<void> {
        const page = await this.getPage();
        if (page == null) {
            throw new Error('No page found');
        }
        const figures = getFiguresFromPage(page);

        if (figures.length !== 0) {
            // Check if we should show a page separator
            if (showPageSeparatorSetting.value) {
                const separator = createSeparatorElem(this.pageNo);
                this.gallery.appendChild(separator);
            }

            // Add the figures to the gallery
            for (const figure of figures) {
                this.gallery.appendChild(figure);
            }
        } else {
            throw new Error('No figures found');
        }

        window.dispatchEvent(new CustomEvent('updateEmbeddedEvent'));  //Embedded Image Viewer Integration
    }
}
