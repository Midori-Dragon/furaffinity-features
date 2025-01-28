export default class {
    static isNullOrWhitespace(str?: string | null): boolean {
        return str == null || str.trim() === '';
    }

    static isNullOrEmpty(str?: string | null): boolean {
        return str == null || str === '';
    }
}
