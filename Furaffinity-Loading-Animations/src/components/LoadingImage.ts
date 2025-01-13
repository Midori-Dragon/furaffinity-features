import { ILoadingSpinner } from '../modules/ILoadingSpinner';
import { trimEnd } from '../utils/Utils';

export class LoadingImage implements ILoadingSpinner {
    public delay: number;
    public doScaleImage: boolean;
    public scaleChange: number;
    public scaleChangeMax: number;
    public scaleChangeMin: number;
    public doRotateImage: boolean;
    public rotateDegrees: number;

    private _image: HTMLImageElement;
    private _imageContainer: HTMLDivElement;
    private _isGrowing: boolean;
    private _scale: number;
    private _rotation: number;
    private _size: number;
    private _intervalId: number | undefined;
    private _baseElem: HTMLElement;

    constructor(baseElem: HTMLElement) {
        this.delay = 100;
        this.doScaleImage = true;
        this.scaleChange = 0.05;
        this.scaleChangeMax = 1.2;
        this.scaleChangeMin = 0.8;
        this.doRotateImage = true;
        this.rotateDegrees = 5;
        
        this._isGrowing = true;
        this._scale = 1;
        this._rotation = 0;
        this._size = 60;
        this._image = document.createElement('img');
        this._image.src = 'https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png';
        this._imageContainer = document.createElement('div');

        this._baseElem = baseElem;
        this._imageContainer.appendChild(this._image);
        this._baseElem.appendChild(this._imageContainer);
        this.updateBaseElem();
    }

    get baseElem(): HTMLElement {
        return this._baseElem;
    }
    set baseElem(value: HTMLElement) {
        if (this._baseElem === value) {
            return;
        }
        this._baseElem = value;
        this.updateBaseElem();
    }

    get imageSrc(): string {
        return this._image.src;
    }
    set imageSrc(value: string) {
        if (this._image.src === value) {
            return;
        }
        this._image.src = value;
    }

    get rotation(): number {
        return this._rotation;
    }
    set rotation(value: number) {
        if (this._rotation === value) {
            return;
        }
        this._rotation = value;
        this._image.style.transform = `scale(${this._scale}) rotate(${this._rotation}deg)`;
    }

    get scale(): number {
        return this._scale;
    }
    set scale(value: number) {
        if (this._scale === value) {
            return;
        }
        this._scale = value;
        this._image.style.transform = `scale(${this._scale}) rotate(${this._rotation}deg)`;
    }

    get size(): number {
        return parseFloat(trimEnd(this._imageContainer.style.width, 'px'));
    }
    set size(value: number) {
        if (parseFloat(trimEnd(this._imageContainer.style.width, 'px')) === value) {
            return;
        }
        this._imageContainer.style.width = this._size + 'px';
        this._imageContainer.style.height = this._size + 'px';
    }

    get visible(): boolean {
        return this._imageContainer.style.display !== 'none';
    }
    set visible(value: boolean) {
        if (this._imageContainer.style.display === (value ? 'block' : 'none')) {
            return;
        }

        this._imageContainer.style.display = value ? 'block' : 'none';

        if (value) {
            this._intervalId = setInterval(() => {
                this.updateAnimationFrame();
            }, this.delay);
        } else {
            clearInterval(this._intervalId);
        }
    }

    get isGrowing(): boolean {
        return this._isGrowing;
    }
    private set isGrowing(value: boolean) {
        if (this._isGrowing === value) {
            return;
        }
        this._isGrowing = value;
    }

    dispose(): void {
        this.visible = false;
        this._baseElem.removeChild(this._imageContainer);
    }

    private updateBaseElem(): void {
        this._imageContainer.className = 'fla-loading-image-container';
        this._imageContainer.style.position = 'relative';
        this._imageContainer.style.width = this.size + 'px';
        this._imageContainer.style.height = this.size + 'px';
        this._imageContainer.style.left = '50%';
        this._imageContainer.style.transform = 'translateX(-50%)';
        this._imageContainer.style.display = 'none';

        this._image.className = 'fla-loading-image';
        this._image.src = this.imageSrc;
        this._image.style.width = '100%';
        this._image.style.height = '100%';
        this._image.style.transition = 'transform 0.5s ease-in-out';
    }

    private updateAnimationFrame(): void {
        if (this.isGrowing) {
            this._scale += this.scaleChange;
            this._rotation += this.rotateDegrees;
        } else {
            this._scale -= this.scaleChange;
            this._rotation -= this.rotateDegrees;
        }

        if (this._scale >= this.scaleChangeMax || this._scale <= this.scaleChangeMin) {
            this.isGrowing = !this.isGrowing;
        }

        this._image.style.transform = `scale(${this._scale}) rotate(${this._rotation}deg)`;
    }
}
