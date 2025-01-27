# Furaffinity Features

A collection of enhanced features for FurAffinity that can be installed either as individual userscripts or as a complete browser extension (Chrome/Firefox).

## Overview

This project provides various quality-of-life improvements and additional features for FurAffinity. It's built with TypeScript and can be used in two ways:
- As individual userscripts (using Violentmonkey, Tampermonkey, etc.)
- As a browser extension (Chrome and Firefox)

## Architecture

The project follows a modular architecture:
- Each feature is a standalone module
- Modules are organized into categories (modules, components, utils)
- Global utilities are shared across modules
- Each module can be used independently as a userscript
- Modules can utilize features from other modules (with proper dependencies declared)

### Technical Stack
- TypeScript for type-safe development
- ESLint for code quality
- Webpack for building and bundling
- Support for both userscript and browser extension formats

## Modules and Features

### FA Embedded Image Viewer
Quick image preview functionality that embeds images directly in the current page.

**Current Features:**
- Inline image preview without leaving the current page
- Preview quality settings
- Close after opening option
- Works on galleries, favorites, search and browse pages

**Planned Features:**
- [ ] Copy image button for embedded viewer

### FA Infini Gallery
Infinite scrolling functionality for gallery pages.

**Current Features:**
- Automatic page loading while scrolling
- Customizable page separators
- Works on gallery, favorites, scraps, and search pages
- Loading animation integration

### FA Webcomic Auto Loader
Automatic loading of sequential comic pages.

**Current Features:**
- Auto-detection of comic navigation
- Automatic page loading
- Loading animations
- Navigation button customization

### Furaffinity Custom Settings
Central settings management system for all modules.

**Current Features:**
- Settings persistence
- Multiple setting types (boolean, number, text, action)
- Per-module settings management

**Planned Features:**
- [ ] New setting type combobox
- [ ] Settings import/export functionality

### Furaffinity Loading Animations
Provides loading animations for various async operations.

**Current Features:**
- Customizable loading spinners
- Speed control
- Multiple animation styles

### Furaffinity Match List
URL matching system for conditional feature activation.

**Current Features:**
- Pattern-based URL matching
- Support for multiple match patterns
- iframe support configuration

### Furaffinity Request Helper
Handles API requests and data fetching.

**Current Features:**
- API request wrapper for common requests
- Rate limiting
- Request queuing
- Error handling
- Cross-module request management

### Furaffinity Submission Image Viewer
Enhanced image viewing capabilities.

**Current Features:**
- Full-size image viewing
- Keyboard shortcuts
- Loading state management
- Zooming and panning functionality

### Watches Favorite Viewer Module (Planned)
Advanced system for monitoring and displaying favorites from watched users.

**Planned Features:**
- [ ] Scan favorites from watched users
- [ ] New favorites detection
- [ ] Favorites organization tools

### Global Utils Module
Shared utility functions and components used across other modules.

**Current Features:**
- Cross-module compatibility layer
- Common utility functions
- Browser extension integration helpers
- Logging and debugging utilities

## Installation

### As Userscripts
1. Install a userscript manager (Violentmonkey, Tampermonkey, etc.)
2. Select and install desired feature modules
3. Configure module settings as needed

### As Browser Extension
1. Install from Chrome Web Store / Firefox Add-ons (links coming soon)
2. Enable desired features
3. Configure extension settings

## Development

### Prerequisites
- Node.js
- npm/yarn

### Setup
```bash
npm install
```

### Building
```bash
npm run build:<module_name>
```

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.
