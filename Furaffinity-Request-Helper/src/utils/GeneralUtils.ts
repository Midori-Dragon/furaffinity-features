export function convertToNumber(value: string | number | undefined): number | undefined {
    if (value == null) {
        return undefined;
    }
    const number = parseInt(value.toString());
    if (isNaN(number)) {
        return undefined;
    }
    return number;
}
