export class ZoomableImage {
    imgElem: HTMLImageElement;
    private _container: HTMLElement | undefined;
    private _speed = 0.1;
    private _size = { w: 0, h: 0 };
    private _position = { x: 0, y: 0 };
    private _target = { x: 0, y: 0 };
    private _pointer = { x: 0, y: 0 };
    private _scale = 1;
    private _doInitPosition = true;

    constructor(imgElem: HTMLImageElement) {
        this.imgElem = imgElem;
    }

    get zoomEnabled(): boolean {
        return this.imgElem.getAttribute('zoom-enabled') === 'true';
    }
    set zoomEnabled(value: boolean) {
        if (value) {
            this.imgElem.classList.add('zoomable-image');
            this.imgElem.setAttribute('zoom-enabled', 'true');
            this.imgElem.addEventListener('wheel', this.onWheel.bind(this));
        } else {
            this.imgElem.classList.remove('zoomable-image');
            this.imgElem.setAttribute('zoom-enabled', 'false');
            this.imgElem.removeEventListener('wheel', this.onWheel.bind(this));
        }
    }

    private init(): void {
        this._container = this.imgElem.parentElement!;
        this._size.w = this.imgElem.offsetWidth;
        this._size.h = this.imgElem.offsetHeight;
        
        // Initialize position at center
        this._position.x = (this._container!.offsetWidth - this._size.w) / 2;
        this._position.y = (this._container!.offsetHeight - this._size.h) / 2;

        this._target.x = 0;
        this._target.y = 0;
        this._pointer.x = 0;
        this._pointer.y = 0;
        this._scale = 1;
    }

    private onWheel(event: WheelEvent): void {
        event.preventDefault();

        if (this._doInitPosition) {
            this._doInitPosition = false;
            this.init();
        }

        if (this._container == null) {
            return;
        }

        // Calculate pointer position relative to image center
        const rect = this.imgElem.getBoundingClientRect();
        const imageCenterX = rect.left + rect.width / 2;
        const imageCenterY = rect.top + rect.height / 2;
        this._pointer.x = event.clientX - imageCenterX;
        this._pointer.y = event.clientY - imageCenterY;

        // Calculate target based on pointer position
        this._target.x = this._pointer.x / this._scale;
        this._target.y = this._pointer.y / this._scale;

        const prevScale = this._scale;
        this._scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * this._speed * this._scale;
  
        // Constrain scale
        const maxScale = 4;
        const minScale = 1;
        this._scale = Math.max(minScale, Math.min(maxScale, this._scale));

        // Adjust position to maintain pointer location after scale
        const scaleFactor = this._scale / prevScale;
        this._position.x -= this._target.x * (scaleFactor - 1);
        this._position.y -= this._target.y * (scaleFactor - 1);

        // Keep the image within container bounds
        const containerRect = this._container.getBoundingClientRect();
        const maxX = (containerRect.width - rect.width * this._scale) / 2;
        const maxY = (containerRect.height - rect.height * this._scale) / 2;

        this._position.x = Math.min(Math.max(this._position.x, maxX), -maxX);
        this._position.y = Math.min(Math.max(this._position.y, maxY), -maxY);

        this.imgElem.style.transform = `translate(${this._position.x}px,${this._position.y}px) scale(${this._scale})`;
    }

    disconnectedCallback(): void {
        this.imgElem.removeEventListener('wheel', this.onWheel.bind(this));
    }
}
