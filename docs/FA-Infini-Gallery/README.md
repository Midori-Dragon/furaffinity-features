# FA Infini Gallery

A userscript/browser extension that enhances FurAffinity gallery browsing by automatically loading the next page when scrolling to the bottom. Also available on GreasyFork as [FA-Infini-Gallery](https://greasyfork.org/scripts/462632-fa-infini-gallery).

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- The gallery will automatically:
  - Detect when you reach the bottom of the page
  - Load and append the next page's content
  - Resume scroll detection for continuous loading

## Feature Roadmap

| Feature                                                                      | Status      |
| ---------------------------------------------------------------------------- | ----------- |
| Automatic page loading                                                       | ✅ Completed |
| Scroll detection                                                             | ✅ Completed |
| Gallery management                                                           | ✅ Completed |
| Support for all gallery types                                                | ✅ Completed |
| Support for watches pages                                                    | ✅ Completed |
| Custom Settings                                                              | ✅ Completed |
| Integration with [Embedded-Image-Viewer](../FA-Embedded-Image-Viewer/README) | ✅ Completed |

## Settings
- `showPageSeparator` - Whether to show a page separator between pages *(default is `true`)*
- `pageSeparatorText` - The text to use for the page separator *(default is `Infini-Gallery Page: %page%`)*

## Documentation

### InfiniGallery

The InfiniGallery class contains the following properties:

- `scanElem` - The element used to detect when to load the next page *(default is: `footer`)*
- `galleryManager` - Manages the gallery content and loading

---

Methods:
- `startScrollDetection()` - Starts monitoring for scroll position
- `stopScrollDetection()` - Stops scroll detection
- `async loadNextPage()` - Loads and appends the next gallery page
