# Furaffinity Features

A collection of enhanced features for FurAffinity that can be installed either as individual userscripts or as one browser extension (Chrome/Firefox).

Also find all mentioned Scripts on [GreasyFork](https://greasyfork.org/users/967324-midori-tsume) as individual userscripts.

#### Install Browser extension here:

<i class="fa-brands fa-chrome"></i>⠀[Chrome Web Store](https://chromewebstore.google.com/detail/furaffinity-features/dedddeinlepdkegmhnlggepfoeakikmc)

<i class="fa-brands fa-firefox-browser"></i>⠀[Firefox Add-ons](https://addons.mozilla.org/firefox/addon/furaffinity-features/)

<br>

| Table of Contents                      |
| -------------------------------------- |
| [1. Overview](#overview)               |
| [2. Feature Modules](#feature-modules) |
| [3. Library Modules](#library-modules) |
| [4. Installation](#installation)       |
| [5. Usage](#usage)                     |
| [6. Development](#development)         |
| [7. Contributing](#contributing)       |

## Overview

This project provides various quality-of-life improvements and additional features for Fur Affinity. It's built with TypeScript and can be used in two ways:
- As individual userscripts (using Violentmonkey, Tampermonkey, etc.)
- As a browser extension (Chrome and Firefox)

#### Feature Overview

✅ [FA Embedded Image Viewer](#fa-embedded-image-viewer)
  - Embedds the clicked image on the current page
  - Works on galleries, favorites, scraps, search and browse pages
  - Supports preview image
  - Supports opening, faving and downloading images

---

✅ [FA Infini Gallery](#fa-infini-gallery)
  - Infinite scrolling functionality for gallery pages.
  - Works on gallery, favorites, scraps, search and browse pages

---

✅ [FA Webcomic Auto Loader](#fa-webcomic-auto-loader)
  - Automatic loading of sequential comic pages.
  - Auto-detection of comic navigation
  - Searching for similar pages if navigation is not present
  - Navigation button overwrite

---

✅ [FA Instant Nuker](#fa-instant-nuker)
  - Instantly removes messages from the current page
  - Supports removing messages from different categories

---

✅ [FA Watches Favorites Viewer](#fa-watches-favorites-viewer)
  - Scan watches for new favorites
  - Custom favorites page to view favorites from watches
  - Ignore list management
  - Show favorite source (which watcher)
  - Duplicate favorites filtering

## Feature Modules

### FA Embedded Image Viewer
Quick image preview functionality that embeds images directly in the current page.

| Feature Roadmap                                        | Status      |
| ------------------------------------------------------ | ----------- |
| Inline image preview without leaving the current page  | ✅ Completed |
| Preview quality settings                               | ✅ Completed |
| Close after opening option                             | ✅ Completed |
| Works on galleries, favorites, search and browse pages | ✅ Completed |
| Copy image button for embedded viewer                  | ⬜ Planned   |

---

### FA Infini Gallery
Infinite scrolling functionality for gallery pages.

| Feature Roadmap                                       | Status      |
| ----------------------------------------------------- | ----------- |
| Automatic page loading while scrolling                | ✅ Completed |
| Customizable page separators                          | ✅ Completed |
| Works on gallery, favorites, scraps, and search pages | ✅ Completed |
| Loading animation integration                         | ✅ Completed |

---

### FA Webcomic Auto Loader
Automatic loading of sequential comic pages.

| Feature Roadmap                                          | Status      |
| -------------------------------------------------------- | ----------- |
| Auto-detection of comic navigation                       | ✅ Completed |
| Searching for similar pages if navigation is not present | ✅ Completed |
| Automatic page loading                                   | ✅ Completed |
| Loading animations                                       | ✅ Completed |
| Navigation button customization                          | ✅ Completed |

---

### FA Instant Nuker
Instantly removes messages from the current page.

| Feature Roadmap                           | Status      |
| ----------------------------------------- | ----------- |
| Remove messages instantly                 | ✅ Completed |
| Remove messages from different categories | ✅ Completed |

---

### FA Watches Favorites Viewer
Advanced system for monitoring and displaying favorites from watched users.

| Feature Roadmap                                                      | Status      |
| -------------------------------------------------------------------- | ----------- |
| Scan watches for new favorites                                       | ✅ Completed |
| Custom favorites page                                                | ✅ Completed |
| Ignore list management                                               | ✅ Completed |
| Show favorite source (which watcher)                                 | ✅ Completed |
| Duplicate favorites filtering                                        | ✅ Completed |
| Loading animations                                                   | ✅ Completed |
| Integration with [Embedded-Image-Viewer](./FA-Embedded-Image-Viewer) | ✅ Completed |

## Library Modules

### Furaffinity Custom Settings
Central settings management system for all modules.

| Feature Roadmap                                        | Status      |
| ------------------------------------------------------ | ----------- |
| Settings persistence                                   | ✅ Completed |
| Multiple setting types (boolean, number, text, action) | ✅ Completed |
| Per-module settings management                         | ✅ Completed |
| New setting type combobox                              | ✅ Completed |
| Import and Export Settings                             | ✅ Completed |

---

### Furaffinity Loading Animations
Provides loading animations for various async operations.

| Feature Roadmap               | Status      |
| ----------------------------- | ----------- |
| Customizable loading spinners | ✅ Completed |
| Speed control                 | ✅ Completed |
| Multiple animation styles     | ✅ Completed |

---

### Furaffinity Match List
URL matching system for conditional feature activation.

| Feature Roadmap                     | Status      |
| ----------------------------------- | ----------- |
| Pattern-based URL matching          | ✅ Completed |
| Support for multiple match patterns | ✅ Completed |
| iframe support configuration        | ✅ Completed |

---

### Furaffinity Request Helper
Handles API requests and data fetching.

| Feature Roadmap                         | Status      |
| --------------------------------------- | ----------- |
| API request wrapper for common requests | ✅ Completed |
| Rate limiting                           | ✅ Completed |
| Request queuing                         | ✅ Completed |
| Error handling                          | ✅ Completed |
| Cross-module request management         | ✅ Completed |

---

### Furaffinity Submission Image Viewer
Enhanced image viewing capabilities.

| Feature Roadmap                   | Status      |
| --------------------------------- | ----------- |
| Full-size image viewing           | ✅ Completed |
| Keyboard shortcuts                | ✅ Completed |
| Loading state management          | ✅ Completed |
| Zooming and panning functionality | ✅ Completed |

---

### Global Utils Module
Shared utility functions and components used across other modules.

| Feature Roadmap                       | Status      |
| ------------------------------------- | ----------- |
| Cross-module compatibility layer      | ✅ Completed |
| Common utility functions              | ✅ Completed |
| Browser extension integration helpers | ✅ Completed |
| Logging and debugging utilities       | ✅ Completed |

## Installation

### As Userscripts
1. Install a userscript manager (Violentmonkey, Tampermonkey, etc.)
2. Select and install desired feature modules from my [Greasy Fork](https://greasyfork.org/en/users/967324-midori-tsume) profile
3. Configure module settings as needed

### As Browser Extension
1. Install from [Chrome Web Store](https://chromewebstore.google.com/detail/furaffinity-features/dedddeinlepdkegmhnlggepfoeakikmc) / [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/furaffinity-features/)
2. Enable desired features
3. Configure extension settings

## Usage

By default all features are enabled. You can disable features by going to the Settings page and deactivating the desired features.

Settings can be found on Fur Affinity itself.
In the Settings dropdown menu there will be a new category `Extension Settings` with an option `FurAffinity Features`.

Here each Module can be configured separately.

> [!NOTE]
> When used as a Browser Extension the Settings will be synced if you're logged into your Browser.
> Otherwise the Settings will be saved locally.

## Development

### Architecture

The project follows a modular architecture:
- Each feature is a standalone module
- Modules are organized into categories (modules, components, utils)
- Global utilities are shared across modules
- Each module can be used independently as a userscript
- Modules can utilize features from other modules (with proper dependencies declared)

#### Technical Stack
- TypeScript for type-safe development
- ESLint for code quality
- Webpack for building and bundling
- Support for both userscript and browser extension formats

### Prerequisites
- Node.js
- npm/yarn

### Setup
```bash
git clone https://github.com/MidoriDragon/furaffinity-features.git
```
```bash
cd furaffinity-features
```

```bash
npm install
```

### Developing

Note that each module has its own webpack configuration. In this webpack config the `banner` for the user script is defined.

> [!IMPORTANT]
> The `banner` is used by the build process to determine the modules dependencies!

#### UserScript Context

When testing the Project as UserScript you can either manually copy the `bundle.user.js` file from the `dist` folder to the userscript manager or use the `npm run serve` command to host a local http server, where you can copy the link to the `bundle.user.js` file to use for the userscript manager. This method also allows the userscript manager to automatically update the userscript every time you build the project.

#### Browser Extension Context

When testing the Project as Browser Extension you can use the `npm run start:firefox` or `npm run start:chrome` command to start the browser extension. This will start the browser and load the extension from the `dist` folder.

> [!NOTE]
> UserScript Context is generally easier and faster to test. But Browser Extension Context is more restricted and may not work in all cases UserScript Context does.

#### Docs

Docs can be edited and then previewed by running `npm run docs`

#### Dependencies

Since dependencies are written in the banner of the webpack config, updating them can be annoying.
Using `npm run update-deps` will update all dependency versions in the banners.

> [!NOTE]
> Current Dependency Versions will be compared to the latest versions from [GreasyFork](https://greasyfork.org/en/users/967324-midori-tsume). This requires the Modules to be uploaded there and the banner to contain the require dependency as well as the homepageURL.

### Building

Building command names can be found in `package.json`

```bash
npm run build:<module_name>
```

Example:
```bash
npm run build:Browser-Extension-Deps
```

> [!NOTE]
> The `Deps` suffix indicates that the build will also include dependencies

### Packaging

If you are happy with your changes, you can package the module by running `npm run package:Browser-Extension` to package the browser extension or `npm run package:source` to package the source code.

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.

Please read [Contributing](./contributing) for more information.
