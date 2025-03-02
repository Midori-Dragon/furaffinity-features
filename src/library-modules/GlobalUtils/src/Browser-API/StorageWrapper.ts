import { SyncedStorage } from './SyncedStorage';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class StorageWrapper {
    static async setItemAsync(key: any, value: any): Promise<void> {
        await SyncedStorage.setItem(key, value);
        localStorage.setItem(key, value);
    }

    static async getItemAsync(key: any): Promise<any | null> {
        const valueSynced = await SyncedStorage.getItem(key);
        const valueLocal = localStorage.getItem(key);
        if (valueSynced === valueLocal) {
            return valueSynced;
        }
        return valueSynced ?? valueLocal;
    }

    static async removeItemAsync(key: any): Promise<void> {
        await SyncedStorage.removeItem(key);
        localStorage.removeItem(key);
    }
}
