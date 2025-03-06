export class WatchesFavoritesMenuButton {
    constructor() {
        const ddmenu = document.getElementById('ddmenu');
        const navBar = ddmenu?.querySelector('ul[class*="navhideonmobile"]');
        const settings = navBar?.querySelector('a[href="/controls/settings/"]')?.parentNode;
        const badges = settings?.querySelector('a[href="/controls/badges/"]');
        if (badges != null) {
            const wfButton = document.createElement('a');
            wfButton.id = 'wfv-menu-button';
            wfButton.textContent = 'Watches Favorites';
            wfButton.href = 'https://www.furaffinity.net/msg/submissions?mode=wfv-favorites';
            badges.insertAfterThis(wfButton);
        }
    }
}
