export default function (figure: HTMLElement): HTMLElement | null | undefined {
    const figCaption = figure.querySelector('figcaption');
    const byElem = figCaption?.querySelector('i');
    return byElem?.parentElement;
}
