import { ILoadingSpinner } from '../modules/ILoadingSpinner';

export class LoadingBar implements ILoadingSpinner {
    private _delay = 2000;
    private _baseElem: HTMLElement;
    private _loadingBar: HTMLDivElement;

    constructor(baseElem: HTMLElement) {
        this._loadingBar = document.createElement('div');

        if (!document.getElementById('flaloadingbarstyle')) {
            const style = document.createElement('style');
            style.id = 'flaloadingbarstyle';
            style.innerHTML = '@keyframes gradient { 0% { background-position: 0 0; } 100% { background-position: -200% 0; } }';
            document.head.appendChild(style);
        }

        this._baseElem = baseElem;
        this._baseElem.appendChild(this._loadingBar);
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
        this._loadingBar.style.animation = `gradient ${(this._delay / 1000)}s infinite`;
    }

    get text(): string {
        return this._loadingBar.textContent ?? '';
    }
    set text(value: string) {
        if (this._loadingBar.textContent === value) {
            return;
        }
        this._loadingBar.textContent = value;
    }

    get cornerRadius(): number {
        return parseFloat(this._loadingBar.style.borderRadius.trimEnd('px'));
    }
    set cornerRadius(value: number) {
        if (parseFloat(this._loadingBar.style.borderRadius.trimEnd('px')) === value) {
            return;
        }
        this._loadingBar.style.borderRadius = value + 'px';
    }

    get height(): number {
        return parseFloat(this._loadingBar.style.height.trimEnd('px'));
    }
    set height(value: number) {
        if (parseFloat(this._loadingBar.style.height.trimEnd('px')) === value) {
            return;
        }
        this._loadingBar.style.height = value + 'px';
        this._loadingBar.style.lineHeight = value + 'px';
    }

    get fontSize(): number {
        return parseFloat(this._loadingBar.style.fontSize.trimEnd('px'));
    }
    set fontSize(value: number) {
        if (parseFloat(this._loadingBar.style.fontSize.trimEnd('px')) === value) {
            return;
        }

        if (value != null) {
            this._loadingBar.style.fontSize = value + 'px';
        } else {
            this._loadingBar.style.fontSize = '';
        }
    }

    get gradient(): string {
        return this._loadingBar.style.background;
    }
    set gradient(value: string) {
        if (this._loadingBar.style.background === value) {
            return;
        }
        this._loadingBar.style.background = value;
    }

    get visible(): boolean {
        return this._loadingBar.style.display !== 'none';
    }
    set visible(value: boolean) {
        if (this._loadingBar.style.display === (value ? 'block' : 'none')) {
            return;
        }
        this._loadingBar.style.display = value ? 'block' : 'none';
    }

    dispose(): void {
        this.visible = false;
        this._baseElem.removeChild(this._loadingBar);
    }

    private updateBaseElem(): void {
        this._loadingBar.className = 'fla-loadingbar';
        this._loadingBar.textContent = this.text;
        this._loadingBar.style.width = '100%';
        this._loadingBar.style.height = '60px';
        this._loadingBar.style.lineHeight = this.height + 'px';
        this._loadingBar.style.textShadow = '-1px -1px 0 #000000, 1px -1px 0 #000000, -1px 1px 0 #000000, 1px 1px 0 #000000';
        this._loadingBar.style.fontSize = '15px';
        this._loadingBar.style.background = 'repeating-linear-gradient(to right, rgba(255,10,3,1) 0%, rgba(255,139,6,1) 8%, rgba(253,228,11,1) 16%, rgba(127,236,12,1) 26%, rgba(32,225,207,1) 36%, rgba(140,60,223,1) 46%, rgba(140,60,223,1) 54%, rgba(32,225,207,1) 64%, rgba(127,236,12,1) 74%, rgba(253,228,11,1) 84%, rgba(255,139,6,1) 92%, rgba(255,10,3,1) 100%)';
        this._loadingBar.style.backgroundSize = '200% auto';
        this._loadingBar.style.backgroundPosition = '0 100%';
        this._loadingBar.style.animation = `gradient ${(this.delay / 1000)}s infinite`;
        this._loadingBar.style.animationFillMode = 'forwards';
        this._loadingBar.style.animationTimingFunction = 'linear';
        this._loadingBar.style.display = 'none';
    }
}
