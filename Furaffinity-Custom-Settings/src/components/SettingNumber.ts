import { SyncedStorage } from '../../../GlobalUtils/src/utils/SyncedStorage';
import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';

export class SettingNumber implements ISetting<SettingType.Number> {
    public id: string;
    public type: SettingType.Number;
    public name: string;
    public description: string;
    public min: number;
    public max: number;
    public step: number;
    public settingElem: HTMLElement;
    public action?: (source: HTMLElement) => void;

    public get value(): SettingTypeMapping[SettingType.Number] {
        return parseInt(localStorage.getItem(this.id) ?? this.defaultValue.toString()) || this.defaultValue;
    }
    public set value(newValue: SettingTypeMapping[SettingType.Number]) {
        newValue = Math.min(Math.max(newValue, this.min), this.max);
        if (newValue === this.defaultValue) {
            localStorage.removeItem(this.id);
            void SyncedStorage.removeItem(this.id);
        } else {
            localStorage.setItem(this.id, newValue.toString());
            void SyncedStorage.setItem(this.id, newValue);
        }
        this._settingInputElem.value = newValue.toString();
        this.action?.(this._settingInputElem);
    }

    public get defaultValue(): SettingTypeMapping[SettingType.Number] {
        return this._defaultValue;
    }
    public set defaultValue(value: SettingTypeMapping[SettingType.Number]) {
        this._defaultValue = value;
        this.value = this.value;
    }

    private _defaultValue: SettingTypeMapping[SettingType.Number];
    private _settingInputElem: HTMLInputElement;

    constructor(providerId: string, name: string) {
        this.name = name;
        this.id = providerId + '_' + makeIdCompatible(this.name);
        this.type = SettingType.Number;
        this.description = '';
        this._defaultValue = 0;
        this.min = 0;
        this.max = 32767;
        this.step = 1;

        this.loadFromSyncedStorage();
        this.settingElem = this._settingInputElem = this.create();
    }

    public create(): HTMLInputElement {
        const settingElem = document.createElement('input');
        settingElem.id = this.id;
        settingElem.type = 'text';
        settingElem.className = 'textbox';
        settingElem.addEventListener('keydown', (event) => {
            const currentValue = parseInt(settingElem.value) || this.defaultValue;
            if (event.key === 'ArrowUp') {
                this.value = Math.min(currentValue + this.step, this.max);
            } else if (event.key === 'ArrowDown') {
                this.value = Math.max(currentValue - this.step, this.min);
            }
        });
        settingElem.addEventListener('input', () => {
            const inputValue = settingElem.value.replace(/[^0-9]/g, '');
            const numericValue = parseInt(inputValue) || this.defaultValue;
            this.value = Math.min(Math.max(numericValue, this.min), this.max);
        });
        return settingElem;
    }

    public loadFromSyncedStorage(): void {
        void SyncedStorage.getItem(this.id).then((value) => {
            if (value != null) {
                localStorage.setItem(this.id, value.toString());
            }
        });
    }

    public toString(): string {
        return `${this.name} = ${this.value}`;
    }
}
