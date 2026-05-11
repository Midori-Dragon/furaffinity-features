export default function (doc: Document): string | undefined {
    const columnPage = doc.getElementById('submission_page');
    const submissionIdContainer = columnPage?.querySelector('div[class*="submission-details"]');
    const usernameContainer = submissionIdContainer?.querySelector('a[href*="/user/"]');
    if (usernameContainer != null) {
        let username = (usernameContainer as HTMLAnchorElement).href;
        username = username.trimEnd('/');
        username = username.split('/').pop()!;
        return username;
    }
}
