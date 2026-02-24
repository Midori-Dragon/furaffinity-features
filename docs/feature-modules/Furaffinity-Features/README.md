# Furaffinity Features

The combined bundle that brings together all feature and library modules. Available as a GreasyFork userscript and as a browser extension for Chrome and Firefox.

## How to use as Browser Extension

The browser extension bundles all feature and library modules into a single self-contained script at build time, without relying on `@require`.

Install the browser extension directly from the store:

- [Chrome Web Store](https://chromewebstore.google.com/detail/furaffinity-features/dedddeinlepdkegmhnlggepfoeakikmc)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/furaffinity-features/)

All features and libraries are included automatically — no further setup is required.

## How to use as UserScript

The main GreasyFork script that loads all feature and library modules into a single userscript via `@require` directives. Also available on GreasyFork as [Furaffinity-Features](https://greasyfork.org/en/users/967324-midori-tsume).

- Install via GreasyFork or a userscript manager (e.g. Violentmonkey, Tampermonkey)
- All feature modules and their library dependencies are loaded automatically via `@require` directives in the script header
- No further setup is required — each feature activates based on the current FurAffinity page

## Included Feature Modules

| Module                                                               | Description                                      |
| -------------------------------------------------------------------- | ------------------------------------------------ |
| [FA Embedded Image Viewer](../FA-Embedded-Image-Viewer/README)       | Embeds submission images inline on gallery pages |
| [FA Infini-Gallery](../FA-Infini-Gallery/README)                     | Automatically loads next gallery pages on scroll |
| [FA Instant Nuker](../FA-Instant-Nuker/README)                       | Instantly nukes messages without confirmation    |
| [FA Watches Favorites Viewer](../FA-Watches-Favorites-Viewer/README) | Scans and displays favorites from watched users  |
| [FA Webcomic Auto-Loader](../FA-Webcomic-Auto-Loader/README)         | Auto-loads sequential comic pages                |

## Included Library Modules

| Module                                                                               | Description                                  |
| ------------------------------------------------------------------------------------ | -------------------------------------------- |
| [Furaffinity Prototype Extensions](../Furaffinity-Prototype-Extensions/README)       | Prototype extensions for String and Node     |
| [Furaffinity Request Helper](../Furaffinity-Request-Helper/README)                   | Wrapper for FurAffinity HTTP requests        |
| [Furaffinity Submission Image Viewer](../Furaffinity-Submission-Image-Viewer/README) | Custom image viewer component                |
| [Furaffinity Match List](../Furaffinity-Match-List/README)                           | URL-based script activation matching         |
| [Furaffinity Message Box](../Furaffinity-Message-Box/README)                         | Custom styled message dialogs                |
| [Furaffinity Loading Animations](../Furaffinity-Loading-Animations/README)           | Loading spinner and animation components     |
| [Furaffinity Custom Pages](../Furaffinity-Custom-Pages/README)                       | Custom page routing via URL parameters       |
| [Furaffinity Custom Settings](../Furaffinity-Custom-Settings/README)                 | Settings UI integrated into FA settings page |

## Notes

- The UserScript acts only as the banner/header — actual code is delivered via `@require`, loading each module as a separate script
- The Browser Extension imports all modules directly at build time, producing a single bundled script
- Individual modules can also be used standalone via GreasyFork
