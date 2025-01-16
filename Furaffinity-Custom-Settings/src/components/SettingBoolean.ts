import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { SyncedStorage } from '../../../GlobalUtils/src/utils/Browser-API/SyncedStorage';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';

export class SettingBoolean implements ISetting<SettingType.Boolean> {
    id: string;
    type: SettingType.Boolean;
    name: string;
    description = '';
    settingElem: HTMLElement;
    action?: (source: HTMLElement) => void;

    private _defaultValue: SettingTypeMapping[SettingType.Boolean];
    private _settingInputElem: HTMLInputElement;

    constructor(providerId: string, name: string) {
        this.name = name;
        this.id = providerId + '-' + makeIdCompatible(this.name);
        this.type = SettingType.Boolean;
        this._defaultValue = false;

        this.loadFromSyncedStorage();
        this.settingElem = this.create();
        this._settingInputElem = this.settingElem.querySelector('input') as HTMLInputElement;
    }

    get value(): SettingTypeMapping[SettingType.Boolean] {
        const localValue = localStorage.getItem(this.id);
        if (localValue == null) {
            return this.defaultValue;
        } 
        return localValue === 'true' || localValue === '1';
    }
    set value(newValue: SettingTypeMapping[SettingType.Boolean]) {
        if (newValue === this.defaultValue) {
            localStorage.removeItem(this.id);
            void SyncedStorage.removeItem(this.id);
        } else {
            localStorage.setItem(this.id, newValue.toString());
            void SyncedStorage.setItem(this.id, newValue);
        }
        this._settingInputElem.checked = newValue;
        this.action?.(this._settingInputElem);
    }

    get defaultValue(): SettingTypeMapping[SettingType.Boolean] {
        return this._defaultValue;
    }
    set defaultValue(value: SettingTypeMapping[SettingType.Boolean]) {
        this._defaultValue = value;
        this.value = this.value;
    }

    create(): HTMLElement {
        const container = document.createElement('div');
        const settingElem = document.createElement('input');
        settingElem.id = this.id;
        settingElem.type = 'checkbox';
        settingElem.style.cursor = 'pointer';
        settingElem.style.marginRight = '4px';
        settingElem.addEventListener('change', () => this.value = settingElem.checked);
        container.appendChild(settingElem);

        const settingElemLabel = document.createElement('label');
        settingElemLabel.textContent = this.name;
        settingElemLabel.style.cursor = 'pointer';
        settingElemLabel.style.userSelect = 'none';
        settingElemLabel.htmlFor = this.id;
        container.appendChild(settingElemLabel);
        return container;
    }

    loadFromSyncedStorage(): void {
        void SyncedStorage.getItem(this.id).then((value) => {
            if (value != null) {
                localStorage.setItem(this.id, value.toString());
            }
        });
    }

    toString(): string {
        return `${this.name} = ${this.value}`;
    }
}
