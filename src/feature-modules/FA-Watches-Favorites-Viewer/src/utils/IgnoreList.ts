import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';

export class IgnoreList {
    static readonly id = 'wfv-ignore-list';

    static async add(username: string): Promise<void> {
        const usernames = await this.getIgnoreList() ?? [];
        if (usernames.includes(username)) {
            return;
        }
        usernames.push(username);
        const json = JSON.stringify(usernames);
        await StorageWrapper.setItemAsync(this.id, json);
    }

    static async remove(username: string): Promise<void> {
        const usernames = await this.getIgnoreList() ?? [];
        if (!usernames.includes(username)) {
            return;
        }
        usernames.splice(usernames.indexOf(username), 1);
        const json = JSON.stringify(usernames);
        await StorageWrapper.setItemAsync(this.id, json);
    }

    static async isIgnored(username: string): Promise<boolean> {
        const usernames = await this.getIgnoreList();
        return usernames?.includes(username) ?? false;
    }

    static async setIgnoreList(usernames: string[]): Promise<void> {
        const json = JSON.stringify(usernames);
        await StorageWrapper.setItemAsync(this.id, json);
    }

    static async getIgnoreList(): Promise<string[]> {
        const json = await StorageWrapper.getItemAsync(this.id) ?? '[]';
        return JSON.parse(json);
    }
}
