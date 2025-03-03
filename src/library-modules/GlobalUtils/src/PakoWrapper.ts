import pako from 'pako';

export class PakoWrapper {
    /**
     * Compresses a string and returns a base64 encoded string suitable for storage.
     * @param input - The input string to compress.
     * @returns A base64 encoded compressed string.
     */
    static compress(input: string): string {
        const compressedData = pako.deflate(input);
        // Convert Uint8Array to base64 string for safe storage
        return this.uint8ArrayToBase64(compressedData);
    }

    /**
     * Decompresses a base64 encoded string back to its original form.
     * @param compressed - The base64 encoded compressed string.
     * @returns The decompressed string.
     */
    static decompress(compressed: string): string {
        // Convert base64 string back to Uint8Array
        const compressedUint8Array = this.base64ToUint8Array(compressed);
        return new TextDecoder().decode(pako.inflate(compressedUint8Array));
    }

    /**
     * Converts a Uint8Array to a base64 encoded string.
     * @param uint8Array - The Uint8Array to convert.
     * @returns A base64 encoded string.
     */
    private static uint8ArrayToBase64(uint8Array: Uint8Array): string {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    /**
     * Converts a base64 encoded string to a Uint8Array.
     * @param base64 - The base64 encoded string to convert.
     * @returns A Uint8Array.
     */
    private static base64ToUint8Array(base64: string): Uint8Array {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}
