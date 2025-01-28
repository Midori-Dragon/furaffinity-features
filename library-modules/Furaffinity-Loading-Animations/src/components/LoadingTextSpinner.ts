import { ILoadingSpinner } from '../modules/ILoadingSpinner';
import { removeTextNodes } from '../utils/Utils';

export class LoadingTextSpinner implements ILoadingSpinner {
    private _characters = ['\u25DC', '\u25E0', '\u25DD', '\u25DE', '\u25E1', '\u25DF'];
    private _delay = 600;
    private _currIndex = -1;
    private _intervalId: number | undefined;
    private _baseElem: HTMLElement;
    private _spinner: HTMLDivElement;
    private _prevContainerTextContent: string | null | undefined;

    constructor(baseElem: HTMLElement) {
        this._spinner = document.createElement('div');

        this._baseElem = baseElem;
        this._baseElem.appendChild(this._spinner);

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

    get fontSize(): number {
        return parseFloat(this._spinner.style.fontSize.trimEnd('px'));
    }
    set fontSize(value: number) {
        if (parseFloat(this._spinner.style.fontSize.trimEnd('px')) === value) {
            return;
        }
        this._spinner.style.fontSize = value + 'px';
    }

    get visible(): boolean {
        return this._spinner.style.display !== 'none';
    }
    set visible(value: boolean) {
        if (this._spinner.style.display === (value ? 'block' : 'none')) {
            return;
        }
        this._spinner.style.display = value ? 'block' : 'none';

        if (value) {
            this.start();
        } else {
            this.stop();
        }
    }

    get delay(): number {
        return this._delay;
    }
    set delay(value: number) {
        if (this._delay === value) {
            return;
        }
        this._delay = value;
        if (this.visible) {
            this.stop();
            this.start();
        }
    }

    get characters(): string[] {
        return this._characters;
    }
    set characters(value: string[]) {
        if (this._characters === value) {
            return;
        }
        this._characters = value;
        if (this.visible) {
            this.stop();
            this.start();
        }
    }

    dispose(): void {
        this.visible = false;
        this._baseElem.removeChild(this._spinner);
    }

    private start(): void {
        if (this._intervalId == null && this._characters.length !== 0) {
            if (this._currIndex < 0) {
                this._currIndex = 0;
            }
            this._prevContainerTextContent = removeTextNodes(this._baseElem);
            this._spinner.textContent = '\u2800\u2800';
            this._intervalId = setInterval(() => {
                if (this._currIndex >= this.characters.length) {
                    this._currIndex = 0;
                }
                this._spinner.textContent = this.characters[this._currIndex];
                this._currIndex++;
            }, (this.delay / this.characters.length));
        }
    }

    private stop(): void {
        if (this._intervalId != null) {
            clearInterval(this._intervalId);
            this._baseElem.textContent = this._prevContainerTextContent ?? null;
            this._intervalId = undefined;
        }
    }

    private updateBaseElem(): void {
        this._spinner.className = 'fla-text-spinner';
        this._spinner.style.display = 'none';
        this._spinner.style.fontSize = '15px';
    }
}
