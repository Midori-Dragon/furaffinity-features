import { extractParameterFromURL } from '../utils/Utils';
import { CustomData } from './CustomData';

export class CustomPage extends EventTarget {
    public parameterName: string;
    public pageUrl: string;

    public get isOpen(): boolean {
        const url = window.location.toString();
        if (!url.includes(this.pageUrl)) {
            return false;
        }
        const parameter = extractParameterFromURL(url, this.parameterName);
        return parameter?.key === this.parameterName;
    }

    public get parameterValue(): string | undefined {
        const url = window.location.toString();
        const parameter = extractParameterFromURL(url, this.parameterName);
        return parameter?.value;
    }

    public get onopen(): (listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => void {
        return this.addEventListener.bind(this, 'onOpen');
    }
    public set onopen(listener: EventListenerOrEventListenerObject | null) {
        if (listener != null) {
            this.addEventListener('onOpen', listener);
        } else {
            this.removeEventListener('onOpen', listener!);
        }
    }

    private static customPages: CustomPage[] = [];

    constructor(pageUrl: string, parameterName: string) {
        super();
        this.pageUrl = pageUrl;
        this.parameterName = parameterName;
        CustomPage.customPages.push(this);
    }

    public static checkAllPages(): void {
        CustomPage.customPages.forEach((page) => page.checkPageOpened());
    }

    public checkPageOpened(): void {
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
