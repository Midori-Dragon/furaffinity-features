export class CustomData {
    parameterValue: string | undefined;
    document: Document;

    constructor(document: Document) {
        this.document = document;
    }

    removeDocumentSiteContent(): HTMLElement | null {
        const siteContent = this.document.getElementById('site-content');
        if (siteContent != null) {
            siteContent.remove();
        }
        return siteContent;
    }
}
