# Furaffinity Custom Settings

Helper Library to create Custom settings on Furaffinitiy. Also see this Script on GreasyFork as [Furaffinity-Custom-Settings](https://greasyfork.org/scripts/475041-furaffinity-custom-settings)

## How to use

- `@require` this script from GreasyFork or (in case of browser extension) import it as a module
- Create Settings Object:
  ```javascript
  const customSettings = new FACustomSettings(); // Multiple Settings Pages can be created
  customSettings.provider = "Midori's Script Settings"; // Change Navigation Settings Name
  customSettings.headerName = "My Script Settings"; // Change the Settings Header Name
  ```
  See [Settings](#settings) for more info
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
- Trigger when settings should be loaded:
  ```javascript
  CustomSettings.loadSettingsMenu(); //loads Navigation Menu & Settings if on Settings Page
  ```

## Feature Roadmap

| Feature                                               | Status      |
| ----------------------------------------------------- | ----------- |
| Create new Settings and easily access Settings change | ✅ Completed |
| Have different Setting Types                          | ✅ Completed |
| ⠀⠀⠀⠀Number (TextField that only allows Numbers)       | ✅ Completed |
| ⠀⠀⠀⠀Boolean (Checkbox with a description)             | ✅ Completed |
| ⠀⠀⠀⠀Action (Button with a description)                | ✅ Completed |
| ⠀⠀⠀⠀Text (TextField that allow any Characters)        | ✅ Completed |
| ⠀⠀⠀⠀Option (Combobox with multiple options)           | ✅ Completed |
| Change Settings Page Name and Header Name             | ✅ Completed |
| Have multiple different Setting Pages                 | ✅ Completed |
| Import and Export Settings                            | ✅ Completed |

## Documentation

### Setting

The Setting class contains following Properties:

- `id` - Can only be set once. Defines the Setting elements html id. Is set to setting Name, if not set manually.
- `name` - Name of the Setting.
- `description` - Description of the Setting.
- `type` - Type of the Setting. *(See [SettingType](#settingtype) for more info)*
- `defaultValue` - Default value for the Setting. *(Is ignored on `SettingTypes.Action`)*
- `action` - Action that is executed when the Setting changes. *(See [Action](#action) for more info)*
- `value` - Current value of the Setting.

- `min` - Minimum value for `SettingType.Number`
- `max` - Maximum value for `SettingType.Number`
- `step` - Step value for `SettingType.Number`

- `verifyRegex` - Regex for validation of input for `SettingType.Text`

- `options` - Option values for `SettingType.Option`
- `addOption(value, text)` - Function to add an option to `SettingType.Option`
- `removeOption(value)` - Function to remove an option from `SettingType.Option`

---

### SettingType

SettingType can have the following values:

- `SettingType.Number` - A TextField that only accepts Numbers. *(Enables min, max, step)*
- `SettingType.Text` - A TextField that allows any Character. *(Enables verifyRegex)*
- `SettingType.Boolean` - A Checkbox with a description.
- `SettingType.Action` - A Button with a certain Action. *(Value returns the name)*
- `SettingType.Option` - A Combobox with multiple options. *(Enables values)*

---

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
