import string from '../../../../library-modules/GlobalUtils/src/string';

export class ComicNavigation {
    prevId = -1;
    firstId = -1;
    nextId = -1;
    
    constructor(prevId: number, firstId: number, nextId: number) {
        this.prevId = prevId;
        this.firstId = firstId;
        this.nextId = nextId;
    }

    static fromElement(elem: HTMLElement): ComicNavigation | null {
        const comicNav = new ComicNavigation(-1, -1, -1);

        const navElems = elem.querySelectorAll('a[href*="view"]');
        if (navElems == null || navElems.length === 0) {
            return null;
        }
        for (const navElem of Array.from(navElems)) {
            const navText = navElem?.textContent?.toLowerCase();
            if (string.isNullOrWhitespace(navText)) {
                continue;
            }

            let idText = navElem.getAttribute('href');
            if (string.isNullOrWhitespace(idText)) {
                continue;
            }

            const i = idText!.search(/[?#]/);
            idText = i === -1 ? idText! : idText!.slice(0, i);
            idText = idText.trimEnd('/');
            idText = idText.split('/').pop()!;

            if (navText!.includes('prev')) {
                comicNav.prevId = parseInt(idText);
            } else if (navText!.includes('next')) {
                comicNav.nextId = parseInt(idText);
            } else if (navText!.includes('start') || navText!.includes('first')) {
                comicNav.firstId = parseInt(idText);
            }
        }

        return comicNav;
    }
}
