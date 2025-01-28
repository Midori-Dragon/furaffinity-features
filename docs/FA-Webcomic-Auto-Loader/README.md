# FA Webcomic Auto Loader

A userscript/browser extension that enhances FurAffinity webcomic navigation by automatically detecting and loading comic pages. Also available on GreasyFork as [FA-Webcomic-Auto-Loader](https://greasyfork.org/scripts/FA-Webcomic-Auto-Loader).

## Features

- Automatic detection of webcomic navigation links
- Forward and backward page searching
- Custom lightbox integration
- Loading animations with customizable speed
- Configurable navigation button behavior

## How to use

- `@require` this script from GreasyFork or import it as a module (for browser extensions)
- Create an auto loader instance:
  ```javascript
  const autoLoader = new AutoLoader();
  ```
- The loader will automatically:
  - Detect comic navigation elements
  - Enable forward/backward navigation
  - Handle lightbox integration if enabled
  - Manage loading animations

## Feature Roadmap

| Feature                                     | Status      |
| ------------------------------------------ | ----------- |
| Comic navigation detection                  | Completed |
| Forward/backward searching                  | Completed |
| Custom lightbox integration                 | Completed |
| Loading animations                          | Completed |
| Navigation button customization             | Completed |

## Documentation

### AutoLoader

The AutoLoader class contains the following properties:

- `submissionImg` - The current comic page image
- `currComicNav` - Current comic navigation instance
- `loadingSpinner` - Loading animation component

Settings:
- `backwardSearch` - Enable/disable backward page searching
- `useCustomLightbox` - Enable/disable custom lightbox
- `overwriteNavButtons` - Customize navigation button behavior
- `loadingSpinSpeed` - Control loading animation speed

### ComicNavigation

Handles comic navigation detection and management:

- Detects navigation links in submission descriptions
- Manages first, previous, and next page IDs
- Provides navigation helper methods

### AutoLoaderSearch

Base class for search functionality:

- `ForwardSearch` - Handles searching for next pages
- `BackwardSearch` - Handles searching for previous pages
- Implements smart search algorithms to find related comic pages