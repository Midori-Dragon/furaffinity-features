import { showResetButtonSetting } from '..';
import { Logger } from '../../../GlobalUtils/src/Logger';
import { ISetting } from '../components/ISetting';
import { SettingAction } from '../components/SettingAction';
import { SettingBoolean } from '../components/SettingBoolean';
import { SettingNumber } from '../components/SettingNumber';
import { SettingText } from '../components/SettingText';
import { SettingType, SettingClassMapping, SettingClassTypeMapping } from '../utils/SettingType';
import { makeIdCompatible } from '../utils/Utils';
import '../Styles/Style.css';
import { SettingOption } from '../components/SettingOption';

export class Settings {
    settings: Record<string, ISetting<SettingType>> = {};
    showFeatureEnabledSetting = true;

    private _menuName: string;
    private _menuNameId: string;
    private _provider: string;
    private _providerId: string;
    private _headerName: string;
    private _isFeatureEnabledSetting: SettingBoolean;

    private _settingClassMapping: SettingClassTypeMapping = {
        [SettingType.Number]: SettingNumber,
        [SettingType.Boolean]: SettingBoolean,
        [SettingType.Action]: SettingAction,
        [SettingType.Text]: SettingText,
        [SettingType.Option]: SettingOption
    };

    constructor(provider: string, headerName: string) {
        this._menuName = 'Extension Settings';
        this._menuNameId = makeIdCompatible('Extension Settings');
        this._provider = provider;
        this._providerId = makeIdCompatible(provider);
        this._headerName = headerName;

        this._isFeatureEnabledSetting = new SettingBoolean(this.providerId, `${headerName} Enabled`);
        this._isFeatureEnabledSetting.defaultValue = true;
    }

    get menuName(): string {
        return this._menuName;
    }
    get menuNameId(): string {
        return this._menuNameId;
    }
    get provider(): string {
        return this._provider;
    }
    get providerId(): string {
        return this._providerId;
    }
    get headerName(): string {
        return this._headerName;
    }
    get isFeatureEnabled(): boolean {
        return this._isFeatureEnabledSetting.value;
    }

    newSetting<T extends SettingType>(type: T, name: string): SettingClassMapping[T] {
        const classConstructor = this._settingClassMapping[type];
        const newSetting = new classConstructor(this.providerId, name) as SettingClassMapping[T];
        this.settings[name] = newSetting;
        return newSetting;
    }

    loadSettings(): void {
        try {
            this.addExSettingsMenu(this.menuName, this.provider, this.menuNameId, this.providerId);
            if (window.location.toString().includes('controls/settings')) {
                this.addExSettingsMenuSidebar(this.menuName, this.provider, this.menuNameId, this.providerId);
                if (window.location.toString().includes('?extension=' + this.providerId)) {
                    this.loadSettingValues(this.headerName, Object.values(this.settings));
                }
            }
        } catch (error) {
            Logger.logError(error);
        }
    }

    private loadSettingValues(headerName: string, settings: ISetting<SettingType>[]): void {
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
            Logger.logError('Failed to load settings. No content found.');
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
        headerContainer.className = 'section-header cs';
        const header = document.createElement('h2');
        header.textContent = headerName;
        
        const bodyContainer = document.createElement('div');
        bodyContainer.className = 'section-body cs';
        if (this._isFeatureEnabledSetting.value) {
            bodyContainer.classList.remove('collapsed');
        } else {
            bodyContainer.classList.add('collapsed');
        }

        if (this.showFeatureEnabledSetting) {
            headerContainer.appendChild(this.createFeatureEnableSetting(bodyContainer));
        }
        headerContainer.appendChild(header);
        section.appendChild(headerContainer);

        for (const setting of settings) {
            bodyContainer.appendChild(this.createSettingContainer(setting));
        }

        section.appendChild(bodyContainer);
        content.appendChild(section);
    }
    
    private createFeatureEnableSetting(bodyContainer: HTMLElement): HTMLElement {
        const enableFeatureSettingContainerElem = document.createElement('label');
        enableFeatureSettingContainerElem.classList.add('switch-cs');
        const enableFeatureSettingInput = document.createElement('input');
        enableFeatureSettingInput.type = 'checkbox';
        enableFeatureSettingInput.id = 'toggleSwitch';
        enableFeatureSettingInput.checked = this._isFeatureEnabledSetting.value;
        enableFeatureSettingInput.addEventListener('input', (): void => {
            this._isFeatureEnabledSetting.value = enableFeatureSettingInput.checked;
            if (enableFeatureSettingInput.checked) {
                bodyContainer.classList.remove('collapsed');
            } else {
                bodyContainer.classList.add('collapsed');
            }
        });
        const enableFeatureSettingSpan = document.createElement('span');
        enableFeatureSettingSpan.classList.add('slider-cs');
        enableFeatureSettingContainerElem.appendChild(enableFeatureSettingInput);
        enableFeatureSettingContainerElem.appendChild(enableFeatureSettingSpan);
        return enableFeatureSettingContainerElem;
    }

    toString(): string {
        if (Object.keys(this.settings).length === 0) {
            return `${this.menuName} has no settings.`;
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
        settingDescReset.addEventListener('click', (): void => {
            setting.value = setting.defaultValue;
        });
        return settingDescReset;
    }

    private addExSettingsMenu(name: string, provider: string, nameId: string, providerId: string): void {
        try {
            const navBar = document.querySelector('ul[class="navhideonmobile"]');
            const settings = navBar?.querySelector('a[href="/controls/settings/"]')?.parentNode;
            if (settings == null) {
                Logger.logError(`Failed to add extension ${name} to settings menu`);
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
        } catch (error) {
            Logger.logError(error);
        }
    }

    private addExSettingsMenuSidebar(name: string, provider: string, nameId: string, providerId: string): void {
        try {
            const settings = document.getElementById('controlpanelnav');

            if (settings == null) {
                Logger.logError(`Failed to add extension ${name} to settings sidebar`);
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
        } catch (error) {
            Logger.logError(error);
        }
    }
};
export { showResetButtonSetting };
