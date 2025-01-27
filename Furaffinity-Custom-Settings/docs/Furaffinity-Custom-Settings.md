# Furaffinity Custom Settings

Helper Library to create Custom settings on Furaffinitiy. Also see this Script on Greasy Fork as [Furaffinity-Custom-Settings](https://greasyfork.org/de/scripts/475041-furaffinity-custom-settings)

#### Table of Contents

- [Furaffinity Custom Settings](#furaffinity-custom-settings)
      - [Table of Contents](#table-of-contents)
  - [How to use](#how-to-use)
  - [Feature Roadmap](#feature-roadmap)
  - [Documentation](#documentation)
    - [Setting](#setting)
    - [SettingType](#settingtype)
    - [Action](#action)

## How to use

- `@require` this script with the following url "https://raw.githubusercontent.com/Midori-Dragon/Furaffinity-Custom-Settings/main/Furaffinity-Custom-Settings.js"
  <br>
- Create Settings Object:
  ```javascript
  const customSettings = new FACustomSettings(); // Multiple Settings Pages can be created
  customSettings.provider = "Midori's Script Settings"; // Change Navigation Settings Name
  customSettings.headerName = "My Script Settings"; // Change the Settings Header Name
  ```
  See [Settings](#settings) for more info
  <br>
- Create a new Setting:
  ```javascript
  const setting = CustomSettings.newSetting(SettingType, "Setting Name");
  setting.description = "Setting Description";
  setting.defaultValue = DefaultValue;
  setting.inInput = (target) => { doSomething(); }; // For Action Settings when clicked otherwise every time the Setting is changed
  setting.addEventListener("input", (target) => { doSomthing(); }); // Alternative to onInput
  setting.verifyRegex = /Regex/; // For Text Settings only
  ```
  See [Setting](#setting) for more info
  <br>
- Trigger when settings should be loaded:
  ```javascript
  CustomSettings.loadSettingsMenu(); //loads Navigation Menu & Settings if on Settings Page
  ```

## Feature Roadmap

- [x] Create new Settings and easily access Settings change
- [x] Have different Setting Types
  - [x] Number (TextField that only allows Numbers)
  - [x] Boolean (Checkbox with a description)
  - [x] Action (Button with a description)
  - [x] Text (TextField that allow any Characters)
- [x] Change Settings Page Name and Header Name
- [x] Have multiple different Setting Pages

## Documentation

### Setting

The Setting class contains following Properties:

- `id` - Can only be set once. Defines the Setting elements html id. Is set to setting Name, if not set manually.
- `name` - Name of the Setting.
- `description` - Description of the Setting.
- `type` - Type of the Setting. _(See [SettingType](#settingtype) for more info)_
- `defaultValue` - Default value for the Setting. _(Is ignored on `SettingTypes.Action`)_
- `action` - Action that is executed when the Setting changes. _(See [Action](#action) for more info)_
- `value` - Current value of the Setting.

- `min` - Minimum value for `SettingType.Number`
- `max` - Maximum value for `SettingType.Number`
- `step` - Step value for `SettingType.Number`

- `verifyRegex` - Regex for validation of input for `SettingType.Text`

### SettingType

SettingType can have the following values:

- `SettingType.Number` - A TextField that only accepts Numbers. _(Enables min, max, step)_
- `SettingType.Text` - A TextField that allows any Character. _(Enables verifyRegex)_
- `SettingType.Boolean` - A Checkbox with a description.
- `SettingType.Action` - A Button with a certain Action. _(Value returns the name)_

### Input

The `onInput` Property defines a Function that is executed when the Setting changed. It receives the Settings Element as a Parameter. It can also be used with `addEventListener`. Example:

```javascript
customSetting.onInput = (target) => {
  console.log(target.value); // Target is the HTML Element of the Setting
};
```

```javascript
customSetting.addEventListener("input", (target) => {
  console.log(target.value);
});
```

Here every time the Checkbox is clicked the program prints out wether it is checked or not.
