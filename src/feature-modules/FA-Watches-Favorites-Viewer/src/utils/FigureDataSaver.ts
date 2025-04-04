import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import { PakoWrapper } from '../../../../library-modules/GlobalUtils/src/PakoWrapper';
import string from '../../../../library-modules/GlobalUtils/src/string';

export class FigureDataSaver {
    static readonly scanResultIdPrefix = 'wfv-scan-results';
    static readonly chunkSize = 60;
    
    static async saveFigures(figures: HTMLElement[]): Promise<void> {
        // Split figures into chunks of 60
        const chunks: HTMLElement[][] = [];
        for (let i = 0; i < figures.length; i += this.chunkSize) {
            chunks.push(figures.slice(i, i + this.chunkSize));
        }

        // Save each chunk with an incremental key
        const compressedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const figureStrings = chunks[i].map(figure => figure.outerHTML);
            const json = JSON.stringify(figureStrings);
            const compressed = PakoWrapper.compress(json);
            compressedChunks.push(compressed);
        }

        // Clear any existing data
        if (compressedChunks.length !== 0) {
            await this.clear();
        }
        for (let i = 0; i < compressedChunks.length; i++) {
            const chunkKey = `${this.scanResultIdPrefix}-${i + 1}`;
            await StorageWrapper.setItemAsync(chunkKey, compressedChunks[i]);
        }
        
        // Save the total number of chunks for later retrieval
        await StorageWrapper.setItemAsync(`${this.scanResultIdPrefix}-count`, chunks.length.toString());
    }

    static async loadFigures(): Promise<HTMLElement[]> {
        // Get the total number of chunks
        const countStr = await StorageWrapper.getItemAsync(`${this.scanResultIdPrefix}-count`);
        if (string.isNullOrWhitespace(countStr)) {
            return [];
        }
        
        const count = parseInt(countStr, 10);
        let allFigures: HTMLElement[] = [];
        const parser = new DOMParser();
        
        // Load each chunk and combine them
        for (let i = 1; i <= count; i++) {
            const chunkKey = `${this.scanResultIdPrefix}-${i}`;
            const compressedData = await StorageWrapper.getItemAsync(chunkKey);
            
            if (compressedData !== null && compressedData !== undefined) {
                const decompressed = PakoWrapper.decompress(compressedData);
                const htmlStrings = JSON.parse(decompressed) as string[];
                
                // Convert the HTML strings back to HTML elements
                const figures = htmlStrings.map(htmlString => {
                    const doc = parser.parseFromString(htmlString, 'text/html');
                    return doc.body.firstElementChild as HTMLElement;
                });
                
                allFigures = allFigures.concat(figures);
            }
        }
        
        return allFigures;
    }

    static async clear(): Promise<void> {
        // Get the total number of chunks
        const countStr = await StorageWrapper.getItemAsync(`${this.scanResultIdPrefix}-count`);
        if (countStr !== null && countStr !== undefined && countStr !== '') {
            const count = parseInt(countStr, 10);
            
            // Remove each chunk
            for (let i = 1; i <= count; i++) {
                const chunkKey = `${this.scanResultIdPrefix}-${i}`;
                await StorageWrapper.removeItemAsync(chunkKey);
            }
        }
        
        // Remove the count key
        await StorageWrapper.removeItemAsync(`${this.scanResultIdPrefix}-count`);
    }
}
