import string from '../../../../library-modules/GlobalUtils/src/string';
import generalizeString from './generalizeString';

export default function (figure: HTMLElement, title: string): boolean {
    const figCaption = figure.querySelector('figcaption');
    const titleElem = figCaption?.querySelector('a[href*="view"]');
    if (titleElem != null) {
        const figTitle = (titleElem as HTMLAnchorElement).title.toLowerCase();
        const figTitleGeneralized = generalizeString(figTitle, true, true, true, true, true, true);
        const currTitleGeneralized = generalizeString(title, true, true, true, true, true, true);
        if (string.isNullOrWhitespace(figTitleGeneralized) || string.isNullOrWhitespace(currTitleGeneralized)) {
            return false;
        }
        return figTitleGeneralized.includes(currTitleGeneralized) || currTitleGeneralized.includes(figTitleGeneralized);
    }
    return false;
}
