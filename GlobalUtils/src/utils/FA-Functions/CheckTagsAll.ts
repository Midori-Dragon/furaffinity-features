import checkTags from './CheckTags';

export default function (doc: Document | undefined | null): void {
    if (doc == null) {
        return;
    }
    const uploads = doc.querySelectorAll('img[data-tags]');
    uploads.forEach((element) => checkTags(element as HTMLElement));
}
