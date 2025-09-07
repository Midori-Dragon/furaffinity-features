import Panzoom, { PanzoomObject } from '@panzoom/panzoom';

type PanzoomChangeEvent = CustomEvent<{ x: number; y: number; scale: number }>;

export class FAImage {
    public imgElem: HTMLImageElement;
    private panzoom: PanzoomObject | null = null;
    private _zoomEnabled = true;
    private _panEnabled = true;

    private wheelHandler: ((e: WheelEvent) => void) | null = null;
    private clickBlocker: ((e: MouseEvent) => void) | null = null;

    private _currentScale = 1;

    private static readonly DRAG_SLOP_PX = 6;
    private static readonly SCALE_EPS = 0.001;
    private static readonly ZOOM_IDLE_MS = 400;

    private _downPos: { x: number; y: number } | null = null;
    private _draggedSinceDown = false;
    private pointerDownHandler: ((e: PointerEvent) => void) | null = null;
    private pointerMoveHandler: ((e: PointerEvent) => void) | null = null;
    private pointerUpHandler: ((e: PointerEvent) => void) | null = null;

    private _panzoomInitialized = false;
    private _zoomIdleTimer: number | null = null;

    constructor(zoomEnabled = true, panEnabled = true) {
        this.imgElem = document.createElement('img');
        this.imgElem.classList.add('siv-fa-image', 'blocked-content');
        this.imgElem.draggable = false;
        this._zoomEnabled = zoomEnabled;
        this._panEnabled = panEnabled;

        if (zoomEnabled || panEnabled) {
            this.initializePanzoom();
        }
    }

