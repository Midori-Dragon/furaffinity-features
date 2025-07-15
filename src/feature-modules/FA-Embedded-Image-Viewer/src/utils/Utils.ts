export function getByLinkFromFigcaption(figcaption: HTMLElement | undefined | null): string | null {
    if (figcaption != null) {
        const infos = figcaption.querySelectorAll('i');
        let userLink = null;
        for (const info of Array.from(infos)) {
            if (info.textContent?.toLowerCase().includes('by') ?? false) {
                const linkElem = info.parentNode?.querySelector('a[href][title]');
                if (linkElem) {
                    userLink = linkElem.getAttribute('href');
                }
            }
        }
        return userLink;
    }
    return null;
}

export function getUserFromFigcaption(figcaption: HTMLElement | undefined | null): string | null {
    if (figcaption != null) {
        const infos = figcaption.querySelectorAll('i');
        let userLink = null;
        for (const info of Array.from(infos)) {
            if (info.textContent?.toLowerCase().includes('by') ?? false) {
                const linkElem = info.parentNode?.querySelector('a[href][title]');
                if (linkElem) {
                    userLink = linkElem.getAttribute('href');
                    userLink = userLink?.trimEnd('/');
                    userLink = userLink?.split('/').pop() ?? null;
                }
            }
        }
        return userLink;
    }
    return null;
}

export function getFavKey(doc: Document): { favKey: string | null; isFav: boolean } | null {
    // Get the column page element
    const columnPage = doc.getElementById('columnpage');

    // Find the navbar within the column page that contains favorite navigation
    const navbar = columnPage?.querySelector('div[class*="favorite-nav"]');

    // Select all buttons with a href attribute within the navbar
    const buttons = navbar?.querySelectorAll('a[class*="button"][href]') ?? [];

    let favButton;

    // Iterate through the buttons to find the one related to favorites
    for (const button of Array.from(buttons)) {
        if (button.textContent?.toLowerCase().includes('fav') ?? false) {
            favButton = button;
        }
    }

    // If a favorite button is found, extract the favorite key and status
    if (favButton != null) {
        const favKey = favButton.getAttribute('href')?.split('?key=')[1] ?? null;
        const isFav = !(favButton.getAttribute('href')?.toLowerCase().includes('unfav') ?? true);
        return { favKey, isFav };
    }

    // Return null if no favorite button is found
    return null;
}

export function downloadImage(): void {
    let url = window.location.toString();

    // If the url contains a query string, remove it
    if (url.includes('?')) {
        const parts = url.split('?');
        url = parts[0];
    }

    // Create an anchor element to download the image
    const download = document.createElement('a');
    download.href = url;
    download.download = url.substring(url.lastIndexOf('/') + 1);
    download.style.display = 'none';
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);

    window.close();
}
