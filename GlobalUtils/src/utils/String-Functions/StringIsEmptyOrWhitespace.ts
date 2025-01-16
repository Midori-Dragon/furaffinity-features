export default function (str: string | undefined | null): boolean {
    return str == null || str.trim() === '';
}
