# Furaffinity Custom Pages

Helper Script to create Custom pages on Furaffinitiy. Also see this Script on Greasy Fork as [Furaffinity-Custom-Pages](https://greasyfork.org/scripts/476762-furaffinity-custom-pages)

## How to use

- `@require` this script from GreasyFork or (in case of browser extension) import it as a module
- Create a new CustomPage:
  ```javascript
  const customPage = new FACustomPage("pageUrl", "parameterName");
  ```
  See [CustomPage](#custompage) for more info
- Subscribe to the onOpen Event (Either directly or with addEventListener):
  ```javascript
  customPage.onopen = (event) => { console.log(event.detail.parameterValue) };
  customPage.addEventListener("onOpen", (event) => { console.log(event.detail.parameterValue) });
  ```
  *`event.detail` is the [CustomData](#customdata) class*
- Trigger the check for open pages:
  ```javascript
  FACustomPage.checkAllPages();
  ```

## Feature Roadmap

| Feature                            | Status      |
| ---------------------------------- | ----------- |
| Have basic Custom Pages            | ✅ Completed |
| Support for url encoded parameters | ✅ Completed |

## Documentation

### CustomPage

The CustomPage class contains following Properties:

- `pageUrl` - The url on which the parameter has to be to execute the event
- `parameterName` - The name of the parameter on which you want the event to execute
- `parameterValue` - The value of the parameter, if the CustomPage is open
- `isOpen` - A boolean wether the CustomPage is open

It supports the following Events:

- `onopen` - Event has [CustomData](#customdata) as details

It has following functions:

- `checkPageOpened()` - Checks if the CustomPage is open and triggers the event if it is
- `static checkAllPages()` - Checks all registered CustomPages and triggers their events if open

---

### CustomData

The CustomData class contains following Properties:

- `parameterValue` - The parameterValue of the current opened Page
- `document` - The HTML Document of the current opened Page

It has following functions:

- `removeDocumentSiteContent()` - Removes the default SiteContent of the openedPage document. Returns the document without SiteContent
