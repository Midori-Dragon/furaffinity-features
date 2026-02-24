# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> FA Webcomic Auto Loader

A userscript/browser extension that enhances FurAffinity webcomic navigation by automatically detecting and loading comic pages.

See documentation on [FA-Webcomic-Auto-Loader](https://midori-dragon.github.io/furaffinity-features/#/FA-Webcomic-Auto-Loader/README).

<img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/screenshot-furaffinity-features-wal.png" width="100%">

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- A new Button for "Auto loading" and "Searching for similar Submissions" will be shown below the Image on a submission page
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
- `Custom Lightbox Show Nav` - Enable/disable custom lightbox navigation *(default: true)*
