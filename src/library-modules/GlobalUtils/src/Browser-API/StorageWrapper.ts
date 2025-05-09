import { Logger } from '../Logger';
import { SyncedStorage } from './SyncedStorage';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class StorageWrapper {
    static async setItemAsync(key: any, value: any, retry = false): Promise<boolean> {
        try {
            if (retry) {
                return await StorageWrapper.setItemAsyncWithRetry(key, value);
            }
            localStorage.setItem(key, value);
            await SyncedStorage.setItem(key, value);
            return true;
        }
        catch {
            Logger.logError(`Failed to set item in storage: ${key}=${value}`);
            return false;
        }
    }

    private static async setItemAsyncWithRetry(key: any, value: any): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const attemptSave = async (): Promise<void> => {
                const success = await StorageWrapper.setItemAsync(key, value);
                if (success) {
                    resolve(true);
                } else {
                    Logger.logWarning(`Failed to save item ${key}, retrying in 1000ms...`);
                    setTimeout(() => void attemptSave(), 1000);
                }
            };
        
            void attemptSave();
        });
    }

    static async getItemAsync(key: any): Promise<any | null> {
        try {
            const valueLocal = localStorage.getItem(key);
            const valueSynced = await SyncedStorage.getItem(key);
            if (valueSynced === valueLocal) {
                return valueSynced;
            }
            return valueSynced ?? valueLocal;
        }
        catch {
            Logger.logError(`Failed to get item from storage: ${key}`);
            return null;
        }
    }

    static async removeItemAsync(key: any): Promise<boolean> {
        try {
            localStorage.removeItem(key);
            await SyncedStorage.removeItem(key);
            return true;
        }
        catch {
            Logger.logError(`Failed to remove item from storage: ${key}`);
            return false;
        }
    }
}
