import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { SyncedStorage } from '../../../GlobalUtils/src/utils/Browser-API/SyncedStorage';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';
import { Logger } from '../../../GlobalUtils/src/utils/Logger';

export class SettingText implements ISetting<SettingType.Text> {
    public id: string;
    public type: SettingType.Text;
    public name: string;
    public description: string;
    public settingElem: HTMLElement;
    public verifyRegex: RegExp | undefined;
    public action?: (source: HTMLElement) => void;

    public get value(): SettingTypeMapping[SettingType.Text] {
        return localStorage.getItem(this.id) ?? this.defaultValue;
    }
    public set value(newValue: SettingTypeMapping[SettingType.Text]) {
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
        this.action?.(this._settingInputElem);
    }

    public get defaultValue(): SettingTypeMapping[SettingType.Text] {
        return this._defaultValue;
    }
    public set defaultValue(value: SettingTypeMapping[SettingType.Text]) {
        this._defaultValue = value;
        this.value = this.value;
    }

    private _defaultValue: SettingTypeMapping[SettingType.Text];
    private _settingInputElem: HTMLInputElement;
    private _errorMessage: HTMLDivElement;

    constructor(providerId: string, name: string) {
        this.name = name;
        this.id = providerId + '_' + makeIdCompatible(this.name);
        this.type = SettingType.Text;
        this.description = '';
        this._defaultValue = '';

        this.loadFromSyncedStorage();
        this.settingElem = this.create();
        this._settingInputElem = this.settingElem.querySelector('input') as HTMLInputElement;
        this._errorMessage = this.settingElem.querySelector('.error-message') as HTMLDivElement;
    }

    public create(): HTMLElement {
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
