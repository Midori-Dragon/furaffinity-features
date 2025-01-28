import { BrowsePage } from '../components/BrowsePage';
import { FavoritesPage } from '../components/FavoritesPage';
import { GalleryPage } from '../components/GalleryPage';
import { ScrapsPage } from '../components/ScrapsPage';
import { SearchPage } from '../components/SearchPage';
import { IGalleryPage } from './IGalleryPage';

export class GalleryManager {
    pageNo = 1;
    prevFigures: HTMLElement[] = [];
    currDataFavId = '';
    isGallery: boolean;
    isFavorites: boolean;
    isScraps: boolean;
    isBrowse: boolean;
    isSearch: boolean;

    constructor() {
        this.isGallery = window.location.toString().includes('net/gallery');
        
        this.isFavorites = window.location.toString().includes('net/favorites');
        
        this.isScraps = window.location.toString().includes('net/scraps');

        this.isBrowse = window.location.toString().includes('net/browse');
        if (this.isBrowse) {
            const pageOption = document.getElementById('manual-page');
            if (pageOption instanceof HTMLInputElement) {
                this.pageNo = parseInt(pageOption.value);
            }
        }
        
        this.isSearch = window.location.toString().includes('net/search');
    }

    async loadNextPage(): Promise<void> {
        this.pageNo++;
        
        if (this.isFavorites) {
            const gallery = document.body.querySelector('section[id*="gallery"]');
            const figures = gallery?.getElementsByTagName('figure');
            if (figures != null && figures.length !== 0) {
                const lastFigureFavId = figures[figures.length - 1].getAttribute('data-fav-id');
                if (lastFigureFavId != null) {
                    this.currDataFavId = lastFigureFavId;
                }
            }
        }

        let nextPage: IGalleryPage | undefined;
        if (this.isGallery === true) {
            nextPage = new GalleryPage(this.pageNo);
        } else if (this.isFavorites === true) {
            nextPage = new FavoritesPage(this.currDataFavId, this.pageNo);
        } else if (this.isScraps === true) {
            nextPage = new ScrapsPage(this.pageNo);
        } else if (this.isBrowse === true) {
            nextPage = new BrowsePage(this.pageNo);
        } else if (this.isSearch === true) {
            nextPage = new SearchPage(this.pageNo);
        }
        if (nextPage != null) {
            const spacer = document.createElement('div');
            spacer.style.height = '20px';
            nextPage.gallery.appendChild(spacer);

            const loadingSpinner = new window.FALoadingSpinner(nextPage.gallery);
            loadingSpinner.spinnerThickness = 5;
            loadingSpinner.size = 50;
            loadingSpinner.visible = true;
                
            try {
                this.prevFigures = await nextPage.loadPage(this.prevFigures);
            } finally {
                loadingSpinner.visible = false;
                loadingSpinner.dispose();
                nextPage.gallery.removeChild(spacer);
            }
        }
    }
}
