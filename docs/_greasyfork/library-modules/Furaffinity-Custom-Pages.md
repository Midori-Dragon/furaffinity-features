# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> Furaffinity Custom Pages

Helper Library to create Custom pages on FurAffinity.

See documentation on [Furaffinity-Custom-Pages](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Custom-Pages/README).

## How to use

- `@require` this script
  <br>

- Create a new CustomPage:
  ```javascript
  const customPage = new FACustomPage("pageUrl", "parameterName");
  ```
  *See [CustomPage](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Custom-Pages/README) for more info*
  <br>

- Subscribe to the onOpen Event:
  ```javascript
  customPage.onopen = (event) => { console.log(event.detail.parameterValue) };
  customPage.addEventListener("onOpen", (event) => { console.log(event.detail.parameterValue) });
  ```
  *`event.detail` contains the custom page data including `parameterValue` and `document`*
  <br>

- Trigger the check for open pages:
  ```javascript
  FACustomPage.checkAllPages();
  ```

## Feature Roadmap

| Feature                            | Status      |
| ---------------------------------- | ----------- |
| Have basic Custom Pages            | ✅ Completed |
| Support for url encoded parameters | ✅ Completed |
