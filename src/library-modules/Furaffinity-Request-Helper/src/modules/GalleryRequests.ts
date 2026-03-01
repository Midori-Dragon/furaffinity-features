import { Semaphore } from '../../../GlobalUtils/src/Semaphore';
import { Gallery } from '../components/GalleryRequests/Gallery';
import { Scraps } from '../components/GalleryRequests/Scraps';
import { Favorites } from '../components/GalleryRequests/Favorites';
import { Journals } from '../components/GalleryRequests/Journals';

export class GalleryRequests {
    readonly Gallery: Gallery;
    readonly Scraps: Scraps;
    readonly Favorites: Favorites;
    readonly Journals: Journals;

    private readonly _semaphore: Semaphore;

    constructor(semaphore: Semaphore) {
        this._semaphore = semaphore;
        this.Gallery = new Gallery(this._semaphore);
        this.Scraps = new Scraps(this._semaphore);
        this.Favorites = new Favorites(this._semaphore);
        this.Journals = new Journals(this._semaphore);
    }
}
