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
            Logger.logWarning('No Chunk Count found. Trying to load figures anyway.');
            return await this.loadFiguresWithoutChunkCount();
        } else {
            const count = parseInt(countStr, 10);
            return await this.loadFiguresByChunk(count);
        }
    }

    private static async loadFiguresByChunk(chunkCount: number): Promise<FAFigure[]> {
        let allFigures: FAFigure[] = [];
        for (let i = 1; i <= chunkCount; i++) {
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

    private static async loadFiguresWithoutChunkCount(): Promise<FAFigure[]> {
        let allFigures: FAFigure[] = [];

        let compressedData: string | null | undefined;
        let i = 1;
        do {
            try {
                const chunkKey = `${this.scanResultIdPrefix}-${i}`;
                compressedData = await StorageWrapper.getItemAsync(chunkKey);
                if (compressedData != null) {
                    const decompressed = PakoWrapper.decompress(compressedData);
                    let figures = JSON.parse(decompressed) as FAFigure[];
                    figures = figures.map(figure => FAFigure.getRevivedObject(figure));
                
                    allFigures = allFigures.concat(figures);
                }
            }
            catch (error) {
                Logger.logError(`Failed to load chunk ${i}: ${error}`);
            }
            i++;
        } while (compressedData != null && i <= 1000);
        
        return allFigures;
    }

    static async clear(): Promise<void> {
        // Get the total number of chunks
        const countStr = await StorageWrapper.getItemAsync(`${this.scanResultIdPrefix}-count`);
        if (countStr !== null && countStr !== undefined && countStr !== '') {
            const count = parseInt(countStr, 10);
            await this.clearByChunk(count);
        } else {
            await this.clearWithoutChunkCount();
        }
    }

    private static async clearByChunk(chunkCount: number): Promise<void> {
        // Remove each chunk
        for (let i = 1; i <= chunkCount; i++) {
            const chunkKey = `${this.scanResultIdPrefix}-${i}`;
            await StorageWrapper.removeItemAsync(chunkKey);
        }

        // Remove the count key
        await StorageWrapper.removeItemAsync(`${this.scanResultIdPrefix}-count`);
    }

    private static async clearWithoutChunkCount(): Promise<void> {
        // Remove each chunk
        let i = 1;
        let chunkKey = `${this.scanResultIdPrefix}-${i}`;
        while (await StorageWrapper.getItemAsync(chunkKey) != null && i <= 1000) {
            await StorageWrapper.removeItemAsync(chunkKey);
            chunkKey = `${this.scanResultIdPrefix}-${i}`;
            i++;
        }

        // Remove the count key
        await StorageWrapper.removeItemAsync(`${this.scanResultIdPrefix}-count`);
    }
}
