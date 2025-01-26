import { Logger } from '../../../GlobalUtils/src/Logger';
import extractParameterFromURL from '../../../GlobalUtils/src/URL-Functions/extractParameter';
import { CustomData } from './CustomData';

export class CustomPage extends EventTarget {
    parameterName: string;
    pageUrl: string;

    private _onOpen?: (customData: CustomData) => void;
    private static customPages: CustomPage[] = [];

    constructor(pageUrl: string, parameterName: string) {
        super();
        this.pageUrl = pageUrl;
        this.parameterName = parameterName;
        CustomPage.customPages.push(this);
        Logger.logInfo(`New CustomPage at '${pageUrl}'='${parameterName}'`);
    }

    get isOpen(): boolean {
        const url = window.location.toString();
        if (!url.includes(this.pageUrl)) {
            return false;
        }
        const parameter = extractParameterFromURL(url, this.parameterName);
        const isOpen = parameter?.key === this.parameterName;
        if (isOpen) {
            Logger.logInfo(`CustomPage '${this.pageUrl}'='${this.parameterName}' is open`);
        }
        return isOpen;
    }

    get parameterValue(): string | undefined {
        const url = window.location.toString();
        const parameter = extractParameterFromURL(url, this.parameterName);
        return parameter?.value;
    }

    get onOpen(): ((customData: CustomData) => void) | undefined {
        return this._onOpen;
    }
    set onOpen(handler: ((customData: CustomData) => void) | undefined) {
        this._onOpen = handler;
    }

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

    private invokeOpen(doc: Document, parameterValue: string | undefined): void {
        const customData = new CustomData(doc);
        customData.parameterValue = parameterValue;

        this._onOpen?.(customData);
        this.dispatchEvent(new CustomEvent('open', { detail: customData }));
    }
}
