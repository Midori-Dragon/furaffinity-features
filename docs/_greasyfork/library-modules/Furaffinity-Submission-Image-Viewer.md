# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> Furaffinity Custom Image Viewer

Library for creating image elements on FurAffinity.

See documentation on [Furaffinity-Submission-Image-Viewer](https://midori-dragon.github.io/furaffinity-features/#/Furaffinity-Submission-Image-Viewer/README).

## How to use

- `@require` this script
  <br>

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
  ⠀
  faImageViewer.addEventListener("image-load", () => doSomething()); // alternative to onImageLoad
  faImageViewer.addEventListener("image-load-start", () => doSomething()); // alternative to onImageLoadStart
  faImageViewer.addEventListener("preview-image-load", () => doSomething()); // alternative to onPreviewImageLoad
  ```

## Feature Roadmap

| Feature                                 | Status      |
| --------------------------------------- | ----------- |
| Support preview image                   | ✅ Completed |
| Have different events for image loading | ✅ Completed |
| Zooming and panning via panzoom         | ✅ Completed |
