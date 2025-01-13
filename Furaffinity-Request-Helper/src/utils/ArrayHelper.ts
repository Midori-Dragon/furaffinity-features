export class IdArray {
    constructor() {
        throw new Error('The IdArray class is static and cannot be instantiated.');
    }

    public static getTillId(collection: HTMLElement[], toId: string | number, attributeName = 'id'): HTMLElement[] {
        const result = [];
        toId = toId.toString();
        // Iterate over the collection and break when the toId is found.
        for (const elem of collection) {
            // Add the element to the result array.
            result.push(elem);
            // Break the loop if the element ID matches the toId.
            const attribute = elem.getAttribute(attributeName);
            if (attribute != null && attribute.replace('sid-', '') === toId) {
                break;
            }
        }
        return result;
    }

    public static getSinceId(collection: HTMLElement[], fromId: string | number, attributeName = 'id'): HTMLElement[] {
        // Convert the collection to an array and reverse it for processing from the end
        const array = collection;
        array.reverse();

        // Initialize an empty result array to store elements with IDs greater than or equal to fromId
        const result = [];
        fromId = fromId.toString();

        // Iterate over the reversed array
        for (const elem of array) {
            // Add the current element to the result array
            result.push(elem);

            // If the current element's ID matches fromId, stop processing further
            const attribute = elem.getAttribute(attributeName);
            if (attribute != null && attribute.replace('sid-', '') === fromId) {
                break;
            }
        }
        // Reverse the result array to maintain the original order
        result.reverse();
        return result;
    }

    public static getBetweenIds(collection: HTMLElement[], fromId: string | number, toId: string | number, attributeName = 'id'): HTMLElement[] {
        const array = collection;
        let startIndex = -1; // Index of the first element with ID equal to or greater than fromId
        let endIndex = -1; // Index of the last element with ID equal to or less than toId

        fromId = fromId.toString();
        toId = toId.toString();

        // Iterate through the array and find the indices of the first and last elements with IDs within the range
        for (let i = 0; i < array.length; i++) {
            const attribute = array[i].getAttribute(attributeName);

            if (attribute != null && attribute.replace('sid-', '') === fromId) {
                startIndex = i;
            }
            if (attribute != null && attribute.replace('sid-', '') === toId) {
                endIndex = i;
            }
            // If both indices are found, break the loop
            if (startIndex !== -1 && endIndex !== -1) {
                break;
            }
        }

        // If both indices are still -1, return the entire array
        if (startIndex === -1 && endIndex === -1) {
            return array;
        }

        // If only one index is -1, set it to the other extreme value
        if (startIndex === -1) {
            startIndex = 0;
        }
        if (endIndex === -1) {
            endIndex = array.length - 1;
        }

        // Extract the elements between the start and end indices
        const result = [];
        for (let i = startIndex; i <= endIndex; i++) {
            result.push(array[i]);
        }

        return result;
    }

    public static containsId(collection: HTMLElement[], id: string | number, attributeName = 'id'): boolean {
        id = id.toString();
        for (const elem of collection) {
            // The id attribute is a string, so we need to remove the "sid-" prefix to compare it to the given id
            const attribute = elem.getAttribute(attributeName);
            if (attribute != null && attribute.replace('sid-', '') === id) {
                return true;
            }
        }
        return false;
    }
}
