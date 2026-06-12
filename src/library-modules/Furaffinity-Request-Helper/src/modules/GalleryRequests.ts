import { RequestContext } from '../utils/RequestContext';
import { Gallery } from '../components/GalleryRequests/Gallery';
import { Scraps } from '../components/GalleryRequests/Scraps';
import { Favorites } from '../components/GalleryRequests/Favorites';
import { Journals } from '../components/GalleryRequests/Journals';

export class GalleryRequests {
    readonly Gallery: Gallery;
    readonly Scraps: Scraps;
    readonly Favorites: Favorites;
    readonly Journals: Journals;

    private readonly _context: RequestContext;

    constructor(context: RequestContext) {
        this._context = context;
        this.Gallery = new Gallery(this._context);
        this.Scraps = new Scraps(this._context);
        this.Favorites = new Favorites(this._context);
        this.Journals = new Journals(this._context);
    }
}
