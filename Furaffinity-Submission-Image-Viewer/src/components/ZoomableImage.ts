export class ZoomableImage extends HTMLImageElement {
    private container: HTMLElement | undefined;
    private speed = 0.1;
    private size = { w: 0, h: 0 };
    private position = { x: 0, y: 0 };
    private target = { x: 0, y: 0 };
    private pointer = { x: 0, y: 0 };
    private scale = 1;
    private doInitPosition = true;

    get zoomEnabled(): boolean {
        return this.getAttribute('zoom-enabled') === 'true';
    }
    set zoomEnabled(value: boolean) {
        if (value) {
            this.classList.add('zoomable-image');
            this.setAttribute('zoom-enabled', 'true');
            this.addEventListener('wheel', this.onWheel.bind(this));
        } else {
            this.classList.remove('zoomable-image');
            this.setAttribute('zoom-enabled', 'false');
            this.removeEventListener('wheel', this.onWheel.bind(this));
        }
    }

    private init(): void {
        this.container = this.parentElement!;
        // this.container.style.overflow = 'hidden';
        this.size.w = this.offsetWidth;
        this.size.h = this.offsetHeight;
        
        // Initialize position at center
        this.position.x = (this.container!.offsetWidth - this.size.w) / 2;
        this.position.y = (this.container!.offsetHeight - this.size.h) / 2;

        this.target.x = 0;
        this.target.y = 0;
        this.pointer.x = 0;
        this.pointer.y = 0;
        this.scale = 1;
    }

    private onWheel(event: WheelEvent): void {
        event.preventDefault();

        if (this.doInitPosition) {
            this.doInitPosition = false;
            this.init();
        }

        if (this.container == null) {
            return;
        }

        // Calculate pointer position relative to image center
        const rect = this.getBoundingClientRect();
        const imageCenterX = rect.left + rect.width / 2;
        const imageCenterY = rect.top + rect.height / 2;
        this.pointer.x = event.clientX - imageCenterX;
        this.pointer.y = event.clientY - imageCenterY;

        // Calculate target based on pointer position
        this.target.x = this.pointer.x / this.scale;
        this.target.y = this.pointer.y / this.scale;

        const prevScale = this.scale;
        this.scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * this.speed * this.scale;
  
        // Constrain scale
        const maxScale = 4;
        const minScale = 1;
        this.scale = Math.max(minScale, Math.min(maxScale, this.scale));

        // Adjust position to maintain pointer location after scale
        const scaleFactor = this.scale / prevScale;
        this.position.x -= this.target.x * (scaleFactor - 1);
        this.position.y -= this.target.y * (scaleFactor - 1);

        // Keep the image within container bounds
        const containerRect = this.container.getBoundingClientRect();
        const maxX = (containerRect.width - rect.width * this.scale) / 2;
        const maxY = (containerRect.height - rect.height * this.scale) / 2;

        this.position.x = Math.min(Math.max(this.position.x, maxX), -maxX);
        this.position.y = Math.min(Math.max(this.position.y, maxY), -maxY);

        this.style.transform = `translate(${this.position.x}px,${this.position.y}px) scale(${this.scale})`;
    }

    disconnectedCallback(): void {
        this.removeEventListener('wheel', this.onWheel.bind(this));
    }
}
