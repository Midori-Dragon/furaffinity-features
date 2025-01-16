import extractParameterFromURL from '../../../GlobalUtils/src/utils/URL-Functions/ExtractParameter';
import { CustomData } from './CustomData';

export class CustomPage extends EventTarget {
    parameterName: string;
    pageUrl: string;

    constructor(pageUrl: string, parameterName: string) {
        super();
        this.pageUrl = pageUrl;
        this.parameterName = parameterName;
        CustomPage.customPages.push(this);
    }

    get isOpen(): boolean {
        const url = window.location.toString();
        if (!url.includes(this.pageUrl)) {
            return false;
        }
        const parameter = extractParameterFromURL(url, this.parameterName);
        return parameter?.key === this.parameterName;
    }

    get parameterValue(): string | undefined {
        const url = window.location.toString();
        const parameter = extractParameterFromURL(url, this.parameterName);
        return parameter?.value;
    }

    get onopen(): (listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => void {
        return this.addEventListener.bind(this, 'onOpen');
    }
    set onopen(listener: EventListenerOrEventListenerObject | null) {
        if (listener != null) {
            this.addEventListener('onOpen', listener);
        } else {
            this.removeEventListener('onOpen', listener!);
        }
    }

    private static customPages: CustomPage[] = [];

    static checkAllPages(): void {
        CustomPage.customPages.forEach((page) => page.checkPageOpened());
    }

    checkPageOpened(): void {
        if (this.isOpen) {
            this.pageOpened(this.parameterValue, document);
        }
    }

    private pageOpened(parameterValue: string | undefined, openedPage: Document): void {
        const customData = new CustomData(openedPage);
        customData.parameterValue = parameterValue;
        const event = new CustomEvent('onOpen', { detail: customData });
        this.dispatchEvent(event);
    }
}
