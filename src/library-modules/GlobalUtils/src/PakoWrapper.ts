import pako from 'pako';

export class PakoWrapper {
    /**
     * Compresses a string and returns a compact binary string.
     * @param input - The input string to compress.
     * @returns A compressed binary string.
     */
    static compress(input: string): string {
        const compressedData = pako.deflate(input);
        return new TextDecoder().decode(compressedData); // Convert Uint8Array to binary string
    }

    /**
     * Decompresses a binary string back to its original form.
     * @param compressed - The compressed binary string.
     * @returns The decompressed string.
     */
    static decompress(compressed: string): string {
        const compressedUint8Array = new TextEncoder().encode(compressed); // Convert string back to Uint8Array
        return new TextDecoder().decode(pako.inflate(compressedUint8Array));
    }
}
