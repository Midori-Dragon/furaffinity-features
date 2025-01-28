# FA Embedded Image Viewer

A userscript/browser extension that enhances image viewing on FurAffinity by providing an embedded image viewer. When any submission is clicked, instead of opening the page this script will embedd the clicked image on the current site. Also available on GreasyFork as [FA-Embedded-Image-Viewer](https://greasyfork.org/scripts/458971-fa-embedded-image-viewer).

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- The viewer automatically handles:
  - Image loading and display
  - Loading animations
  - Quality settings
  - various buttons and options on the embedded page

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
- `previewQuality` - Controls the quality of the preview image *(default is `3`)*

## Documentation

### EmbeddedImage

The EmbeddedImage class contains the following properties:

- `embeddedElem` - The main container element for the embedded viewer
- `submissionImg` - The image element showing the submission
- `favRequestRunning` - Boolean indicating if a favorite request is running
- `downloadRequestRunning` - Boolean indicating if a download request is running

- `static embeddedExists` - Boolean indicating if an embedded viewer is opened on the page

---

Events:
- `remove` - Fired when the embedded viewer is removed
