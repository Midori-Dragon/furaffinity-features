# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/icon.svg" height="30"> Furaffinity Loading Animations

Library for creating different loading animations on FurAffinity.

See documentation on [Furaffinity-Loading-Animations](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Loading-Animations/README).

## How to use

- `@require` this script
  <br>

- Create a new Loading Animation:
  ```javascript
  const baseElem = document.getElementById('spinner-container');
  const spinner = new FALoadingSpinner(baseElem); // always give the baseElem as parameter
  spinner.visible = true;
  ⠀
  const textSpinner = new FALoadingTextSpinner(baseElem);
  const imageSpinner = new FALoadingImage(baseElem);
  const barSpinner = new FALoadingBar(baseElem);
  ```
  *See [Furaffinity-Loading-Animations](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Loading-Animations/README) for more info*
  <br>

- *Optional:* Change Settings:
  ```javascript
  spinner.forecolorHex = "#FF0000";
  spinner.spinnerThickness = 6;
  ```

## Feature Roadmap

| Feature                                       | Status      |
| --------------------------------------------- | ----------- |
| Have basic Options for all Loading Animations | ✅ Completed |
| ⠀⠀⠀⠀Change Speed                              | ✅ Completed |
| ⠀⠀⠀⠀Change Visibility                         | ✅ Completed |
| ⠀⠀⠀⠀Change Size                               | ✅ Completed |
| Have different Types of Animations            | ✅ Completed |
| ⠀⠀⠀⠀Text Spinner                              | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Text                           | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Font Size                      | ✅ Completed |
| ⠀⠀⠀⠀Loading Spinner                           | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Color                          | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Thickness                      | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Animation                      | ✅ Completed |
| ⠀⠀⠀⠀Image Animation                           | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Image                          | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Animation                      | ✅ Completed |
| ⠀⠀⠀⠀Loading Bar                               | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Color                          | ✅ Completed |
| ⠀⠀⠀⠀⠀⠀⠀⠀Change Text                           | ✅ Completed |
| Progress Bar                                  | ⬜ Planned   |