    private initializePanzoom(): void {
        // Wait for the element to be added to DOM and image to load
        const setupWhenReady = (): boolean => {
            if (this.imgElem.parentElement && this.imgElem.complete) {
                this.setupPanzoom();
                return true;
            }
            return false;
        };

        // Try immediate setup
        if (setupWhenReady()) {
            return;
        }

        // Wait for image load
        this.imgElem.addEventListener('load', () => {
            if (setupWhenReady()) {
                return;
            }
            
            // If still not ready, observe DOM changes
            const observer = new MutationObserver(() => {
                if (setupWhenReady()) {
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }, { once: true });

        // observe DOM changes in case image is already loaded
        const observer = new MutationObserver(() => {
            if (setupWhenReady()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    private applyCursor(cursor: 'pointer' | 'grabbing'): void {
        this.imgElem.style.setProperty('cursor', cursor, 'important');
    }

    private setupPanzoom(): void {
        if (!this.imgElem.parentElement) {
            return;
        }

        this.panzoom = Panzoom(this.imgElem, {
            maxScale: 10,
            minScale: 1,
            cursor: '',
            disablePan: !this._panEnabled,
            disableZoom: !this._zoomEnabled,
            panOnlyWhenZoomed: true,
            startScale: 1,
            startX: 0,
            startY: 0
        });

        this.applyCursor('pointer');

        this.imgElem.addEventListener('panzoomstart', () => {
            this.applyCursor('grabbing');
        });

        this.imgElem.addEventListener('panzoomend', () => {
            this.applyCursor('pointer');
        });

        this.imgElem.addEventListener('panzoomchange', (e: Event) => {
            this._currentScale = (e as PanzoomChangeEvent).detail.scale;

            if (this._zoomIdleTimer != null) {
                clearTimeout(this._zoomIdleTimer);
            }
            this._zoomIdleTimer = setTimeout(() => {
                this._zoomIdleTimer = null;
                if (Math.abs(this._currentScale - 1) < FAImage.SCALE_EPS) {
                    this.panzoom?.reset({ animate: true });
                }
            }, FAImage.ZOOM_IDLE_MS);
        });
        
        this.pointerDownHandler = (e: PointerEvent): void => {
            this._downPos = { x: e.clientX, y: e.clientY };
            this._draggedSinceDown = false;
            try { 
                (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            } catch { }
        };
        this.pointerMoveHandler = (e: PointerEvent): void => {
            if (!this._downPos) {
                return;
            }
            const dx = e.clientX - this._downPos.x;
            const dy = e.clientY - this._downPos.y;
            if ((dx * dx + dy * dy) >= (FAImage.DRAG_SLOP_PX * FAImage.DRAG_SLOP_PX)) {
                this._draggedSinceDown = true;
            }
        };
        this.pointerUpHandler = (e: PointerEvent): void => {
            this._downPos = null;
            try {
                (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
            } catch { }
        };

        this.imgElem.addEventListener('pointerdown', this.pointerDownHandler);
        this.imgElem.addEventListener('pointermove', this.pointerMoveHandler);
        this.imgElem.addEventListener('pointerup', this.pointerUpHandler);
        this.imgElem.addEventListener('pointercancel', this.pointerUpHandler);

        // Block link activation while dragging or when zoomed
        if (!this.clickBlocker) {
            this.clickBlocker = (e: MouseEvent): void => {
                // Block link activation while dragging OR when zoomed
                if (this._draggedSinceDown) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                // reset for the next gesture
                this._draggedSinceDown = false;
            };
            this.imgElem.addEventListener('click', this.clickBlocker, { capture: true });
        }

        // Enable wheel zooming
        if (this._zoomEnabled && !this.wheelHandler) {
            this.wheelHandler = (e: WheelEvent): void => {
                e.preventDefault();
                this.panzoom!.zoomWithWheel(e);
            };
            // non-passive to allow preventDefault
            this.imgElem.addEventListener('wheel', this.wheelHandler, { passive: false });
        }
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

    get zoomEnabled(): boolean {
        return this._zoomEnabled;
    }
    set zoomEnabled(value: boolean) {
        this._zoomEnabled = value;

        if (!this._panzoomInitialized) {
            this.initializePanzoom();
        }

        this.panzoom?.setOptions({ disableZoom: !value });

        if (value) {
            if (!this.wheelHandler) {
                this.wheelHandler = (e: WheelEvent): void => {
                    e.preventDefault();
                    this.panzoom?.zoomWithWheel(e);
                };
                this.imgElem.addEventListener('wheel', this.wheelHandler, { passive: false });
            }
        } else if (this.wheelHandler) {
            this.imgElem.removeEventListener('wheel', this.wheelHandler);
            this.wheelHandler = null;
        }
    }

    get panEnabled(): boolean {
        return this._panEnabled;
    }
    set panEnabled(value: boolean) {
        this._panEnabled = value;

        if (!this._panzoomInitialized) {
            this.initializePanzoom();
        }

        this.panzoom?.setOptions({ disablePan: !value });
    }

    public reset(): void {
        if (this.panzoom) {
            this.panzoom.reset();
        }
        this._currentScale = 1;
        this._downPos = null;
        this._draggedSinceDown = false;
    }

    public destroy(): void {
        if (this.wheelHandler) {
            this.imgElem.removeEventListener('wheel', this.wheelHandler);
            this.wheelHandler = null;
        }
        if (this.clickBlocker) {
            this.imgElem.removeEventListener('click', this.clickBlocker, { capture: true });
            this.clickBlocker = null;
        }

        // remove pointer listeners
        if (this.pointerDownHandler != null) {
            this.imgElem.removeEventListener('pointerdown', this.pointerDownHandler);
            this.pointerDownHandler = null;
        }
        if (this.pointerMoveHandler != null) {
            this.imgElem.removeEventListener('pointermove', this.pointerMoveHandler);
            this.pointerMoveHandler = null;
        }
        if (this.pointerUpHandler != null) {
            this.imgElem.removeEventListener('pointerup', this.pointerUpHandler);
            this.pointerUpHandler = null;
        }
        this.imgElem.removeEventListener('pointercancel', this.pointerUpHandler as any);

        this.imgElem.style.removeProperty('cursor');
        this.panzoom?.destroy();
        this.panzoom = null;
    }
}
