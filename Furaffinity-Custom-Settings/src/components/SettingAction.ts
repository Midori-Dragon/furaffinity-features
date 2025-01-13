import { SettingType, SettingTypeMapping } from '../utils/SettingType';
import { makeIdCompatible } from '../utils/Utils';
import { ISetting } from './ISetting';

export class SettingAction implements ISetting<SettingType.Action> {
    public id: string;
    public type: SettingType.Action;
    public name: string;
    public description: string;
    public defaultValue: SettingTypeMapping[SettingType.Action];
    public settingElem: HTMLElement;
    public action?: (source: HTMLElement) => void;

    public get value(): SettingTypeMapping[SettingType.Action] {
        return this._settingInputElem.textContent ?? '';
    }
    public set value(newValue: SettingTypeMapping[SettingType.Action]) {
        this._settingInputElem.textContent = newValue;
    }

    private _settingInputElem: HTMLButtonElement;

    constructor(providerId: string, name: string) {
        this.name = name;
        this.id = providerId + '_' + makeIdCompatible(this.name);
        this.type = SettingType.Action;
        this.description = '';
        this.defaultValue = '';

        this.loadFromSyncedStorage();
        this.settingElem = this._settingInputElem = this.create();
    }

    public create(): HTMLButtonElement {
        const settingElem = document.createElement('button');
        settingElem.id = this.id;
        settingElem.type = 'button';
        settingElem.className = 'button standard mobile-fix';
        settingElem.textContent = this.name;
        settingElem.addEventListener('click', () => this.action?.(settingElem));
        return settingElem;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function -- Actions don't have any saved data
    public loadFromSyncedStorage(): void { }

    public toString(): string {
        return `${this.name} = ${this.value}`;
    }
}
