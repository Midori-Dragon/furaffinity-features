export default function (): [number, string] | null {
    const url = window.location.toString().toLowerCase();
    if (!url.includes('/gallery/') || !url.includes('/folder/')) {
        return null;
    }

    const folderId = getFolderIdFromUrl(url);
    const folderName = getFolderNameFromUrl(url);
    if (folderId == null || folderName == null) {
        return null;
    }

    return [parseInt(folderId), folderName];
}

function getFolderIdFromUrl(url: string): string | null {
    const match = url.match(/\/folder\/(\d+)(?=\/|$)/);
    return match ? match[1] : null;
}

function getFolderNameFromUrl(url: string): string | null {
    const match = url.match(/\/folder\/\d+\/([^\/\?]+)(?=\/|$)/);
    return match ? match[1] : null;
}
