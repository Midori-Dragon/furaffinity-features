import { ZoomableImage } from './ZoomableImage';

export class PanableImage extends ZoomableImage {
    private _isDragging = false;
    private _startX = 0;
    private _startY = 0;
    private _lastTranslateX = 0;
    private _lastTranslateY = 0;
    private _prevTransition = '';

    constructor() {
        console.log('PanableImage init');
        super();
        this.draggable = false;
        this.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.addEventListener('mouseleave', this.onMouseUp.bind(this));
    }

    get panEnabled(): boolean {
        return this.getAttribute('pan-enabled') === 'true';
    }
    set panEnabled(value: boolean) {
        if (value) {
            this.classList.add('panable-image');
            this.setAttribute('pan-enabled', 'true');
        } else {
            this.classList.remove('panable-image');
            this.setAttribute('pan-enabled', 'false');
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
            this._prevTransition = this.style.transition;
            this.style.transition = 'none';
            this.style.cursor = 'grabbing';
            this.zoomEnabled = false;
        } else {
            this.style.transition = this._prevTransition;
            this.style.cursor = 'grab';
            this.zoomEnabled = true;
        }
    }
    

    private onMouseDown(event: MouseEvent): void {
        if (!this.panEnabled) {
            return;
        }
        
        this.isDragging = true;
        this._startX = event.clientX - this._lastTranslateX;
        this._startY = event.clientY - this._lastTranslateY;
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.isDragging || !this.panEnabled) return;

        event.preventDefault();
        
        const x = event.clientX - this._startX;
        const y = event.clientY - this._startY;
        
        this._lastTranslateX = x;
        this._lastTranslateY = y;
        
        // Update transform while preserving any existing scale transform
        const currentTransform = window.getComputedStyle(this).transform;
        const matrix = new DOMMatrix(currentTransform);
        const scale = matrix.a; // Get current scale value
        
        this.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    private onMouseUp(): void {
        this.isDragging = false;
    }

    disconnectedCallback(): void {
        this.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.removeEventListener('mouseup', this.onMouseUp.bind(this));
        this.removeEventListener('mouseleave', this.onMouseUp.bind(this));
    }
}
