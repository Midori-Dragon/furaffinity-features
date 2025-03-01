export default function (page: Document): HTMLElement[] {
    try {
        const watchList: HTMLElement[] = [];
        const pageColumnPage = page.getElementById('columnpage')!;
        const pageSectionBody = pageColumnPage.querySelector('div[class="section-body"]')!;
        const pageWatches = pageSectionBody.querySelector('div[class="flex-watchlist"]')!;
        const watches = pageWatches.querySelectorAll('div[class="flex-item-watchlist aligncenter"]')!;

        for (const watch of Array.from(watches).map(elem => elem as HTMLElement)) {
            watchList.push(watch);
        }

        return watchList;
    } catch {
        return [];
    }
}
