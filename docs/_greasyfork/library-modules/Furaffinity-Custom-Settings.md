# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> Furaffinity Custom Settings

Helper Library to create Custom settings on FurAffinity.

See documentation on [Furaffinity-Custom-Settings](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Custom-Settings/README).

<img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/screenshot-furaffinity-features-cs.png" width="100%">

## How to use

- `@require` this script
  <br>

- Create a Settings Object:
  ```javascript
  // Constructor takes provider name (navigation entry) and header name (settings page title)
  const customSettings = new FACustomSettings("Midori's Script Settings", "My Script Settings");
  // Multiple Settings Pages can be created with different provider/header combinations
  ```
  <br>

- Create a new Setting:
  ```javascript
  const setting = customSettings.newSetting(FASettingType.Boolean, "Setting Name");
  setting.description = "Setting Description";
  setting.defaultValue = DefaultValue;
  setting.onInput = (target) => { doSomething(); }; // For Action Settings when clicked otherwise every time the Setting is changed
  setting.addEventListener("input", (target) => { doSomething(); }); // Alternative to onInput
  setting.verifyRegex = /Regex/; // For Text Settings only
  ```
  *See [Furaffinity-Custom-Settings](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Custom-Settings/README) for more info*
  <br>

- Trigger when settings should be loaded:
  ```javascript
  customSettings.loadSettings(); // loads Navigation Menu & Settings if on Settings Page
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
