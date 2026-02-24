# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> FA Infini Gallery

A userscript/browser extension that enhances FurAffinity gallery browsing by automatically loading the next page when scrolling to the bottom.

See documentation on [FA-Infini-Gallery](https://midori-dragon.github.io/furaffinity-features/#/FA-Infini-Gallery/README).

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- The gallery will automatically:
  - Detect when you reach the bottom of the page
  - Load and append the next page's content
  - Resume scroll detection for continuous loading

<img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/screenshot-furaffinity-features-ig.png" width="100%">

## Feature Roadmap

| Feature                                                                                                  | Status      |
| -------------------------------------------------------------------------------------------------------- | ----------- |
| Automatic page loading                                                                                   | ✅ Completed |
| Scroll detection                                                                                         | ✅ Completed |
| Gallery management                                                                                       | ✅ Completed |
| Support for all gallery types                                                                            | ✅ Completed |
| Support for watches pages                                                                                | ✅ Completed |
| Custom Settings                                                                                          | ✅ Completed |
| Integration with [Embedded-Image-Viewer](https://greasyfork.org/scripts/458971-fa-embedded-image-viewer) | ✅ Completed |

## Settings

- `showPageSeparator` - Whether to show a page separator between pages *(default is `true`)*
- `pageSeparatorText` - The text to use for the page separator *(default is `Infini-Gallery Page: %page%`)*
