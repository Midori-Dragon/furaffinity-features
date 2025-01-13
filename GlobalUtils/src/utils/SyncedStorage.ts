import { GMInfo } from './GMInfo';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class SyncedStorage {
    static async setItem(key: any, value: any): Promise<void> {
        if (!GMInfo.isBrowserEnvironment()) {
            throw new Error('SyncedStorage is only available in browser extensions.');
        }

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
            throw new Error('Unsupported storage API.');
        }
    }

    static async getItem(key: any): Promise<any> {
        if (!GMInfo.isBrowserEnvironment()) {
            throw new Error('SyncedStorage is only available in browser extensions.');
        }

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
            throw new Error('Unsupported storage API.');
        }
    }

    static async removeItem(key: any): Promise<void> {
        if (!GMInfo.isBrowserEnvironment()) {
            throw new Error('SyncedStorage is only available in browser extensions.');
        }

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
            throw new Error('Unsupported storage API.');
        }
    }
}
