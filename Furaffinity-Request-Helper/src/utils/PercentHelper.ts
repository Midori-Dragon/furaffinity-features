export class PercentHelper {
    private static _percentAll: { [key: string | number]: number } = {};

    constructor() {
        throw new Error('The PercentHelper class is static and cannot be instantiated.');
    }

    public static setPercentValue(id: string | number, value: number): boolean {
        // Check if the value is provided and if the id exists in percentAll
        if (value && PercentHelper._percentAll.hasOwnProperty(id)) {
            // Set the value for the given id
            PercentHelper._percentAll[id] = value;
            return true;
        }
        // Return false if value is not provided or id doesn't exist
        return false;
    }

    public static getPercentValue(id?: string | number, decimalPlaces = 2): number {
        // Check if the id is provided, return -1 if not
        if (id == null) {
            return -1;
        }

        // Retrieve the percent value from the percentAll map using the given id
        const percent = PercentHelper._percentAll[id];

        // If the percent value is not found, return -1
        if (!percent) {
            return -1;
        }

        // Return the percent value rounded to the specified number of decimal places
        return parseFloat(percent.toFixed(decimalPlaces));
    }

    public static createPercentValue(uniqueId: string | number): void {       
        // Initialize the percent value at 0 for the given uniqueId
        PercentHelper._percentAll[uniqueId] = 0;
    }

    public static deletePercentValue(id: string | number): void {
        if (PercentHelper._percentAll.hasOwnProperty(id)) {
            // Delete the percent value from the list
            delete PercentHelper._percentAll[id];
        }
    }

    public static updatePercentValue(id: string | number | undefined, value: number, totalValue: number): void {
        if (id != null && id !== '' && id !== -1) {
            const progress = (value / totalValue) * 100;
            PercentHelper.setPercentValue(id, progress);
        }
    }
}
