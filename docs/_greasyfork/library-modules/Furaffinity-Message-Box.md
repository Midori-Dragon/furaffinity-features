# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/icon.svg" height="30"> Furaffinity Message Box

Helper Library to show a MessageBox for your custom FurAffinity Script.

See documentation on [Furaffinity-Message-Box](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Message-Box/README).

## How to use

- `@require` this script
  <br>

- Show a MessageBox:
  ```javascript
  await FAMessageBox.show('Hello, world!');
  const result = await FAMessageBox.show('This is a confirmation.', 'Confirmation', FAMessageBoxButtons.YesNo, FAMessageBoxIcon.Question);
  if (result === FADialogResult.Yes) { /* ... */ }
  ```
  *See [Furaffinity-Message-Box](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Message-Box/README) for more info*

## Feature Roadmap

| Feature                          | Status      |
| -------------------------------- | ----------- |
| Have MessageBox                  | ✅ Completed |
| Support different Types          | ✅ Completed |
| ⠀⠀⠀⠀Information                  | ✅ Completed |
| ⠀⠀⠀⠀Question                     | ✅ Completed |
| ⠀⠀⠀⠀Warning                      | ✅ Completed |
| ⠀⠀⠀⠀Error                        | ✅ Completed |
| Support Furaffinity Color Themes | ✅ Completed |
| Support non async MessageBox     | ⬜ Planned   |
