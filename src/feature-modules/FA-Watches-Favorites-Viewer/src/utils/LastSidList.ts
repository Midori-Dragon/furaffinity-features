import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';

export class LastSidList {
    static readonly id = 'wfv-last-favs';

    static async setSid(username: string, sid: string): Promise<void> {
        const sids = await this.getSidList();
        sids[username] = sid;
        const json = JSON.stringify(sids);
        await StorageWrapper.setItemAsync(this.id, json);
    }

    static async getSid(username: string): Promise<string | null> {
        const sids = await this.getSidList();
        return sids[username] ?? null;
    }

    static async clearSidList(): Promise<void> {
        await StorageWrapper.removeItemAsync(this.id);
    }

    static async getSidList(): Promise<Record<string, string>> {
        const json = await StorageWrapper.getItemAsync(this.id) ?? '{}';
        return JSON.parse(json);
    }
}
