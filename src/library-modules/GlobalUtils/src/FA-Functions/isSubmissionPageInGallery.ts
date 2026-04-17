export default function (doc: Document): boolean {
    let isGallery = false;

    const columnPage = doc.getElementById('columnpage');
    const favNav = columnPage?.querySelector('div[class*="favorite-nav"]');

    isGallery = isInGallery(favNav);
    if (!isGallery) {
        isGallery = isInMiniGallery(columnPage);
    }

    return isGallery;
}

function isInGallery(favNav?: Element | null): boolean {
    const mainGalleryButton = favNav?.querySelector('a[title*="submissions"]');
    return mainGalleryButton instanceof HTMLAnchorElement &&
        mainGalleryButton.href.includes('gallery/');
}

function isInMiniGallery(columnPage?: Element | null): boolean {
    const miniGallery = columnPage?.querySelector('div[id="minigallery"]');
    const mainMiniGalleryTitleContainer = miniGallery?.querySelector('div[class="minigallery-title"]');
    const mainMiniGalleryButton = mainMiniGalleryTitleContainer?.querySelector('a[href]');
    return mainMiniGalleryButton instanceof HTMLAnchorElement &&
        mainMiniGalleryButton.href.includes('gallery/');
}
