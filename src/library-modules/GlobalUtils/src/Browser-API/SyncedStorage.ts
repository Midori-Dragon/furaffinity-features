import { GMInfo } from './GMInfo';
import { Logger } from '../Logger';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class SyncedStorage {
    static async setItem(key: any, value: any): Promise<void> {
        if (!GMInfo.isBrowserEnvironment()) {
            Logger.logWarning('SyncedStorage is only available in browser extensions.');
            return;
        }
        Logger.logInfo(`Setting item in synced storage: ${key}=${value}`);

        const api = GMInfo.getBrowserAPI();
        if (api.storage != null) {
            return new Promise((resolve, reject) => {
                api.storage.sync.set({ [key]: value }, () => {
                    if (api.runtime.lastError != null) {
                        return reject(api.runtime.lastError);
                    }
                    resolve();
                });
            });
        } else {
            Logger.logError('Unsupported storage API.');
        }
    }

    static async getItem(key: any): Promise<any | null> {
        if (!GMInfo.isBrowserEnvironment()) {
            Logger.logWarning('SyncedStorage is only available in browser extensions.');
            return;
        }
        Logger.logInfo(`Getting item from synced storage: ${key}`);

        const api = GMInfo.getBrowserAPI();
        if (api.storage != null) {
            return new Promise((resolve, reject) => {
                api.storage.sync.get(key, (result: { [key: string]: any }) => {
                    if (api.runtime.lastError != null) {
                        return reject(api.runtime.lastError);
                    }
                    resolve(result[key]);
                });
            });
        } else {
            Logger.logError('Unsupported storage API.');
        }
    }

    static async getAllItems(): Promise<Record<string, any>> {
        if (!GMInfo.isBrowserEnvironment()) {
            Logger.logWarning('SyncedStorage is only available in browser extensions.');
            return {};
        }
        Logger.logInfo('Getting all items from synced storage');

        const api = GMInfo.getBrowserAPI();
        if (api.storage != null) {
            return new Promise((resolve, reject) => {
                api.storage.sync.get(null, (result: { [key: string]: any }) => {
                    if (api.runtime.lastError != null) {
                        return reject(api.runtime.lastError);
                    }
                    resolve(result);
                });
            });
        } else {
            Logger.logError('Unsupported storage API.');
            return {};
        }
    }

    static async removeItem(key: any): Promise<void> {
        if (!GMInfo.isBrowserEnvironment()) {
            Logger.logWarning('SyncedStorage is only available in browser extensions.');
            return;
        }
        Logger.logInfo(`Removing item from synced storage: ${key}`);

        const api = GMInfo.getBrowserAPI();
        if (api.storage != null) {
            return new Promise((resolve, reject) => {
                api.storage.sync.remove(key, () => {
                    if (api.runtime.lastError != null) {
                        return reject(api.runtime.lastError);
                    }
                    resolve();
                });
            });
        } else {
            Logger.logError('Unsupported storage API.');
        }
    }
}
