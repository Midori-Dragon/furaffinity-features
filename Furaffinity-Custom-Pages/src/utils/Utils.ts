export function extractParameterFromURL(url: string, parameterName: string): { key: string; value: string } | undefined {
    const parts = url.split('?');
    if (parts.length > 1) {
        const params = parts[parts.length - 1].split('&');
        for (const param of params) {
            const [key, value] = param.split('=');
            if (key === parameterName) {
                return { key, value: decodeURIComponent(value) };
            }
        }
    }
}
