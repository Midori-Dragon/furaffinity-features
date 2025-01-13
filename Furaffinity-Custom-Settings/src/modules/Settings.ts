import { showResetButtonSetting } from '..';
import { ISetting } from '../components/ISetting';
import { SettingAction } from '../components/SettingAction';
import { SettingBoolean } from '../components/SettingBoolean';
import { SettingNumber } from '../components/SettingNumber';
import { SettingText } from '../components/SettingText';
import { SettingType, SettingClassMapping, SettingClassTypeMapping } from '../utils/SettingType';
import { makeIdCompatible } from '../utils/Utils';

export class Settings {
    public headerName = 'Extension Settings';
    public settings: Record<string, ISetting<SettingType>> = {};

    private _extensionName = 'Extension Settings';
    private _extensionNameId = makeIdCompatible(this._extensionName);
    private _provider = 'Custom Furaffinity Settings';
    private _providerId = makeIdCompatible(this._provider);

    public set extensionName(value: string) {
        this._extensionName = value;
        this._extensionNameId = makeIdCompatible(value);
    }
    public get extensionName(): string {
        return this._extensionName;
    }
    public get extensionNameId(): string {
        return this._extensionNameId;
    }

    public set provider(value: string) {
        this._provider = value;
        this._providerId = makeIdCompatible(value);
    }
    public get provider(): string {
        return this._provider;
    }
    public get providerId(): string {
        return this._providerId;
    }

    private _settingClassMapping: SettingClassTypeMapping = {
        [SettingType.Number]: SettingNumber,
        [SettingType.Boolean]: SettingBoolean,
        [SettingType.Action]: SettingAction,
        [SettingType.Text]: SettingText,
    };

    public newSetting<T extends SettingType>(type: T, name: string): SettingClassMapping[T] {
        const classConstructor = this._settingClassMapping[type];
        const newSetting = new classConstructor(this.providerId, name) as SettingClassMapping[T];
        this.settings[name] = newSetting;
        return newSetting;
    }

    public loadSettingsMenu(): void {
        try {
            this.addExSettingsMenu(this.extensionName, this.provider, this.extensionNameId, this.providerId);
            if (window.location.toString().includes('controls/settings')) {
                this.addExSettingsMenuSidebar(this.extensionName, this.provider, this.extensionNameId, this.providerId);
                if (window.location.toString().includes('?extension=' + this.providerId)) {
                    this.loadSettings(this.headerName, Object.values(this.settings));
                }
            }
        } catch (e: any) {
            console.error(e as string);
        }
    }

    public loadSettings(headerName: string, settings: ISetting<SettingType>[]): void {
        if (settings.length === 0) {
            return;
        }
        const settingsContainerPresent = document.getElementById(headerName + '_settingscontainer') != null;
        if (settingsContainerPresent) {
            return;
        }

        const columnPage = document.getElementById('columnpage');
        const content = columnPage?.querySelector('div[class="content"]');
        if (content == null) {
            console.error('Failed to load settings. No content found.');
            return;
        }
        const nonExSettings = content.querySelectorAll('section:not([class="exsettings"])');

        for (const section of Array.from(nonExSettings ?? [])) {
            section.parentNode?.removeChild(section);
        }

        const section = document.createElement('section');
        section.id = headerName + '_settingscontainer';
        section.className = 'exsettings';
        const headerContainer = document.createElement('div');
        headerContainer.className = 'section-header';
        const header = document.createElement('h2');
        header.textContent = headerName;
        headerContainer.appendChild(header);
        section.appendChild(headerContainer);
        const bodyContainer = document.createElement('div');
        bodyContainer.className = 'section-body';

        for (const setting of settings) {
            bodyContainer.appendChild(this.createSettingContainer(setting));
        }

        section.appendChild(bodyContainer);
        content.appendChild(section);
    }

    public toString(): string {
        if (Object.keys(this.settings).length === 0) {
            return `${this.extensionName} has no settings.`;
        }

        let settingsString = '(';
        Object.keys(this.settings).forEach((key) => {
            if (this.settings[key].type !== SettingType.Action) {
                settingsString += `"${this.settings[key].toString()}", `;
            }
        });
        settingsString = settingsString.slice(0, -2) + ')';
        return settingsString;
    }

