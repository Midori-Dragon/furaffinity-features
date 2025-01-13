export interface ILoadingSpinner {
    baseElem: HTMLElement;
    delay: number;
    visible: boolean;
    dispose(): void;
}
