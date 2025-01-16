import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';

export class SettingAction implements ISetting<SettingType.Action> {
    id: string;
    type: SettingType.Action;
    name: string;
    description = '';
    defaultValue: SettingTypeMapping[SettingType.Action];
    settingElem: HTMLElement;
    action?: (source: HTMLElement) => void;

    private _settingInputElem: HTMLButtonElement;

    constructor(providerId: string, name: string) {
        this.name = name;
        this.id = providerId + '-' + makeIdCompatible(this.name);
        this.type = SettingType.Action;
        this.defaultValue = '';

        this.loadFromSyncedStorage();
        this.settingElem = this._settingInputElem = this.create();
    }

    get value(): SettingTypeMapping[SettingType.Action] {
        return this._settingInputElem.textContent ?? '';
    }
    set value(newValue: SettingTypeMapping[SettingType.Action]) {
        this._settingInputElem.textContent = newValue;
    }

    create(): HTMLButtonElement {
        const settingElem = document.createElement('button');
        settingElem.id = this.id;
        settingElem.type = 'button';
        settingElem.className = 'button standard mobile-fix';
        settingElem.textContent = this.name;
        settingElem.addEventListener('click', () => this.action?.(settingElem));
        return settingElem;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function -- Actions don't have any saved data
    loadFromSyncedStorage(): void { }

    toString(): string {
        return `${this.name} = ${this.value}`;
    }
}
