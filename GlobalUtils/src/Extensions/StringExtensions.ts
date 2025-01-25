// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface String {
    trimEnd(toTrim?: string): string;
    trimStart(toTrim?: string): string;
}

String.prototype.trimEnd = function (toTrim?: string): string {
    if (toTrim == null) {
        return '';
    }

    if (toTrim === '' || this === '') {
        return this.toString();
    }

    let result = this.toString();
    while (result.endsWith(toTrim)) {
        result = result.slice(0, -toTrim.length);
    }

    return result;
};

String.prototype.trimStart = function (toTrim?: string): string {
    if (toTrim == null) {
        return '';
    }

    if (toTrim === '' || this === '') {
        return this.toString();
    }

    let result = this.toString();
    while (result.startsWith(toTrim)) {
        result = result.slice(toTrim.length);
    }

    return result;
};
