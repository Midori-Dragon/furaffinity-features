export default function (str: string, toTrim = ' '): string {
    if (toTrim === '' || str === '') {
        return str;
    }

    while (str.endsWith(toTrim)) {
        str = str.slice(0, -toTrim.length);
    }

    return str;
}
