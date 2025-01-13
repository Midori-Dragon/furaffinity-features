import { pageSeparatorTextSetting } from '../index';

export function createSeparatorElem(pageNo: number): HTMLDivElement {
    // Create the main container for the separator
    const nextPageDescContainer = document.createElement('div');
    nextPageDescContainer.className = 'folder-description';
    nextPageDescContainer.style.marginTop = '6px';
    nextPageDescContainer.style.marginBottom = '6px';

    // Create the inner container for the page description
    const nextPageDesc = document.createElement('div');
    nextPageDesc.className = 'container-item-top';

    // Create the text element for the page number
    const nextPageDescText = document.createElement('h3');
    const regex = /%page%/g;
    const pageString = pageSeparatorTextSetting.value.replace(regex, pageNo.toString());
    nextPageDescText.textContent = pageString;

    // Append text element to the inner container
    nextPageDesc.appendChild(nextPageDescText);

    // Append inner container to the main container
    nextPageDescContainer.appendChild(nextPageDesc);

    // Return the complete separator element
    return nextPageDescContainer;
}

export function getFiguresFromPage(page: Document): Element[] {
    const figures = page.querySelectorAll('figure[class*="t"]');
    return figures == null ? [] : Array.from(figures);
}

export function getUserNameFromUrl(url: string): string {
    if (url.includes('?')) {
        url = url.substring(0, url.indexOf('?'));
    }
    url = trimEnd(url, '/');
    return url.substring(url.lastIndexOf('/') + 1);
}

export function trimEnd(str: string, toTrim: string): string {
    if (toTrim === '' || str === '') {
        return str;
    }

    while (str.endsWith(toTrim)) {
        str = str.slice(0, -toTrim.length);
    }

    return str;
}

export function isElementOnScreen(element: Element): boolean {
    // Get the bounding rectangle of the element
    const rect = element.getBoundingClientRect();
    
    // Calculate the window height, considering both window and document height
    const windowHeight = (window.innerHeight || document.documentElement.clientHeight) * 2;
    
    // Check if the element is within the visible area of the screen
    return (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
}
