import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import { PakoWrapper } from '../../../../library-modules/GlobalUtils/src/PakoWrapper';

export class FigureDataSaver {
    static readonly scanResultId = 'wfv-scan-results';
    
    static async saveFigures(figures: HTMLElement[]): Promise<void> {
        const figureStrings = figures.map(figure => figure.outerHTML);
        const json = JSON.stringify(figureStrings);
        const compressed = PakoWrapper.compress(json);
        await StorageWrapper.setItemAsync(this.scanResultId, compressed);
    }

    static async loadFigures(): Promise<HTMLElement[]> {
        const figureStrings = await StorageWrapper.getItemAsync(this.scanResultId);
        if (figureStrings == null) {
            return [];
        }
        const decompressed = PakoWrapper.decompress(figureStrings);
        const htmlStrings = JSON.parse(decompressed) as string[];

        // Convert the HTML strings back to HTML elements
        const parser = new DOMParser();
        const figures = htmlStrings.map(htmlString => {
            const doc = parser.parseFromString(htmlString, 'text/html');
            return doc.body.firstElementChild as HTMLElement;
        });
        
        return figures;
    }

    static async clear(): Promise<void> {
        await StorageWrapper.removeItemAsync(this.scanResultId);
    }
}
