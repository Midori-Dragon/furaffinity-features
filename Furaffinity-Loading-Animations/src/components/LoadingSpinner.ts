import { ILoadingSpinner } from '../modules/ILoadingSpinner';

export class LoadingSpinner implements ILoadingSpinner {
    private _delay: number;
    private _size: number;
    private _spinnerThickness: number;
    private _spinnerLength: number;
    private _linearSpin: boolean;
    private _animationCurve: string;
    private _forecolorHex: string;
    private _backcolorHex: string;
    private _baseElem: HTMLElement;    
    private _spinner: HTMLDivElement;
    private _spinnerContainer: HTMLDivElement;

    constructor(baseElem: HTMLElement) {
        this._delay = 1000;
        this._size = 60;
        this._spinnerThickness = 4;
        this._spinnerLength = 1;
        this._linearSpin = false;
        this._animationCurve = 'cubic-bezier(.53,.24,.46,.83)';
        this._forecolorHex = '#8941de';
        this._backcolorHex = '#f3f3f3';
        this._spinner = document.createElement('div');
        this._spinnerContainer = document.createElement('div');

        if (!document.getElementById('flaspinnerstyle')) {
            const style = document.createElement('style');
            style.id = 'flaspinnerstyle';
            style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        this._baseElem = baseElem;
        this._spinnerContainer.appendChild(this._spinner);
        this._baseElem.appendChild(this._spinnerContainer);
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

    get delay(): number {
        return this._delay;
    }
    set delay(value: number) {
        if (this._delay === value) {
            return;
        }
        this._delay = value;
        this._spinner.style.animation = `spin ${this._delay / 1000}s ${this.animationCurve} infinite`;
    }

    get linearSpin(): boolean {
        return this._linearSpin;
    }
    set linearSpin(value: boolean) {
        if (this._linearSpin === value) {
            return;
        }
        this._linearSpin = value;
        this._animationCurve = this._linearSpin ? 'linear' : 'cubic-bezier(.53,.24,.46,.83)';
        this._spinner.style.animation = `spin ${this.delay / 1000}s ${this.animationCurve} infinite`;
    }

    get animationCurve(): string {
        return this._animationCurve;
    }
    set animationCurve(value: string) {
        if (this._animationCurve === value) {
            return;
        }
        this._animationCurve = value;
        this._linearSpin = this._animationCurve === 'linear';
        this._spinner.style.animation = `spin ${this.delay / 1000}s ${this.animationCurve} infinite`;
    }
    
    get size(): number {
        return this._size;
    }
    set size(value: number) {
        if (this._size === value) {
            return;
        }
        this._size = value;

        this._spinnerContainer.style.width = this._size + 'px';
        this._spinnerContainer.style.height = this._size + 'px';
        this._spinner.style.width = (this.size - this.spinnerThickness * 2) + 'px';
        this._spinner.style.height = (this.size - this.spinnerThickness * 2) + 'px';
    }

    get spinnerThickness(): number {
        return this._spinnerThickness;
    }
    set spinnerThickness(value: number) {
        if (this._spinnerThickness === value) {
            return;
        }
        this._spinnerThickness = value;
        this.updateSpinnerBorders();
    }
    
    get spinnerLength(): number {
        return this._spinnerLength;
    }
    set spinnerLength(value: number) {
        if (this._spinnerLength === value) {
            return;
        }
        this._spinnerLength = value;
        this.updateSpinnerBorders();
    }

    get forecolorHex(): string {
        return this._forecolorHex;
    }
    set forecolorHex(value: string) {
        if (this._forecolorHex === value) {
            return;
        }
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        this._forecolorHex = value;
        this.updateSpinnerBorders();
    }

    get backcolorHex(): string {
        return this._backcolorHex;
    }
    set backcolorHex(value: string) {
        if (this._backcolorHex === value) {
            return;
        }
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        this._backcolorHex = value;
        this.updateSpinnerBorders();
    }
    
    get visible(): boolean {
        return this._spinnerContainer.style.display !== 'none';
    }
    set visible(value: boolean) {
        if (this._spinnerContainer.style.display === (value ? 'block' : 'none')) {
            return;
        }
        this._spinnerContainer.style.display = value ? 'block' : 'none';
    }

    dispose(): void {
        this.visible = false;
        this._baseElem.removeChild(this._spinnerContainer);
    }

    private updateSpinnerBorders(): void {
        this._spinner.style.border = this.spinnerThickness + 'px solid ' + this.backcolorHex;
        if (this.spinnerLength >= 4) {
            this._spinner.style.borderLeft = this.spinnerThickness + 'px solid ' + this._forecolorHex;
        } else if (this.spinnerLength >= 3) {
            this._spinner.style.borderBottom = this.spinnerThickness + 'px solid ' + this._forecolorHex;
        } else if (this.spinnerLength >= 2) {
            this._spinner.style.borderRight = this.spinnerThickness + 'px solid ' + this._forecolorHex;
        } else if (this.spinnerLength >= 1) {
            this._spinner.style.borderTop = this.spinnerThickness + 'px solid ' + this._forecolorHex;
        }
    }

    private updateBaseElem(): void {
        this._spinnerContainer.className = 'fla-spinner-container';
        this._spinnerContainer.style.position = 'relative';
        this._spinnerContainer.style.width = this.size + 'px';
        this._spinnerContainer.style.height = this.size + 'px';
        this._spinnerContainer.style.left = '50%';
        this._spinnerContainer.style.transform = 'translateX(-50%)';
        this._spinnerContainer.style.display = 'none';

        this._spinner.className = 'fla-spinner';
        this.updateSpinnerBorders();
        this._spinner.style.borderRadius = '50%';
        this._spinner.style.position = 'relative';
        this._spinner.style.width = (this.size - this.spinnerThickness * 2) + 'px';
        this._spinner.style.height = (this.size - this.spinnerThickness * 2) + 'px';
        this._spinner.style.animation = `spin ${this.delay / 1000}s ${this.animationCurve} infinite`;
    }
}
