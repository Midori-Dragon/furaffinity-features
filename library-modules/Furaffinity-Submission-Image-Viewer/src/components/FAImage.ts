import { PanableImage } from './PanableImage';

export class FAImage extends PanableImage {
    constructor(zoomEnabled = true, panEnabled = true) {
        super(document.createElement('img'));
        this.imgElem.classList.add('siv-fa-image');
        this.imgElem.classList.add('blocked-content');
        this.imgElem.draggable = false;
        this.zoomEnabled = zoomEnabled;
        this.panEnabled = panEnabled;
    }

    get dataFullviewSrc(): string {
        return this.imgElem.getAttribute('data-fullview-src') ?? '';
    }
    set dataFullviewSrc(value: string) {
        this.imgElem.setAttribute('data-fullview-src', value);
    }

    get dataPreviewSrc(): string {
        return this.imgElem.getAttribute('data-preview-src') ?? '';
    }
    set dataPreviewSrc(value: string | undefined) {
        if (value == null) {
            return;
        }
        this.imgElem.setAttribute('data-preview-src', value);
    }

    set src(value: string) {
        this.imgElem.src = value;
        this.dataFullviewSrc = value;
    }
}
