import { PanableImage } from './PanableImage';

export class FAImage extends PanableImage {
    constructor(zoomEnabled = true, panEnabled = true) {
        console.log('FAImage init');
        super();
        this.classList.add('siv-fa-image');
        this.classList.add('blocked-content');
        this.draggable = false;
        this.zoomEnabled = zoomEnabled;
        this.panEnabled = panEnabled;
    }

    get dataFullviewSrc(): string {
        return this.getAttribute('data-fullview-src') ?? '';
    }
    set dataFullviewSrc(value: string) {
        this.setAttribute('data-fullview-src', value);
    }

    get dataPreviewSrc(): string {
        return this.getAttribute('data-preview-src') ?? '';
    }
    set dataPreviewSrc(value: string | undefined) {
        if (value == null) {
            return;
        }
        this.setAttribute('data-preview-src', value);
    }

    set src(value: string) {
        super.src = value;
        this.dataFullviewSrc = value;
    }
}
