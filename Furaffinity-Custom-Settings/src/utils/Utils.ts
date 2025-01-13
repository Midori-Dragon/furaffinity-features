export function makeIdCompatible(id: string): string {
    const sanitizedString = id
        .replace(/[^a-zA-Z0-9-_\.]/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/^-*(?=\d)/, 'id-');
    return /^[0-9]/.test(sanitizedString) ? 'id-' + sanitizedString : sanitizedString;
}
