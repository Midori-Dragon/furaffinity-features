import { FAImage } from '../components/FAImage';
import { waitForCondition } from '../utils/Utils';
import '../styles/Style.css';
import checkTags from '../../../GlobalUtils/src/FA-Functions/checkTags';

export class CustomImageViewer extends EventTarget {
    imageUrl: string;
    previewUrl?: string;
    parentContainer: HTMLElement;
    faImage: FAImage;
    faImagePreview: HTMLImageElement;

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

        this.faImage = document.createElement('img', { is: 'fa-image' }) as FAImage;
        this.faImage.classList.add('siv-image-main');
        this.faImage.addEventListener('load', this.faImageLoaded.bind(this));

        this.faImagePreview = document.createElement('img', { is: 'fa-image' });
        this.faImagePreview.classList.add('siv-image-preview');

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

        this.faImage.parentNode?.removeChild(this.faImage);
        this.faImagePreview.parentNode?.removeChild(this.faImagePreview);

        this.faImage.src = this.imageUrl;
        this.faImage.dataPreviewSrc = this.previewUrl;

        if (this.previewUrl == null) {
            this.faImagePreview.src = ''; 
        } else {
            this.faImagePreview.src = this.previewUrl;
            this.faImagePreview.addEventListener('load', this.invokePreviewImageLoad.bind(this));
        }
    }

    async load(): Promise<void> {
        this.reset();

        checkTags(this.faImage);
        this._invisibleContainer.appendChild(this.faImage);
        document.body.appendChild(this._invisibleContainer);
        if (this.previewUrl != null && !this.imageLoaded) {
            checkTags(this.faImagePreview);
            await this.checkImageLoadStart();
        }
    }

    private async checkImageLoadStart(): Promise<void> {
        const condition = (): boolean => this.faImage.offsetWidth !== 0;
        await waitForCondition(condition);

        this.faImagePreview.style.width = this.faImage.offsetWidth + 'px';
        this.faImagePreview.style.height = this.faImage.offsetHeight + 'px';
        if (!this.imageLoaded) {
            this.parentContainer.appendChild(this.faImagePreview);
            const previewCondition = (): boolean => this.faImagePreview.offsetWidth !== 0;
            await waitForCondition(previewCondition);
            this.invokeImageLoadStart();
        }
    }

    private faImageLoaded(): void {
        this.faImagePreview.parentNode?.removeChild(this.faImagePreview);
        this.parentContainer.appendChild(this.faImage);
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
