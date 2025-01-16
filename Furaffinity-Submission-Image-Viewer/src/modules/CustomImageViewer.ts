import { FAImage } from '../components/FAImage';
import { waitForCondition } from '../utils/Utils';
import '../styles/Style.css';
import checkTags from '../../../GlobalUtils/src/utils/FA-Functions/CheckTags';

export class CustomImageViewer {
    imageUrl: string;
    previewUrl?: string;
    parentContainer: HTMLElement;
    faImage: FAImage;
    faImagePreview: HTMLImageElement;

    private _imageLoaded: boolean;
    private _invisibleContainer: HTMLDivElement;

    onImageLoad?: () => void;
    onImageLoadStart?: () => void;
    onPreviewImageLoad?: () => void;

    constructor(parentContainer: HTMLElement, imageUrl: string, previewUrl?: string) {
        this.imageUrl = imageUrl;
        this.previewUrl = previewUrl;

        this.parentContainer = parentContainer;
        this.parentContainer.classList.add('siv-parent-container');

        this.faImage = document.createElement('img', { is: 'fa-image' }) as FAImage;
        this.faImage.classList.add('siv-image-main');
        this.faImage.addEventListener('load', this._faImageLoaded.bind(this));

        this.faImagePreview = document.createElement('img', { is: 'fa-image' });
        this.faImagePreview.classList.add('siv-image-preview');

        this._invisibleContainer = document.createElement('div');
        this._invisibleContainer.classList.add('siv-image-container');

        this.onImageLoad = undefined;
        this.onImageLoadStart = undefined;
        this.onPreviewImageLoad = undefined;

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
            this.onImageLoad?.();
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
            this.faImagePreview.onload = (): void => this.onPreviewImageLoad?.();
        }
    }

    async load(): Promise<void> {
        this.reset();

        checkTags(this.faImage);
        this._invisibleContainer.appendChild(this.faImage);
        document.body.appendChild(this._invisibleContainer);
        if (this.previewUrl != null && !this.imageLoaded) {
            checkTags(this.faImagePreview);
            await this._checkImageLoadStart();
        }
    }

    private async _checkImageLoadStart(): Promise<void> {
        const condition = (): boolean => this.faImage.offsetWidth !== 0;
        await waitForCondition(condition);

        this.faImagePreview.style.width = this.faImage.offsetWidth + 'px';
        this.faImagePreview.style.height = this.faImage.offsetHeight + 'px';
        if (!this.imageLoaded) {
            this.parentContainer.appendChild(this.faImagePreview);
            const previewCondition = (): boolean => this.faImagePreview.offsetWidth !== 0;
            await waitForCondition(previewCondition);
            this.onImageLoadStart?.();
        }
    }

    private _faImageLoaded(): void {
        // this.imageLoaded = true;
        this.faImagePreview.parentNode?.removeChild(this.faImagePreview);
        this.parentContainer.appendChild(this.faImage);
        this._invisibleContainer.parentNode?.removeChild(this._invisibleContainer);
        // this.onImageLoad?.();
        this.imageLoaded = true;
    }
}
