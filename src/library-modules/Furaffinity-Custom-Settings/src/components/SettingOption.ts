import { SyncedStorage } from '../../../GlobalUtils/src/Browser-API/SyncedStorage';
import { Logger } from '../../../GlobalUtils/src/Logger';
import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';

export class SettingOption extends EventTarget implements ISetting<SettingType.Option> {
    id: string;
    type: SettingType.Option;
    name: string;
    description = '';
    settingElem: HTMLElement;

    private _onInput?: (source: HTMLElement) => void;
    private _defaultValue: SettingTypeMapping[SettingType.Option];
    private _settingInputElem: HTMLSelectElement;

    constructor(providerId: string, name: string) {
        super();
        Object.setPrototypeOf(this, SettingOption.prototype);
        
        this.name = name;
        this.id = providerId + '-' + makeIdCompatible(this.name);
        this.type = SettingType.Option;
        this._defaultValue = '0';

        this.loadFromSyncedStorage();
        this.settingElem = this.create();
        this._settingInputElem = this.settingElem.querySelector('select') as HTMLSelectElement;
    }

    get value(): SettingTypeMapping[SettingType.Option] {
        return localStorage.getItem(this.id) ?? this.defaultValue;
    }
    set value(newValue: SettingTypeMapping[SettingType.Option]) {
        try {
            // eslint-disable-next-line eqeqeq
            if (newValue == this.defaultValue) {
                localStorage.removeItem(this.id);
                void SyncedStorage.removeItem(this.id);
            } else {
                localStorage.setItem(this.id, newValue.toString());
                void SyncedStorage.setItem(this.id, newValue.toString());
            }
        } catch (error) {
            Logger.logError(error);
        }
        this._settingInputElem.value = newValue.toString();
        this.invokeInput(this._settingInputElem);
    }

    get defaultValue(): SettingTypeMapping[SettingType.Option] {
        return this._defaultValue;
    }
    set defaultValue(value: SettingTypeMapping[SettingType.Option]) {
        this._defaultValue = value;
        this.value = this.value;
    }

    get options(): Record<string, string> {
        const options: Record<string, string> = {};
        for (const option of Array.from(this._settingInputElem.options)) {
            options[option.value] = option.textContent ?? '';
        }
        return options;
    }
    set options(newValue: Record<string | number, string | number>) {
        const currValue = this.value;
        this._settingInputElem.innerHTML = '';
        for (const [value, text] of Object.entries(newValue)) {
            this.addOption(value, text);
        }
        if (Array.from(this._settingInputElem.options).some(x => x.value === currValue.toString())) {
            this.value = currValue;
        } else {
            this.value = this.defaultValue;
        }
    }

    get onInput(): ((source: HTMLElement) => void) | undefined {
        return this._onInput;
    }
    set onInput(handler: ((source: HTMLElement) => void) | undefined) {
        this._onInput = handler;
    }

    addOption(value: string | number, text: string | number): void {
        if (this._settingInputElem.options.namedItem(value.toString()) != null) {
            Logger.logWarning(`Option with value "${value}" already exists.`);
            return;
        }

        const option = document.createElement('option');
        option.value = value.toString();
        option.textContent = text.toString();
        this._settingInputElem.options.add(option);
    }

    removeOption(value: string | number): void {
        const option = this._settingInputElem.options.namedItem(value.toString());
        if (option == null) {
            Logger.logWarning(`Option with value "${value}" does not exist.`);
            return;
        }
        this._settingInputElem.removeChild(option);
    }

    create(): HTMLElement {
        const container = document.createElement('div');
        container.style.position = 'relative';

        const settingElem = document.createElement('select');
        settingElem.id = this.id;
        settingElem.className = 'styled';
        settingElem.addEventListener('change', () => {
            this.value = settingElem.value;
        });
        container.appendChild(settingElem);

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

    private invokeInput(elem: HTMLElement): void {
        this.onInput?.(elem);
        this.dispatchEvent(new CustomEvent('input', { detail: elem }));
    }
}
