import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import { Logger } from '../../../../library-modules/GlobalUtils/src/Logger';
import { PakoWrapper } from '../../../../library-modules/GlobalUtils/src/PakoWrapper';
import string from '../../../../library-modules/GlobalUtils/src/string';
import { FAFigure } from '../components/FAFigure';

export class FigureDataSaver {
    static readonly scanResultIdPrefix = 'wfv-scan-results';
    static readonly chunkSize = 60;
    static readonly maxChunkBytes = 8192 * 0.9; // 90% of 8KB to leave some leeway

    static async saveFigures(figures: FAFigure[]): Promise<boolean> {
        // build compressed chunks
        try {
            const compressedChunks = PakoWrapper.splitByCompressedSize(figures, this.maxChunkBytes);

            if (compressedChunks.length) {
                await this.clear();
            }

            for (let i = 0; i < compressedChunks.length; i++) {
                const key = `${this.scanResultIdPrefix}-${i + 1}`;
                const success  = await StorageWrapper.setItemAsync(key, compressedChunks[i]);
                Logger.logInfo(`Chunk ${i + 1}/${compressedChunks.length}: ${compressedChunks[i].length} bytes`);
                if (!success) {
                    Logger.logError(`Failed to save chunk ${i + 1}. Aborting.`);
                    return false;
                }
            }

            // store the count
            const success = await StorageWrapper.setItemAsync(`${this.scanResultIdPrefix}-count`, compressedChunks.length.toString());
            if (!success) {
                Logger.logError('Failed to save chunk count.');
            }
            return success;
        }
        catch (error) {
            Logger.logError(`Failed to save figures: ${error}`);
            return false;
        }
    }


    static async loadFigures(): Promise<FAFigure[]> {
        // Get the total number of chunks
        const countStr = await StorageWrapper.getItemAsync(`${this.scanResultIdPrefix}-count`);
        if (string.isNullOrWhitespace(countStr)) {
            return [];
        }
        
        const count = parseInt(countStr, 10);
        let allFigures: FAFigure[] = [];
        
        // Load each chunk and combine them
        for (let i = 1; i <= count; i++) {
            const chunkKey = `${this.scanResultIdPrefix}-${i}`;
            const compressedData = await StorageWrapper.getItemAsync(chunkKey);
            
            if (compressedData !== null && compressedData !== undefined) {
                const decompressed = PakoWrapper.decompress(compressedData);
                let figures = JSON.parse(decompressed) as FAFigure[];
                figures = figures.map(figure => FAFigure.getRevivedObject(figure));
                
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
