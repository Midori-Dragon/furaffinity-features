import { Logger } from '../../../GlobalUtils/src/Logger';
import { requestHelper, showPageSeparatorSetting } from '../index';
import { IGalleryPage } from '../modules/IGalleryPage';
import { createSeparatorElem, getFiguresFromPage } from '../utils/Utils';

export class SearchPage implements IGalleryPage {
    pageNo: number;
    gallery: HTMLElement;

    constructor(pageNo: number) {
        this.pageNo = pageNo;
        this.gallery = document.querySelector('section[id*="gallery"]')!;
    }

    async getPage(): Promise<Document | undefined> {
        Logger.logInfo(`Getting page SearchPage '${this.pageNo}'`);
        const page = await requestHelper.UserRequests.SearchRequests.Search.getPage(this.pageNo, this.getSearchOptions());
        return page;
    }

    private getSearchOptions(): any {
        const searchOptions = requestHelper.UserRequests.SearchRequests.Search.newSearchOptions;

        // Get the input value
        const input = document.getElementById('q');
        searchOptions.input = input?.getAttribute('value') ?? '';

        // Get the selected options
        const searchContainer = document.getElementById('search-advanced');
        const options = searchContainer?.querySelectorAll('option[selected]');
        for (const option of Array.from(options ?? [])) {
            const name = (option.parentNode as HTMLSelectElement).getAttribute('name');
            const value = option.getAttribute('value');
            switch (name) {
            case 'order-by':
                searchOptions.orderBy = value ?? undefined;
                break;
            case 'order-direction':
                searchOptions.orderDirection = value ?? undefined;
                break;
            }
        }

        // Get the selected radio buttons
        const radioButtons = searchContainer?.querySelectorAll('input[type="radio"][checked]');
        for (const radioButton of Array.from(radioButtons ?? [])) {
            const name = radioButton.getAttribute('name');
            const value = radioButton.getAttribute('value');
            switch (name) {
            case 'range':
                searchOptions.range = value ?? undefined;
                break;
            case 'mode':
                searchOptions.matching = value ?? undefined;
                break;
            }
            if (value === 'manual') {
                // Get the range values
                const rangeFrom = searchContainer?.querySelector('input[type="date"][name="range_from"]');
                searchOptions.rangeFrom = rangeFrom?.getAttribute('value') ?? undefined;
                const rangeTo = searchContainer?.querySelector('input[type="date"][name="range_to"]');
                searchOptions.rangeTo = rangeTo?.getAttribute('value') ?? undefined;
            }
        }

        // Get the selected checkboxes
        const checkBoxes = searchContainer?.querySelectorAll('input[type="checkbox"]');
        for (const checkBox of Array.from(checkBoxes ?? [])) {
            switch (checkBox.getAttribute('name')) {
            case 'rating-general':
                searchOptions.ratingGeneral = checkBox.hasAttribute('checked');
                break;
            case 'rating-mature':
                searchOptions.ratingMature = checkBox.hasAttribute('checked');
                break;
            case 'rating-adult':
                searchOptions.ratingAdult = checkBox.hasAttribute('checked');
                break;
            case 'type-art':
                searchOptions.typeArt = checkBox.hasAttribute('checked');
                break;
            case 'type-music':
                searchOptions.typeMusic = checkBox.hasAttribute('checked');
                break;
            case 'type-flash':
                searchOptions.typeFlash = checkBox.hasAttribute('checked');
                break;
            case 'type-story':
                searchOptions.typeStory = checkBox.hasAttribute('checked');
                break;
            case 'type-photo':
                searchOptions.typePhotos = checkBox.hasAttribute('checked');
                break;
            case 'type-poetry':
                searchOptions.typePoetry = checkBox.hasAttribute('checked');
                break;
            }
        }

        return searchOptions;
    }

    async loadPage(prevFigures?: HTMLElement[]): Promise<HTMLElement[]> {
        const page = await this.getPage();
        if (page == null) {
            throw new Error('No page found');
        }
        
        prevFigures ??= [];
        const prevSids = prevFigures.map(figure => figure.id);

        let figures = getFiguresFromPage(page);
        figures = figures.filter(figure => !prevSids.includes(figure.id));

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

        window.dispatchEvent(new CustomEvent('ei-update-embedded'));  //Embedded Image Viewer Integration
        return figures;
    }
}
