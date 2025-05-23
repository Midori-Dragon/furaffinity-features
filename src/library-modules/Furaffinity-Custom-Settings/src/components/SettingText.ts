import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { SyncedStorage } from '../../../GlobalUtils/src/Browser-API/SyncedStorage';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';
import { Logger } from '../../../GlobalUtils/src/Logger';

export class SettingText extends EventTarget implements ISetting<SettingType.Text> {
    id: string;
    type: SettingType.Text;
    name: string;
    description = '';
    settingElem: HTMLElement;
    verifyRegex: RegExp | undefined;

    private _onInput?: (source: HTMLElement) => void;
    private _defaultValue: SettingTypeMapping[SettingType.Text];
    private _settingInputElem: HTMLInputElement;
    private _errorMessage: HTMLDivElement;

    constructor(providerId: string, name: string) {
        super();
        Object.setPrototypeOf(this, SettingText.prototype);
        
        this.name = name;
        this.id = providerId + '-' + makeIdCompatible(this.name);
        this.type = SettingType.Text;
        this._defaultValue = '';

        this.loadFromSyncedStorage();
        this.settingElem = this.create();
        this._settingInputElem = this.settingElem.querySelector('input') as HTMLInputElement;
        this._errorMessage = this.settingElem.querySelector('.error-message') as HTMLDivElement;
    }

    get value(): SettingTypeMapping[SettingType.Text] {
        return localStorage.getItem(this.id) ?? this.defaultValue;
    }
    set value(newValue: SettingTypeMapping[SettingType.Text]) {
        if (this.verifyRegex != null && !this.verifyRegex.test(newValue)) {
            this._errorMessage.style.display = 'block';
            return;
        }
        this._errorMessage.style.display = 'none';

        try {
            if (newValue === this.defaultValue) {
                localStorage.removeItem(this.id);
                void SyncedStorage.removeItem(this.id);
            } else {
                localStorage.setItem(this.id, newValue);
                void SyncedStorage.setItem(this.id, newValue);
            }
        } catch (error) {
            Logger.logError(error);
        }
        this._settingInputElem.value = newValue;
        this.invokeInput(this._settingInputElem);
    }

    get defaultValue(): SettingTypeMapping[SettingType.Text] {
        return this._defaultValue;
    }
    set defaultValue(value: SettingTypeMapping[SettingType.Text]) {
        this._defaultValue = value;
        this.value = this.value;
    }

    get onInput(): ((source: HTMLElement) => void) | undefined {
        return this._onInput;
    }
    set onInput(handler: ((source: HTMLElement) => void) | undefined) {
        this._onInput = handler;
    }

    create(): HTMLElement {
        const container = document.createElement('div');
        container.style.position = 'relative';

        const settingElem = document.createElement('input');
        settingElem.id = this.id;
        settingElem.type = 'text';
        settingElem.className = 'textbox';
        settingElem.addEventListener('input', () => {
            if (this.verifyRegex != null && !this.verifyRegex.test(settingElem.value)) {
                this._errorMessage.style.display = 'block';
            } else {
                this._errorMessage.style.display = 'none';
            }
            this.value = settingElem.value;
        });
        container.appendChild(settingElem);

        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.style.display = 'none';
        errorMessage.style.position = 'absolute';
        errorMessage.style.top = '100%';
        errorMessage.style.left = '0';
        errorMessage.textContent = 'Invalid input';
        container.appendChild(errorMessage);

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
