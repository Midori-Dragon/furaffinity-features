import { requestHelper, showPageSeparatorSetting } from '../index';
import { IGalleryPage } from '../modules/IGalleryPage';
import { createSeparatorElem, getFiguresFromPage, trimEnd } from '../utils/Utils';

export class BrowsePage implements IGalleryPage {
    public pageNo: number;
    public gallery: HTMLElement;

    constructor(pageNo: number) {
        this.pageNo = pageNo;
        this.gallery = document.querySelector('section[id*="gallery"]')!;
    }

    public async getPage(): Promise<Document | undefined> {
        const page = await requestHelper.UserRequests.SearchRequests.Browse.getPage(this.pageNo, this.getBrowseOptions());
        return page;
    }

    private getBrowseOptions(): any {
        const currBrowseOptions = requestHelper.UserRequests.SearchRequests.Browse.newBrowseOptions;
        const sideBar = document.getElementById('sidebar-options');
        // Get the option containers
        const optionContainers = sideBar?.querySelectorAll('div[class*="browse-search-flex-item"]');
        for (const optionContainer of Array.from(optionContainers ?? [])) {
            try {
                // Get the name of the option from the strong element
                const optionName = trimEnd(optionContainer?.querySelector('strong')?.textContent?.toLowerCase() ?? '', ':');
                // Get the value of the option from the selected option element
                const optionValue = optionContainer?.querySelector('option[selected]')?.getAttribute('value');
                // Set the option in the browse options object
                if (optionValue != null) {
                    switch (optionName) {
                    case 'category':
                        currBrowseOptions.category = parseInt(optionValue);
                        break;
                    case 'type':
                        currBrowseOptions.type = parseInt(optionValue);
                        break;
                    case 'species':
                        currBrowseOptions.species = parseInt(optionValue);
                        break;
                    case 'gender':
                        currBrowseOptions.gender = parseInt(optionValue);
                        break;
                    case 'results':
                        currBrowseOptions.results = parseInt(optionValue);
                        break;
                    case 'ratingGeneral':
                        currBrowseOptions.ratingGeneral = optionValue === 'true';
                        break;
                    case 'ratingMature':
                        currBrowseOptions.ratingMature = optionValue === 'true';
                        break;
                    case 'ratingAdult':
                        currBrowseOptions.ratingAdult = optionValue === 'true';
                        break;
                    }
                }
            } catch { }
        }

        // Get the checkbox elements
        const checkBoxes = sideBar?.querySelectorAll('input[type="checkbox"]');
        for (const checkbox of Array.from(checkBoxes ?? [])) {
            // Set the option in the browse options object
            switch (checkbox.getAttribute('name')) {
            case 'rating_general':
                currBrowseOptions.ratingGeneral = checkbox.hasAttribute('checked');
                break;
            case 'rating_mature':
                currBrowseOptions.ratingMature = checkbox.hasAttribute('checked');
                break;
            case 'rating_adult':
                currBrowseOptions.ratingAdult = checkbox.hasAttribute('checked');
                break;
            }
        }

        return currBrowseOptions;
    }

    public async loadPage(): Promise<void> {
        const page = await this.getPage();
        if (page == null) {
            throw new Error('No page found');
        }
        const figures = getFiguresFromPage(page);

        if (figures.length !== 0) {
            // Check if we should show a page separator
            if (showPageSeparatorSetting.value) {
                const separator = createSeparatorElem(this.pageNo);
                this.gallery.appendChild(separator);
            }

            // Add the figures to the gallery
            for (const figure of figures) {
                this.gallery.appendChild(figure);
            }
        } else {
            throw new Error('No figures found');
        }

        window.dispatchEvent(new CustomEvent('updateEmbeddedEvent'));  //Embedded Image Viewer Integration
    }
}
