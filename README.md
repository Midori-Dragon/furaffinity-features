# Furaffinity Features

A collection of enhanced features for FurAffinity that can be installed either as individual userscripts or as one browser extension (Chrome/Firefox).

#### Table of Contents

- [Overview](#overview)
- [Feature Modules](#feature-modules)
- [Library Modules](#library-modules)
- [Usage](#usage)
- [Development](#development)
- [Contributing](#contributing)

## Overview

This project provides various quality-of-life improvements and additional features for Fur Affinity. It's built with TypeScript and can be used in two ways:
- As individual userscripts (using Violentmonkey, Tampermonkey, etc.)
- As a browser extension (Chrome and Firefox)

#### Feature Overview

- [x] [FA Embedded Image Viewer](#fa-embedded-image-viewer)
  - Embedds the clicked image on the current page
  - Works on galleries, favorites, scraps, search and browse pages
  - Supports preview image
  - Supports opening, faving and downloading images
- [x] [FA Infini Gallery](#fa-infini-gallery)
  - Infinite scrolling functionality for gallery pages.
  - Works on gallery, favorites, scraps, search and browse pages
- [x] [FA Webcomic Auto Loader](#fa-webcomic-auto-loader)
  - Automatic loading of sequential comic pages.
  - Auto-detection of comic navigation
  - Searching for similar pages if navigation is not present
  - Navigation button overwrite
- [ ] [FA Watches Favorite Viewer](#fa-watches-favorite-viewer) (Planned)
  - Monitoring favorites of watched users
  - Viewing favorites of watched users  

## Feature Modules

### FA Embedded Image Viewer
Quick image preview functionality that embeds images directly in the current page.

**Current Features:**
- [x] Inline image preview without leaving the current page
- [x] Preview quality settings
- [x] Close after opening option
- [x] Works on galleries, favorites, search and browse pages

**Planned Features:**
- [ ] Copy image button for embedded viewer

### FA Infini Gallery
Infinite scrolling functionality for gallery pages.

**Current Features:**
- [x] Automatic page loading while scrolling
- [x] Customizable page separators
- [x] Works on gallery, favorites, scraps, and search pages
- [x] Loading animation integration

### FA Webcomic Auto Loader
Automatic loading of sequential comic pages.

**Current Features:**
- [x] Auto-detection of comic navigation
- [x] Searching for similar pages if navigation is not present
- [x] Automatic page loading
- [x] Loading animations
- [x] Navigation button customization

### FA Watches Favorite Viewer (Planned)
Advanced system for monitoring and displaying favorites from watched users.

**Planned Features:**
- [ ] Scan favorites from watched users
- [ ] New favorites detection
- [ ] Favorites organization tools

## Library Modules

### Furaffinity Custom Settings
Central settings management system for all modules.

**Current Features:**
- [x] Settings persistence
- [x] Multiple setting types (boolean, number, text, action)
- [x] Per-module settings management

**Planned Features:**
- [ ] New setting type combobox
- [ ] Settings import/export functionality

### Furaffinity Loading Animations
Provides loading animations for various async operations.

**Current Features:**
- [x] Customizable loading spinners
- [x] Speed control
- [x] Multiple animation styles

### Furaffinity Match List
URL matching system for conditional feature activation.

**Current Features:**
- [x] Pattern-based URL matching
- [x] Support for multiple match patterns
- [x] iframe support configuration

### Furaffinity Request Helper
Handles API requests and data fetching.

**Current Features:**
- [x] API request wrapper for common requests
- [x] Rate limiting
- [x] Request queuing
- [x] Error handling
- [x] Cross-module request management

### Furaffinity Submission Image Viewer
Enhanced image viewing capabilities.

**Current Features:**
- [x] Full-size image viewing
- [x] Keyboard shortcuts
- [x] Loading state management
- [x] Zooming and panning functionality

### Global Utils Module
Shared utility functions and components used across other modules.

**Current Features:**
- [x] Cross-module compatibility layer
- [x] Common utility functions
- [x] Browser extension integration helpers
- [x] Logging and debugging utilities

## Installation

### As Userscripts
1. Install a userscript manager (Violentmonkey, Tampermonkey, etc.)
2. Select and install desired feature modules from my [Greasy Fork](https://greasyfork.org/en/users/967324-midori-tsume) profile
3. Configure module settings as needed

### As Browser Extension
1. Install from Chrome Web Store / Firefox Add-ons (links coming soon)
2. Enable desired features
3. Configure extension settings

## Usage

By default all features are enabled. Disabling features is currently not supported, but will be added in the future.

Settings can be found on Fur Affinity itself.
In the Settings dropdown menu there will be a new category `Extension Settings` with an option `FurAffinity Features`.

Here each Module can be configured separately.

*Note: In Browser Extension mode the Settings will be synced if you're logged into the Browser.*

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

**Important: The `banner` is used by the build process to determine the modules dependencies!**

### Building

Building command names can be found in `package.json`

```bash
npm run build:<module_name>
```

Example:
```bash
npm run build:Browser-Extension-Deps
```

*Note: `-Deps` suffix indicates that the build will also include dependencies*

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.
