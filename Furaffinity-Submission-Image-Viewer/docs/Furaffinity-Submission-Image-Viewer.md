# Furaffinity Custom Image Viewer

Library for creating image elements on Furaffinity. Also see this Script on Github as [Furaffinity-Submission-Image-Viewer](https://github.com/Midori-Dragon/Furaffinity-Submission-Image-Viewer)

#### Table of Contents

- [Furaffinity Custom Image Viewer](#furaffinity-custom-image-viewer)
      - [Table of Contents](#table-of-contents)
  - [How to use](#how-to-use)
  - [Feature Roadmap](#feature-roadmap)
  - [Documentation](#documentation)
    - [CustomImageViewer](#customimageviewer)

## How to use

- `@require` this script
  <br/>
- Create a new Custom Image Viewer:
  ```javascript
  const baseElem = document.createElement("div");
  const faImageViewer = new FAImageViewer(baseElem, imgSrc, prevSrc);
  faImageViewer.load(); // starts loading the image
  ```
- _Optional:_ Subscribe to Events:
  ```javascript
  faImageViewer.onImageLoad(() => doSomething()); // occurs if the image is fully loaded
  faImageViewer.onImageLoadStart(() => doSomething()); // occurs if the image started loading
  faImageViewer.onPreviewImageLoad(() => doSomething()); // occurs if the preview image fully loaded

  faImageViewer.addEventListener("imageLoad", () => doSomething()); // alternative to onImageLoad
  faImageViewer.addEventListener("imageLoadStart", () => doSomething()); // alternative to onImageLoadStart
  faImageViewer.addEventListener("previewImageLoad", () => doSomething()); // alternative to onPreviewImageLoad
  ```

## Feature Roadmap

- [x] Support preview image
- [x] Have different events for image loading

## Documentation

### CustomImageViewer

The CustomImageViewer class contains following Properties:
- `imageUrl` - the image url
- `previewUrl` - the preview image url
- `parentContainer` - the parent container on which the image will be created
- `faImage` - the image element
- `faImagePreview` - the preview image element
- `onImageLoad` - the callback for when the image is fully loaded
- `onImageLoadStart` - the callback for when the image starts loading
- `onPreviewImageLoad` - the callback for when the preview image is fully loaded

Functions:
- `load()` - starts loading the image
- `reset()` - resets the image
