# Furaffinity Custom Pages

Helper Script to create Custom pages on Furaffinitiy. Also see this Script on Greasy Fork as [Furaffinity-Custom-Pages](https://greasyfork.org/scripts/476762-furaffinity-custom-pages)

#### Table of Contents

- [How to use](#how-to-use)
- [Feature Roadmap](#feature-roadmap)
- [Documentation](#documentation)

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
  _`event.detail` is the [CustomData](#customdata) class_
- Trigger the check for open pages:
  ```javascript
  FACustomPages.checkAllPages();
  ```

## Feature Roadmap

- [x] Have basic Custom Pages
- [x] Support for url encoded parameters

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

- `pageOpened(parameterValue, openedPage)` - Triggers the onopen event. Takes the current parameterValue and the openedPage HTML Document
- `checkPageOpened()` - Checks if the CustomPage is open and triggers the event if it is

### CustomData

The CustomData class contains following Properties:

- `parameterName` - The parameterName of the current opened Page
- `parameterValue` - The parameterValue of the current opened Page
- `document` - The HTML Document of the current opened Page

It has following functions:

- `removeDocumentSiteContent()` - Removes the default SiteContent of the openedPage document. Returns the document without SiteContent