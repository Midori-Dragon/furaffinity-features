# Furaffinity Custom Image Viewer

Library for creating image elements on Furaffinity. Also see this Script on GreasyFork as [Furaffinity-Submission-Image-Viewer](https://greasyfork.org/scripts/492931-furaffinity-submission-image-viewer)

## How to use

- `@require` this script from GreasyFork or (in case of browser extension) import it as a module
- Create a new Custom Image Viewer:
  ```javascript
  const baseElem = document.createElement("div");
  const faImageViewer = new FAImageViewer(baseElem, imgSrc, prevSrc);
  faImageViewer.load(); // starts loading the image
  ```
- *Optional:* Subscribe to Events:
  ```javascript
  faImageViewer.onImageLoad(() => doSomething()); // occurs if the image is fully loaded
  faImageViewer.onImageLoadStart(() => doSomething()); // occurs if the image started loading
  faImageViewer.onPreviewImageLoad(() => doSomething()); // occurs if the preview image fully loaded

  faImageViewer.addEventListener("imageLoad", () => doSomething()); // alternative to onImageLoad
  faImageViewer.addEventListener("imageLoadStart", () => doSomething()); // alternative to onImageLoadStart
  faImageViewer.addEventListener("previewImageLoad", () => doSomething()); // alternative to onPreviewImageLoad
  ```

## Feature Roadmap

| Feature                                 | Status      |
| --------------------------------------- | ----------- |
| Support preview image                   | ✅ Completed |
| Have different events for image loading | ✅ Completed |

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
