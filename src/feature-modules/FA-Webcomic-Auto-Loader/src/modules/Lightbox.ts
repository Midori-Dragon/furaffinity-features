import string from '../../../../library-modules/GlobalUtils/src/string';

export class Lightbox {
    currWalIndex = 0;

    private _lightboxContainer: HTMLDivElement;
    private _imgCount = -1;
    private _boundHandleArrowKeys: (event: KeyboardEvent) => void;

    constructor(orgSid: number, imgs: Record<number, HTMLImageElement>) {
        this._lightboxContainer = document.body.querySelector('div[class*="lightbox-submission"]')!;
        this._lightboxContainer.innerHTML = '';
        this._lightboxContainer = this._lightboxContainer.readdToDom() as HTMLDivElement;
        this._lightboxContainer.addEventListener('click', (): void => {
            this.isHidden = true;
        });
        this._imgCount = Object.keys(imgs).length;

        const columnpage = document.getElementById('columnpage')!;
        const orgImg = columnpage.querySelector(`img[wal-sid="${orgSid}"]`)!;
        const orgImgClone = orgImg.readdToDom() as HTMLImageElement;
        imgs[orgSid] = orgImgClone;
        
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

            this._lightboxContainer.appendChild(clone);
        }
        this._boundHandleArrowKeys = this.handleArrowKeys.bind(this);
    }

    get isHidden(): boolean {
        return this._lightboxContainer.classList.contains('hidden');
    }
    set isHidden(value: boolean) {
        if (this.isHidden === value) {
            return;
        }

        if (value) {
            window.removeEventListener('keydown', this._boundHandleArrowKeys);
            this._lightboxContainer.classList.add('hidden');
            for (const child of Array.from(this._lightboxContainer.children)) {
                child.classList.add('hidden');
            }
        } else {
            window.addEventListener('keydown', this._boundHandleArrowKeys);
            this._lightboxContainer.children[this.currWalIndex]?.classList.remove('hidden');
            this._lightboxContainer.classList.remove('hidden');
        }    
    }

    navigateLeft(): void {
        if (this.currWalIndex > 0) {
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
        if (this.currWalIndex < this._imgCount) {
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
}
