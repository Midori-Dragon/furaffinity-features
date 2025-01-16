import { requestHelper, showPageSeparatorSetting } from '../index';
import { IGalleryPage } from '../modules/IGalleryPage';
import { createSeparatorElem, getFiguresFromPage, getUserNameFromUrl } from '../utils/Utils';

export class FavoritesPage implements IGalleryPage {
    public dataFavId: string;
    public pageNo: number;
    public gallery: HTMLElement;

    constructor(dataFavId: string, pageNo: number) {
        this.dataFavId = dataFavId;
        this.pageNo = pageNo;
        this.gallery = document.querySelector('section[id*="gallery"]')!;
    }

    public async getPage(): Promise<Document | undefined> {
        const username = getUserNameFromUrl(window.location.toString());
        const page = await requestHelper.UserRequests.GalleryRequests.Favorites.getPage(username, this.dataFavId);
        return page;
    }

    public async loadPage(): Promise<void> {
        const page = await this.getPage();
        if (page == null) {
            throw new Error('No page found');
        }
        const figures = getFiguresFromPage(page);

        if (figures.length !== 0) {
            // Check if on last page
            if (this.dataFavId === figures[figures.length - 1].getAttribute('data-fav-id')) {
                throw new Error('Last page reached');
            }

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
    }
}
