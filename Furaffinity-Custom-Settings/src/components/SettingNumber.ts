import { SyncedStorage } from '../../../GlobalUtils/src/utils/Browser-API/SyncedStorage';
import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';

export class SettingNumber extends EventTarget implements ISetting<SettingType.Number> {
    id: string;
    type: SettingType.Number;
    name: string;
    description = '';
    min: number;
    max: number;
    step: number;
    settingElem: HTMLElement;

    private _onInput?: (source: HTMLElement) => void;
    private _defaultValue: SettingTypeMapping[SettingType.Number];
    private _settingInputElem: HTMLInputElement;

    constructor(providerId: string, name: string) {
        super();
        this.name = name;
        this.id = providerId + '-' + makeIdCompatible(this.name);
        this.type = SettingType.Number;
        this._defaultValue = 0;
        this.min = 0;
        this.max = 32767;
        this.step = 1;

        this.loadFromSyncedStorage();
        this.settingElem = this._settingInputElem = this.create();
    }

    get value(): SettingTypeMapping[SettingType.Number] {
        return parseInt(localStorage.getItem(this.id) ?? this.defaultValue.toString()) || this.defaultValue;
    }
    set value(newValue: SettingTypeMapping[SettingType.Number]) {
        newValue = Math.min(Math.max(newValue, this.min), this.max);
        if (newValue === this.defaultValue) {
            localStorage.removeItem(this.id);
            void SyncedStorage.removeItem(this.id);
        } else {
            localStorage.setItem(this.id, newValue.toString());
            void SyncedStorage.setItem(this.id, newValue);
        }
        this._settingInputElem.value = newValue.toString();
        this.invokeInput(this._settingInputElem);
    }

    get defaultValue(): SettingTypeMapping[SettingType.Number] {
        return this._defaultValue;
    }
    set defaultValue(value: SettingTypeMapping[SettingType.Number]) {
        this._defaultValue = value;
        this.value = this.value;
    }

    get onInput(): ((source: HTMLElement) => void) | undefined {
        return this._onInput;
    }
    set onInput(handler: ((source: HTMLElement) => void) | undefined) {
        this._onInput = handler;
    }

    create(): HTMLInputElement {
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

    private invokeInput(elem: HTMLElement): void {
        this.onInput?.(elem);
        this.dispatchEvent(new CustomEvent('input', { detail: elem }));
    }
}
