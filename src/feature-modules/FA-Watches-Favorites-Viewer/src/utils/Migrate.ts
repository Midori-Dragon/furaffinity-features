import { StorageWrapper } from '../../../../library-modules/GlobalUtils/src/Browser-API/StorageWrapper';
import string from '../../../../library-modules/GlobalUtils/src/string';
import { IgnoreList } from './IgnoreList';
import { LastSidList } from './LastSidList';

export async function migrate(): Promise<void> {
    await migrateIgnoreList();
    await migrateLastSidList();
    await StorageWrapper.removeItemAsync('wfloadingstate');
    await StorageWrapper.removeItemAsync('wfloading');
    await StorageWrapper.removeItemAsync('wfcurrentfavs');
}

export async function migrateIgnoreList(): Promise<void> {
    const oldIgnoreListJson = await StorageWrapper.getItemAsync('wfexcludedusers') ?? '[]';
    const oldIgnoreList = JSON.parse(oldIgnoreListJson) as string[];

    for (const username of oldIgnoreList) {
        await IgnoreList.add(username);
    }
    await StorageWrapper.removeItemAsync('wfexcludedusers');
}

export async function migrateLastSidList(): Promise<void> {
    const oldLastSidListJson = await StorageWrapper.getItemAsync('wflastfavs') ?? '{}';
    const oldLastSidList = JSON.parse(oldLastSidListJson) as Record<string, string>;
    
    for (const [username, sid] of Object.entries(oldLastSidList)) {
        await LastSidList.setSid(username, sid.trimStart('sid-'));
    }
    await StorageWrapper.removeItemAsync('wflastfavs');
}

export async function checkMigrateNeeded(): Promise<boolean> {
    return !await checkMigrateIgnoreListNeeded() || !await checkMigrateSidListNeeded();
}

export async function checkMigrateIgnoreListNeeded(): Promise<boolean> {
    const oldIgnoreListJson = await StorageWrapper.getItemAsync('wfexcludedusers');
    return !string.isNullOrWhitespace(oldIgnoreListJson);
}

export async function checkMigrateSidListNeeded(): Promise<boolean> {
    const oldLastSidListJson = await StorageWrapper.getItemAsync('wflastfavs');
    return !string.isNullOrWhitespace(oldLastSidListJson);
}
