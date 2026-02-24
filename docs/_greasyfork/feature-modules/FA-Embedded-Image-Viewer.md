# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> FA Embedded Image Viewer

A userscript/browser extension that enhances image viewing on FurAffinity by providing an embedded image viewer. When any submission is clicked, instead of opening the page this script will embedd the clicked image on the current site.

See documentation on [FA-Embedded-Image-Viewer](https://midori-dragon.github.io/furaffinity-features/#/FA-Embedded-Image-Viewer/README).

<img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/screenshot-furaffinity-features-eiv.png" width="100%">

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- The viewer automatically handles:
  - Image loading and display
  - Loading animations
  - Quality settings
  - various buttons and options on the embedded page
- To use just click on any submission and it will be embedded on the current page

## Feature Roadmap

| Feature                  | Status      |
| ------------------------ | ----------- |
| Embedded image viewer    | ✅ Completed |
| Preview quality settings | ✅ Completed |
| Loading animations       | ✅ Completed |
| New tab opening          | ✅ Completed |
| Download functionality   | ✅ Completed |
| Zooming and panning      | ✅ Completed |

## Settings

- `openInNewTab` - Whether to open images in a new tab *(default is `true`)*
- `loadingSpinSpeedFav` - Controls the speed of the favorite loading animation *(default is `600`)*
- `loadingSpinSpeed` - Controls the speed of the loading animation *(default is `1000`)*
- `closeEmbedAfterOpen` - Whether to close the embed after opening in new tab *(default is `true`)*
- `previewQuality` - Controls the quality of the preview image *(default is `400`)*
- `showWatchingInfo` - Controls whether to show if the user is watching the Submissions Author *(default is `false`)*