    private createSettingContainer(setting: ISetting<SettingType>): HTMLElement {
        const settingContainer = document.createElement('div');
        settingContainer.className = 'control-panel-item-container';

        const settingName = document.createElement('div');
        settingName.className = 'control-panel-item-name';
        const settingNameText = document.createElement('h4');
        settingNameText.textContent = setting.name;
        settingName.appendChild(settingNameText);
        settingContainer.appendChild(settingName);

        const settingDesc = document.createElement('div');
        settingDesc.className = 'control-panel-item-description';
        const settingDescText = document.createTextNode(setting.description);
        settingDesc.appendChild(settingDescText);
        settingContainer.appendChild(settingDesc);

        if (showResetButtonSetting.value) {
            settingDesc.appendChild(document.createElement('br'));
            settingDesc.appendChild(this.createSettingReset(setting));
        }

        const settingOption = document.createElement('div');
        settingOption.className = 'control-panel-item-options';
        settingOption.appendChild(setting.settingElem);

        settingContainer.appendChild(settingOption);
        return settingContainer;
    }

    private createSettingReset(setting: ISetting<SettingType>): HTMLElement {
        const settingDescReset = document.createElement('a');
        settingDescReset.id = setting.id + '_settingreset';
        settingDescReset.textContent = 'Reset this Setting';
        settingDescReset.style.cursor = 'pointer';
        settingDescReset.style.color = 'aqua';
        settingDescReset.style.textDecoration = 'underline';
        settingDescReset.style.fontStyle = 'italic';
        settingDescReset.style.fontSize = '14px';
        settingDescReset.onclick = (): void => {
            setting.value = setting.defaultValue;
        };
        return settingDescReset;
    }

    private addExSettingsMenu(name: string, provider: string, nameId: string, providerId: string): void {
        const navBar = document.querySelector('ul[class="navhideonmobile"]');
        const settings = navBar?.querySelector('a[href="/controls/settings/"]')?.parentNode;
        if (settings == null) {
            console.error(`Failed to add extension ${name} to settings menu`);
            return;
        }

        const exSettingNamePresent = document.getElementById(nameId) != null;
        const exSettingProviderPresent = document.getElementById(providerId) != null;

        if (!exSettingNamePresent) {
            const exSettingsHeader = document.createElement('h3');
            exSettingsHeader.id = nameId;
            exSettingsHeader.textContent = name;
            settings.appendChild(exSettingsHeader);
        }

        if (!exSettingProviderPresent) {
            const currExSettings = document.createElement('a');
            currExSettings.id = providerId;
            currExSettings.textContent = provider;
            currExSettings.href = '/controls/settings?extension=' + providerId;
            currExSettings.style.cursor = 'pointer';
            settings.appendChild(currExSettings);
        }
    }

    private addExSettingsMenuSidebar(name: string, provider: string, nameId: string, providerId: string): void {
        const settings = document.getElementById('controlpanelnav');

        if (settings == null) {
            console.error(`Failed to add extension ${name} to settings sidebar`);
            return;
        }

        const exSettingNamePresent = document.getElementById(nameId + '_side') != null;
        const exSettingProviderPresent = document.getElementById(providerId + '_side') != null;

        if (!exSettingNamePresent) {
            const exSettingsHeader = document.createElement('h3');
            exSettingsHeader.id = nameId + '_side';
            exSettingsHeader.textContent = name;
            settings.appendChild(exSettingsHeader);
        }

        if (!exSettingProviderPresent) {
            const currExSettings = document.createElement('a');
            currExSettings.id = providerId + '_side';
            currExSettings.textContent = provider;
            currExSettings.href = '/controls/settings?extension=' + providerId;
            currExSettings.style.cursor = 'pointer';
            settings.appendChild(currExSettings);
            settings.appendChild(document.createElement('br'));
        }
    }
};
export { showResetButtonSetting };
