# FA Infini Gallery

A userscript/browser extension that enhances FurAffinity gallery browsing by automatically loading the next page when scrolling to the bottom. Also available on GreasyFork as [FA-Infini-Gallery](https://greasyfork.org/scripts/FA-Infini-Gallery).

## Features

- Automatic loading of next gallery pages when scrolling
- Seamless integration with FurAffinity's gallery layout
- Supports all gallery types (user galleries, favorites, browse pages)
- Smart scroll detection to prevent unnecessary loads

## How to use

- `@require` this script from GreasyFork or import it as a module (for browser extensions)
- Create an infinite gallery instance:
  ```javascript
  const infiniGallery = new InfiniGallery();
  infiniGallery.startScrollDetection();
  ```
- The gallery will automatically:
  - Detect when you reach the bottom of the page
  - Load and append the next page's content
  - Resume scroll detection for continuous loading

## Feature Roadmap

| Feature                                     | Status      |
| ------------------------------------------ | ----------- |
| Automatic page loading                      | ✅ Completed |
| Scroll detection                            | ✅ Completed |
| Gallery management                          | ✅ Completed |
| Support for all gallery types               | ✅ Completed |

## Documentation

### InfiniGallery

The InfiniGallery class contains the following properties:

- `scanElem` - The element used to detect when to load the next page
- `galleryManager` - Manages the gallery content and loading
- `scanInterval` - Internal timer for scroll detection

Methods:
- `startScrollDetection()` - Starts monitoring for scroll position
- `stopScrollDetection()` - Stops scroll detection
- `loadNextPage()` - Loads and appends the next gallery page

### GalleryManager

Handles the actual loading and management of gallery content:

- Manages page loading and content insertion
- Handles pagination and URL management
- Ensures proper content formatting and layout