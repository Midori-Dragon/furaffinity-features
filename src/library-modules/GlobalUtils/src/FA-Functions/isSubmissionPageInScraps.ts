export default function (doc: Document): boolean {
    const columnPage = doc.getElementById('columnpage');
    const favNav = columnPage?.querySelector('div[class*="favorite-nav"]');
    const mainGalleryButton = favNav?.querySelector('a[title*="submissions"]');
    if (mainGalleryButton != null && (mainGalleryButton as HTMLAnchorElement).href.includes('scraps')) {
        return true;
    }
    return false;
}
