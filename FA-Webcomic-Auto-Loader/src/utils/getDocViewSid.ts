export default function (doc: Document): number {
    let ogUrl = doc.querySelector('meta[property="og:url"]')!.getAttribute('content');
    if (ogUrl == null) {
        return -1;
    }
    ogUrl = ogUrl.trimEnd('/');
    return parseInt(ogUrl.split('/').pop()!);
}
