import { SettingNumber } from '../components/SettingNumber';
import { SettingBoolean } from '../components/SettingBoolean';
import { SettingAction } from '../components/SettingAction';
import { SettingText } from '../components/SettingText';

export enum SettingType {
    Number,
    Boolean,
    Action,
    Text,
}

export interface SettingTypeMapping {
    [SettingType.Number]: number;
    [SettingType.Boolean]: boolean;
    [SettingType.Action]: string;
    [SettingType.Text]: string;
}

export interface SettingClassMapping {
    [SettingType.Number]: SettingNumber;
    [SettingType.Boolean]: SettingBoolean;
    [SettingType.Action]: SettingAction;
    [SettingType.Text]: SettingText;
}

export interface SettingClassTypeMapping {
    [SettingType.Number]: typeof SettingNumber;
    [SettingType.Boolean]: typeof SettingBoolean;
    [SettingType.Action]: typeof SettingAction;
    [SettingType.Text]: typeof SettingText;
}
