export interface IGalleryPage {
    pageNo: number;
    gallery: HTMLElement;
    getPage(): Promise<Document | undefined>;
    loadPage(prevFigures?: HTMLElement[]): Promise<HTMLElement[]>;
}
