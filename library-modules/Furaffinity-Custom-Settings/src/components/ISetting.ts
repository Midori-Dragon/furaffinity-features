import { SettingType, SettingTypeMapping } from '../utils/SettingType';

export interface ISetting<T extends SettingType> extends EventTarget {
    id: string | number;
    type: T;
    name: string;
    description: string;
    value: SettingTypeMapping[T];
    defaultValue: SettingTypeMapping[T];
    settingElem: HTMLElement;
    onInput?: (source: HTMLElement) => void;

    create(): HTMLElement;
    loadFromSyncedStorage(): void;
    toString(): string;
}
