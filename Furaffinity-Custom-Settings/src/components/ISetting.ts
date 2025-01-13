import { SettingType, SettingTypeMapping } from '../utils/SettingType';

export interface ISetting<T extends SettingType> {
    id: string | number;
    type: T;
    name: string;
    description: string;
    value: SettingTypeMapping[T];
    defaultValue: SettingTypeMapping[T];
    settingElem: HTMLElement;
    action?: (source: HTMLElement) => void;

    create(): HTMLElement;
    loadFromSyncedStorage(): void;
    toString(): string;
}
