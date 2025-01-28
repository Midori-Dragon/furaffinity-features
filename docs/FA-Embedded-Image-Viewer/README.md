# FA Embedded Image Viewer

A userscript/browser extension that enhances image viewing on FurAffinity by providing an embedded image viewer. Also available on GreasyFork as [FA-Embedded-Image-Viewer](https://greasyfork.org/scripts/FA-Embedded-Image-Viewer).

## Features

- Embedded image viewer for submissions
- Preview quality settings
- Loading animations with customizable speed
- Option to close embed after opening in new tab
- Works in both watches and favorites sections

## How to use

- `@require` this script from GreasyFork or import it as a module (for browser extensions)
- Create an embedded image viewer:
  ```javascript
  const embeddedImage = new EmbeddedImage(figureElement);
  ```
- The viewer automatically handles:
  - Image loading and display
  - Loading animations
  - Quality settings
  - Opening in new tab functionality

## Feature Roadmap

| Feature                                     | Status      |
| ------------------------------------------ | ----------- |
| Embedded image viewer                       | Completed |
| Preview quality settings                    | Completed |
| Loading animations                          | Completed |
| New tab opening                            | Completed |
| Close embed after opening                   | Completed |

## Documentation

### EmbeddedImage

The EmbeddedImage class contains the following properties:

- `embeddedElem` - The main container element for the embedded viewer
- `submissionImg` - The image element showing the submission
- `imageLoaded` - Boolean indicating if the image has finished loading
- `loadingSpinner` - Loading animation component
- `previewLoadingSpinner` - Preview loading animation component

Events:
- `imageload` - Fired when the image has finished loading
- `remove` - Fired when the embedded viewer is removed

Settings:
- `previewQuality` - Controls the quality of the preview image
- `loadingSpinSpeed` - Controls the speed of the loading animation
- `closeEmbedAfterOpen` - Whether to close the embed after opening in new tab
- `openInNewTab` - Whether to open images in a new tab