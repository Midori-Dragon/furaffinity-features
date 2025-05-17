# FA Webcomic Auto Loader

A userscript/browser extension that enhances FurAffinity webcomic navigation by automatically detecting and loading comic pages. Also available on GreasyFork as [FA-Webcomic-Auto-Loader](https://greasyfork.org/scripts/457759-fa-webcomic-autoloader).

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- A new Button for "Auto loading" and "Searhcing for simular Submissions" will be shown below the Image on a submission page
- The loader will automatically:
  - Detect comic navigation elements and use them for loading next and previous pages
  - Enable forward/backward navigation using the actual comic navigation
  - Handle lightbox integration if enabled
- When no comic navigation is found, the loader will search for similar pages

## Feature Roadmap

| Feature                         | Status      |
| ------------------------------- | ----------- |
| Comic navigation detection      | ✅ Completed |
| Forward/backward searching      | ✅ Completed |
| Custom lightbox integration     | ✅ Completed |
| Loading animations              | ✅ Completed |
| Navigation button customization | ✅ Completed |
| Folder support                  | ✅ Completed |

## Settings
- `showSearchButton` - Enable/disable the search for similar pages button *(default: true)*
- `loadingSpinSpeed` - Control loading animation speed *(default: 1000)*
- `backwardSearch` - How many pages to search backwards *(default: 3)*
- `overwriteNavButtons` - Whether to overwrite navigation buttons with comic navigation *(default: true)*
- `useCustomLightbox` - Enable/disable custom lightbox *(default: true)*
- `useCustomLightboxNav` - Enable/disable custom lightbox navigation *(default: true)*

## Documentation

### AutoLoader

The AutoLoader class contains the following properties:

- `submissionImg` - The current comic page image
- `currComicNav` - Current comic navigation instance *(see [ComicNavigation](#comicnavigation))* 
- `currComicNavExists` - Whether the current comic navigation instance exists
- `currSid` - The current submission ID

---

### ComicNavigation

Handles comic navigation detection and management:

- Detects navigation links in submission descriptions
- Manages first, previous, and next page IDs
- Provides navigation helper methods

---

### Searching

There are 3 classes for search functionality:

- `ForwardSearch` - Handles searching for next comic pages if comic navigation is missing
- `BackwardSearch` - Handles searching for previous comic pages if comic navigation is missing
- `AutoLoaderSearch` - Handles comic page loading if comic navigation is present
