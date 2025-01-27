# Furaffinity Loading Animations

Library for creating different loading animations on Furaffinity. Also see this Script on Greasy Fork as [Furaffinity-Loading-Animations](https://greasyfork.org/de/scripts/485153-furaffinity-loading-animations)

#### Table of Contents

- [How to use](#how-to-use)
- [Feature Roadmap](#feature-roadmap)
- [Simplified Documentation](#documentation)

## How to use

- `@require` this script with the following url "https://raw.githubusercontent.com/Midori-Dragon/Furaffinity-Loading-Animations/main/Furaffinity-Loading-Animations.js"
  <br>
- Create a new Loading Animation:
  ```javascript
  const baseElem = document.getElementById('spinner-container');
  const spinner = new FALoadingSpinner(baseElem); //always give the baseElem as parameter
  spinner.visible = true;

  const textSpinner = new FALoadingTextSpinner(baseElem);
  const imageSpinner = new FALoadingImage(baseElem);
  const barSpinner = new FALoadingBar(baseElem);
  ```
  See [FALoadingSpinner](#faloadingspinner) for more info
  <br>
- _Optional:_ Change Settings:
  ```javascript
  spinner.forecolorHex = "#FF0000";
  spinner.spinnerThickness = 6;
  ```

## Feature Roadmap

- [x] Have basic Options for all Loading Animations
  - [x] Change Speed
  - [x] Change Visibility
  - [x] Change Size
- [x] Have different Types of Animations
  - [x] Text Spinner
    - [x] Change Text
    - [x] Change Font Size
  - [x] Loading Spinner
    - [x] Change Color
    - [x] Change Thickness
    - [x] Change Animation
  - [x] Image Animation
    - [x] Change Image
    - [x] Change Animation
  - [x] Loading Bar
    - [x] Change Color
    - [x] Change Text 
  - [ ] Progress Bar

## Documentation

### FALoadingSpinner

The FALoadingSpinner class contains following Properties:

- `delay` - The time in Milliseconds which each full rotation takes. `default: 1000`
- `size` - The size of the Spinner. `default: 60`
- `spinnerThickness` - The thickness of the Spinner. `default: 4`
- `spinnerLength` - The length of the Spinner. `default: 1` _(Can only be set in quarters. 1 = 25%, 2 = 50% ...)_
- `linearSpin` - Whether the Spinner spins linearly. `default: false`
- `forecolorHex` - The Forecolor of the Spinner in Hex. `default: #8941de`
- `backcolorHex` - The Backcolor of the Spinner in Hex. `default: #f3f3f3`
- `visible` - Whether the Spinner is visible. `default: false`
- `animationCurve` - The Animation Curve of the Spinner. `default: "cubic-bezier(.53,.24,.46,.83)"` _(For example: "ease-in-out")_
- `baseElem` - The Base Element in which the SpinnerContainer Element is located.

It has following functions:

- `dispose()` - Disposes the FALoadingSpinner by removing it from the `baseElem`.

### FALoadingTextSpinner

The FALoadingTextSpinner class contains following Properties:

- `delay` - The time in Milliseconds which each full rotation takes. `default: 600`
- `characters` - The characters that make up the Text rotation as an array. `default: ['◜', '◠', '◝', '◞', '◡', '◟']`
- `visible` - Whether the Spinner is visible. `default: false`
- `fontSize` - The Font Size of the Spinner Text. `default: 15`
- `baseElem` - The Base Element in which the Spinner Element is located.

It has following functions:

- `dispose()` - Disposes the FALoadingSpinner by removing it from the `baseElem`.

### FALoadingImage

The FALoadingImage class contains following Properties:

- `delay` - The delay in Milliseconds after each animation step. `default: 100`
- `size` - The size of the Image. `default: 60`
- `doScaleImage` - Whether the Image should be scaled up and down during the animation. `default: true`
- `scaleChange` - The amount of Scale in percent the Image should be changed with each animation step. `default: 0.05`
- `scaleChangeMax` - Maximum Scale of the Image in percent. `default: 1.2`
- `scaleChangeMin` - Minimum Scale of the Image in percent. `default: 0.8`
- `doRotateImage` - Whether the Image should be rotated during the animation. `default: true`
- `rotateDegrees` - The amount of Degrees the Image should be rotated with each animation step. `default: 5`
- `imageSrc` - The Source Url of the Image. `default: 'https://www.furaffinity.net/themes/beta/img/banners/fa_logo.png'`
- `isGrowing` - Whether the Image is currently growing or shrinking. Changes when animating. `default: true` _(only get)_
- `scale` - The current Scale of the Image in percent. Changes when animating. `default: 1`
- `rotation` - The current Rotation of the Image in Degrees. Changes when animating. `default: 0`
- `visible` - Whether the Spinner is visible. `default: false`
- `baseElem` - The Base Element in which the ImageContainer Element is located.

It has following functions:

- `dispose()` - Disposes the FALoadingSpinner by removing it from the `baseElem`.

### FALoadingBar

The FALoadingBar class contains following Properties:

- `delay` - The time in Milliseconds which each full animation loop takes. `default: 600`
- `text` - The Text that will be displayed on the Bar.
- `height` - The Height of the LoadingBar. `default: 60`
- `visible` - Whether the LoadingBar is visible. `default: false`
- `fontSize` - The Font Size of the LoadingBar Text. `default: 15`
- `cornerRadius` - The Corner Radius of the LoadingBar. `default: 0`
- `gradient` - The Gradient of the LoadingBar. `default: 'repeating-linear-gradient(to right, ... 100%)'`
- `baseElem` - The Base Element in which the LoadingBar Element is located.

It has following functions:

- `dispose()` - Disposes the FALoadingSpinner by removing it from the `baseElem`.
