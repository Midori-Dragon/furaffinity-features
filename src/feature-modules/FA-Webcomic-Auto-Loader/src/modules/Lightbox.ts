import { customLightboxShowNavSetting, scriptName } from '..';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import string from '../../../../library-modules/GlobalUtils/src/string';
import { LightboxHTML } from '../components/LightboxHTML';
import '../styles/LightboxStyle.css';

declare global {
    interface Window {
        Viewer: any;
    }
}

export class Lightbox {
    currWalIndex = 0;

    private _lightboxContainer: HTMLDivElement;
    private _lightboxNavContainer: HTMLDivElement | undefined;
    private _imgCount = -1;
    private _boundHandleArrowKeys: (event: KeyboardEvent) => void;

    constructor(orgSid: number, imgs: Record<number, HTMLImageElement>) {
        this.initializeViewerCanvas();

        this._lightboxContainer = document.body.querySelector('div[class*="viewer-canvas"]')!;
        this._imgCount = Object.keys(imgs).length;

        const columnpage = document.getElementById('columnpage')!;
        const orgImg = columnpage.querySelector(`img[wal-sid="${orgSid}"]`)!;
        const orgImgClone = orgImg.readdToDom() as HTMLImageElement;
        imgs[orgSid] = orgImgClone;
        
        this.prepareOrgLightbox();
        this.addSubmissionToLightbox(imgs);

        if (customLightboxShowNavSetting.value) {
            this._lightboxNavContainer = this.createNavigationButtons();
            this._lightboxContainer.insertAfterThis(this._lightboxNavContainer);
        }

        this._boundHandleArrowKeys = this.handleArrowKeys.bind(this);
    }

    get isHidden(): boolean {
        return this._lightboxContainer.parentElement?.classList.contains('hidden') ?? false;
    }
    set isHidden(value: boolean) {
        if (this.isHidden === value) {
            return;
        }

        if (value) {
            window.removeEventListener('keydown', this._boundHandleArrowKeys);
            this._lightboxContainer.parentElement?.classList.add('hidden');
            this._lightboxNavContainer?.classList.add('hidden');
            for (const child of Array.from(this._lightboxContainer.children)) {
                child.classList.add('hidden');
            }
        } else {
            window.addEventListener('keydown', this._boundHandleArrowKeys);
            this._lightboxContainer.children[this.currWalIndex]?.classList.remove('hidden');
            this._lightboxContainer.parentElement?.classList.remove('hidden');
            this._lightboxNavContainer?.classList.remove('hidden');
        }    
    }

    navigateLeft(): void {
        if (this.currWalIndex > 0) {
            Logger.logInfo(`${scriptName}: navigating left '${this.currWalIndex} -> ${this.currWalIndex - 1}'`);
            const currImg = this._lightboxContainer.children[this.currWalIndex];
            const prevImg = this._lightboxContainer.children[this.currWalIndex - 1];
            
            if (currImg != null && prevImg != null) {
                currImg.classList.add('hidden');
                prevImg.classList.remove('hidden');
            }
            this.currWalIndex--;
        }
    }

    navigateRight(): void {
        if (this.currWalIndex + 1 < this._imgCount) {
            Logger.logInfo(`${scriptName}: navigating right '${this.currWalIndex} -> ${this.currWalIndex + 1}'`);
            const currImg = this._lightboxContainer.children[this.currWalIndex];
            const nextImg = this._lightboxContainer.children[this.currWalIndex + 1];
            
            if (currImg != null && nextImg != null) {
                currImg.classList.add('hidden');
                nextImg.classList.remove('hidden');
            }
            this.currWalIndex++;
        }
    }

    handleArrowKeys(event: KeyboardEvent): void {
        switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            this.navigateLeft();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
            this.navigateRight();
            break;   
        }

        event.preventDefault();
    }

    private getIndexOfClickedImage(img: HTMLImageElement): number | undefined {
        let clickedWalIndex = img.getAttribute('wal-index');
        if (!string.isNullOrWhitespace(clickedWalIndex)) {
            this.currWalIndex = parseInt(clickedWalIndex!);
            const clickedImg = this._lightboxContainer.querySelector(`img[wal-index="${this.currWalIndex}"]`);
            const clickedIndex = clickedImg?.getIndexOfThis();
            return clickedIndex;
        }
    }

    private prepareOrgLightbox(): void {
        this._lightboxContainer.innerHTML = '';
        this._lightboxContainer = this._lightboxContainer.readdToDom() as HTMLDivElement;
        this._lightboxContainer.addEventListener('click', (): void => {
            this.isHidden = true;
        });
    }

    private addSubmissionToLightbox(imgs: Record<number, HTMLImageElement>): void {
        // Convert record to array and sort by wal-index
        const sortedImages = Object.values(imgs)
            .sort((a, b) => {
                const indexA = parseInt(a.getAttribute('wal-index') ?? '0');
                const indexB = parseInt(b.getAttribute('wal-index') ?? '0');
                return indexA - indexB;
            });

        for (const img of sortedImages) {
            img.addEventListener('click', () => {
                this.currWalIndex = this.getIndexOfClickedImage(img) ?? 0;
                this.isHidden = false;
            });

            const clone = img.cloneNode(false) as HTMLImageElement;
            clone.classList.add('hidden');
            clone.style.height = '100%';
            clone.style.width = '100%';
            clone.style.objectFit = 'contain';

            this._lightboxContainer.appendChild(clone);
        }
    }

    private createNavigationButtons(): HTMLDivElement {
        const container = document.createElement('div');
        container.classList.add('wal-lightbox-nav', 'hidden', 'wal-no-select');

        const leftButton = document.createElement('a');
        leftButton.classList.add('button', 'standard', 'mobile-fix');
        leftButton.textContent = '<---';
        leftButton.style.marginRight = '4px';
        leftButton.addEventListener('click', this.navigateLeft.bind(this));
        container.appendChild(leftButton);

        const closeButton = document.createElement('a');
        closeButton.classList.add('button', 'standard', 'mobile-fix');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            this.isHidden = true;
        });
        container.appendChild(closeButton);

        const rightButton = document.createElement('a');
        rightButton.classList.add('button', 'standard', 'mobile-fix');
        rightButton.textContent = '--->';
        rightButton.style.marginLeft = '4px';
        rightButton.addEventListener('click', this.navigateRight.bind(this));
        container.appendChild(rightButton);

        return container;
    }

    private initializeViewerCanvas(): void {
        const viewerCanvas = document.body.querySelector('div[class*="viewer-canvas"]');
        
        if (!viewerCanvas) {
            const viewerTemp = document.createElement('div');
            viewerTemp.innerHTML = LightboxHTML.html;
            const viewerContainer = viewerTemp.firstElementChild!;
            document.body.appendChild(viewerContainer);
            
            Logger.logInfo(`${scriptName}: Created viewer canvas structure in hidden state`);
        }
    }
}
