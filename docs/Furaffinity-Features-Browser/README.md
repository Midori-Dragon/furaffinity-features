# Furaffinity Features Browser

The browser extension entry point that bundles all feature and library modules into a single self-contained script for the Chrome and Firefox extension. Unlike the GreasyFork [Furaffinity Features](../Furaffinity-Features/README) userscript (which uses `@require` to load each module separately), this module imports and compiles everything together at build time.

## How to use

Install the browser extension directly from the store:

- [Chrome Web Store](https://chromewebstore.google.com/detail/furaffinity-features/dedddeinlepdkegmhnlggepfoeakikmc)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/furaffinity-features/)

All features and libraries are included automatically — no further setup is required.

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

- This module is the compiled browser extension bundle — it is not published to GreasyFork
- All modules are imported directly via TypeScript at build time, producing a single bundled script
- For the userscript equivalent (using `@require`), see [Furaffinity Features](../Furaffinity-Features/README)
