import { FAImage } from '../components/FAImage';
import { waitForCondition } from '../utils/Utils';
import '../styles/Style.css';
import checkTags from '../../../GlobalUtils/src/FA-Functions/checkTags';

export class CustomImageViewer extends EventTarget {
    imageUrl: string;
    previewUrl?: string;
    parentContainer: HTMLElement;
    faImage: FAImage;
    faImagePreview: FAImage;

    private _imageLoaded: boolean;
    private _invisibleContainer: HTMLDivElement;

    private _onImageLoad?: () => void;
    private _onImageLoadStart?: () => void;
    private _onPreviewImageLoad?: () => void;

    get onImageLoad(): (() => void) | undefined {
        return this._onImageLoad;
    }
    set onImageLoad(handler: (() => void) | undefined) {
        this._onImageLoad = handler;
    }

    get onImageLoadStart(): (() => void) | undefined {
        return this._onImageLoadStart;
    }
    set onImageLoadStart(handler: (() => void) | undefined) {
        this._onImageLoadStart = handler;
    }

    get onPreviewImageLoad(): (() => void) | undefined {
        return this._onPreviewImageLoad;
    }
    set onPreviewImageLoad(handler: (() => void) | undefined) {
        this._onPreviewImageLoad = handler;
    }

    constructor(parentContainer: HTMLElement, imageUrl: string, previewUrl?: string) {
        super();
        this.imageUrl = imageUrl;
        this.previewUrl = previewUrl;

        this.parentContainer = parentContainer;
        this.parentContainer.classList.add('siv-parent-container');

        this.faImage = new FAImage();
        this.faImage.imgElem.classList.add('siv-image-main');
        this.faImage.imgElem.addEventListener('load', this.faImageLoaded.bind(this));

        this.faImagePreview = new FAImage();
        this.faImagePreview.imgElem.classList.add('siv-image-preview');

        this._invisibleContainer = document.createElement('div');
        this._invisibleContainer.classList.add('siv-image-container');

        this._imageLoaded = false;
        this.reset();
    }

    get imageLoaded(): boolean {
        return this._imageLoaded;
    }
    private set imageLoaded(value: boolean) {
        if (this._imageLoaded === value) {
            return;
        }
        this._imageLoaded = value;
        if (value) {
            this.invokeImageLoad();
        }
    }

    reset(): void {
        this.imageLoaded = false;

        this.faImage.imgElem.parentNode?.removeChild(this.faImage.imgElem);
        this.faImagePreview.imgElem.parentNode?.removeChild(this.faImagePreview.imgElem);

        this.faImage.src = this.imageUrl;
        this.faImage.dataPreviewSrc = this.previewUrl;

        if (this.previewUrl == null) {
            this.faImagePreview.src = ''; 
        } else {
            this.faImagePreview.src = this.previewUrl;
            this.faImagePreview.imgElem.addEventListener('load', this.invokePreviewImageLoad.bind(this));
        }
    }

    async load(): Promise<void> {
        this.reset();

        checkTags(this.faImage.imgElem);
        this._invisibleContainer.appendChild(this.faImage.imgElem);
        document.body.appendChild(this._invisibleContainer);
        if (this.previewUrl != null && !this.imageLoaded) {
            checkTags(this.faImagePreview.imgElem);
            await this.checkImageLoadStart();
        }
    }

    private async checkImageLoadStart(): Promise<void> {
        const condition = (): boolean => this.faImage.imgElem.offsetWidth !== 0;
        await waitForCondition(condition);

        this.faImagePreview.imgElem.style.width = this.faImage.imgElem.offsetWidth + 'px';
        this.faImagePreview.imgElem.style.height = this.faImage.imgElem.offsetHeight + 'px';
        if (!this.imageLoaded) {
            this.parentContainer.appendChild(this.faImagePreview.imgElem);
            const previewCondition = (): boolean => this.faImagePreview.imgElem.offsetWidth !== 0;
            await waitForCondition(previewCondition);
            this.invokeImageLoadStart();
        }
    }

    private faImageLoaded(): void {
        this.faImagePreview.imgElem.parentNode?.removeChild(this.faImagePreview.imgElem);
        this.parentContainer.appendChild(this.faImage.imgElem);
        this._invisibleContainer.parentNode?.removeChild(this._invisibleContainer);
        this.imageLoaded = true;
    }

    private invokeImageLoad(): void {
        this._onImageLoad?.();
        this.dispatchEvent(new Event('image-load'));
    }

    private invokeImageLoadStart(): void {
        this._onImageLoadStart?.();
        this.dispatchEvent(new Event('image-load-start'));
    }

    private invokePreviewImageLoad(): void {
        this._onPreviewImageLoad?.();
        this.dispatchEvent(new Event('preview-image-load'));
    }
}
