export default function (): number | undefined {
    const url = window.location.toString().toLowerCase();
    if (!url.includes('gallery') || !url.includes('folder')) {
        return;
    }

    const parts = url.split('/');
    const folderIdIndex = parts.indexOf('folder') + 1;
    if (folderIdIndex >= parts.length) {
        return;
    }
    const folderId = parts[folderIdIndex];
    return parseInt(folderId);
}
