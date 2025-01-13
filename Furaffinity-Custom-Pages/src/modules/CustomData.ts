export class CustomData {
    public parameterValue: string | undefined;
    public document: Document;

    constructor(document: Document) {
        this.document = document;
    }

    public removeDocumentSiteContent(): HTMLElement | null {
        const siteContent = this.document.getElementById('site-content');
        if (siteContent != null) {
            siteContent.remove();
        }
        return siteContent;
    }
}
