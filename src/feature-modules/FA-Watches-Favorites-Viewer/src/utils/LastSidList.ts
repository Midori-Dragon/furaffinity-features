import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';

export class LastSidList {
    static readonly id = 'wfv-last-favs';

    static async setSid(username: string, sid: string): Promise<boolean> {
        const sids = await this.getSidList();
        sids[username] = sid;
        const json = JSON.stringify(sids);
        const success = await StorageWrapper.setItemAsync(this.id, json);
        return success;
    }

    static async getSid(username: string): Promise<string | null> {
        const sids = await this.getSidList();
        return sids[username] ?? null;
    }

    static async clearSidList(): Promise<boolean> {
        const success = await StorageWrapper.removeItemAsync(this.id);
        return success;
    }

    static async getSidList(): Promise<Record<string, string>> {
        const json = await StorageWrapper.getItemAsync(this.id) ?? '{}';
        return JSON.parse(json);
    }
}
