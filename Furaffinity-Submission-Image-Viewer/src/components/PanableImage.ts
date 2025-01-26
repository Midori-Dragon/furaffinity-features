import { ZoomableImage } from './ZoomableImage';

export class PanableImage extends ZoomableImage {
    private _isDragging = false;
    private _hasMoved = false;
    private _startX = 0;
    private _startY = 0;
    private _lastTranslateX = 0;
    private _lastTranslateY = 0;
    private _prevTransition = '';

    constructor(imgElem: HTMLImageElement) {
        super(imgElem);
        this.imgElem.draggable = false;
        this.imgElem.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.imgElem.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.imgElem.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.imgElem.addEventListener('mouseleave', this.onMouseUp.bind(this));
        this.imgElem.addEventListener('click', this.onClick.bind(this));
        this.imgElem.addEventListener('contextmenu', this.onClick.bind(this));
    }

    get panEnabled(): boolean {
        return this.imgElem.getAttribute('pan-enabled') === 'true';
    }
    set panEnabled(value: boolean) {
        if (value) {
            this.imgElem.classList.add('panable-image');
            this.imgElem.setAttribute('pan-enabled', 'true');
        } else {
            this.imgElem.classList.remove('panable-image');
            this.imgElem.setAttribute('pan-enabled', 'false');
        }
    }

    private get isDragging(): boolean {
        return this._isDragging;
    }
    private set isDragging(value: boolean) {
        if (value === this._isDragging) {
            return;
        }
        this._isDragging = value;
        if (value) {
            this._prevTransition = this.imgElem.style.transition;
            this.imgElem.style.transition = 'none';
            this.imgElem.style.cursor = 'grabbing';
            this.zoomEnabled = false;
        } else {
            this.imgElem.style.transition = this._prevTransition;
            this.imgElem.style.cursor = 'grab';
            this.zoomEnabled = true;
        }
    }
    

    private onMouseDown(event: MouseEvent): void {
        if (!this.panEnabled) {
            return;
        }
        
        this.isDragging = true;
        this._hasMoved = false;
        this._startX = event.clientX - this._lastTranslateX;
        this._startY = event.clientY - this._lastTranslateY;
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.isDragging || !this.panEnabled) return;

        event.preventDefault();
        
        const x = event.clientX - this._startX;
        const y = event.clientY - this._startY;
        
        // Check if we've moved more than a small threshold to consider it a drag
        if (Math.abs(x - this._lastTranslateX) > 5 || Math.abs(y - this._lastTranslateY) > 5) {
            this._hasMoved = true;
        }
        
        this._lastTranslateX = x;
        this._lastTranslateY = y;
        
        // Update transform while preserving any existing scale transform
        const currentTransform = window.getComputedStyle(this.imgElem).transform;
        const matrix = new DOMMatrix(currentTransform);
        const scale = matrix.a; // Get current scale value
        
        this.imgElem.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    private onMouseUp(): void {
        this.isDragging = false;
    }

    private onClick(event: MouseEvent): void {
        if (this._hasMoved) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    disconnectedCallback(): void {
        this.imgElem.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.imgElem.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.imgElem.removeEventListener('mouseup', this.onMouseUp.bind(this));
        this.imgElem.removeEventListener('mouseleave', this.onMouseUp.bind(this));
        this.imgElem.removeEventListener('click', this.onClick.bind(this));
        this.imgElem.removeEventListener('contextmenu', this.onClick.bind(this));
    }
}
