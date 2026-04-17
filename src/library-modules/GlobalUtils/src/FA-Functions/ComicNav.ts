import string from '../string';

export interface IComicNav {
    prev?: IComicNavItem;
    next?: IComicNavItem;
    current?: IComicNavItem;
    first?: IComicNavItem;
}

export interface IComicNavItem {
    title?: string;
    sid: number;
}

export class ComicNav implements IComicNav {
    prev?: IComicNavItem;
    next?: IComicNavItem;
    current?: IComicNavItem;
    first?: IComicNavItem;

    static fromDocument(doc: Document): IComicNav | null {
        const columnPage = doc.getElementById('columnpage');
        const sDescription = columnPage?.querySelector('div[class*="submission-description"]');
        const navElems = sDescription?.querySelectorAll('a[href*="/view/"]');
        if (navElems == null || navElems.length === 0) {
            return null;
        }

        const comicNav: IComicNav = {};

        for (const navElem of Array.from(navElems)) {
            const navText = navElem?.textContent?.toLowerCase();
            if (string.isNullOrWhitespace(navText)) {
                continue;
            }

            let idText = navElem.getAttribute('href');
            if (string.isNullOrWhitespace(idText)) {
                continue;
            }

            const match = idText!.match(/\/view\/(\d+)/);
            const sid = match ? match[1] : null;
            if (string.isNullOrWhitespace(sid)) {
                continue;
            }

            if (navText!.includes('prev')) {
                comicNav.prev = { title: navText, sid: parseInt(sid!) };
            } else if (navText!.includes('next')) {
                comicNav.next = { title: navText, sid: parseInt(sid!) };
            } else if (navText!.includes('start') || navText!.includes('first')) {
                comicNav.first = { title: navText, sid: parseInt(sid!) };
            }
        }

        return comicNav;
    }
}
