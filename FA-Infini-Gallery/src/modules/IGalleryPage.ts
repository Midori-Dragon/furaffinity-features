export interface IGalleryPage {
    pageNo: number;
    gallery: HTMLElement;
    getPage(): Promise<Document | undefined>;
    loadPage(): Promise<void>;
}
