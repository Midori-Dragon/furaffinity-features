import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { requestHelper, showPageSeparatorSetting } from '../index';
import { IGalleryPage } from '../modules/IGalleryPage';
import { createSeparatorElem, getFiguresFromPage, getUserNameFromUrl } from '../utils/Utils';

export class GalleryPage implements IGalleryPage {
    pageNo: number;
    gallery: HTMLElement;
    isInFolder: boolean;

    constructor(pageNo: number) {
        this.pageNo = pageNo;
        this.gallery = document.querySelector('section[id*="gallery"]')!;
        this.isInFolder = window.location.toString().includes('/folder/');
    }

    async getPage(): Promise<Document | undefined> {
        Logger.logInfo(`Getting page GalleryPage '${this.pageNo}'`);
        const username = getUserNameFromUrl(window.location.toString());
        let page;
        if (this.isInFolder === true) {
            let folderId;
            page = await requestHelper.UserRequests.GalleryRequests.Gallery.getPageInFolder(username, folderId, this.pageNo);
        } else {
            page = await requestHelper.UserRequests.GalleryRequests.Gallery.getPage(username, this.pageNo);
        }
        return page;
    }

    async loadPage(prevFigures?: HTMLElement[]): Promise<HTMLElement[]> {
        const page = await this.getPage();
        if (page == null) {
            throw new Error('No page found');
        }
        
        prevFigures ??= [];
        const prevSids = prevFigures.map(figure => figure.id);

        let figures = getFiguresFromPage(page);
        figures = figures.filter(figure => !prevSids.includes(figure.id));

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

        window.dispatchEvent(new CustomEvent('ei-update-embedded'));  //Embedded Image Viewer Integration
        return figures;
    }
}
