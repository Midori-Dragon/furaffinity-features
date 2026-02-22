# greasyfork-releases

This branch is an auto-generated orphan branch. It is **not** meant for human use or contributions.

## Purpose

[GreasyFork](https://greasyfork.org) supports automatic script updates via a GitHub repository webhook. When a new version is published, GreasyFork can be pointed at a raw file URL on this branch to pull in the latest build.

Each `.user.js` file here is the compiled and bundled output of the corresponding userscript from the [main repository](../../tree/main).

## Contents

| File                                          | GreasyFork Script                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `FA-Embedded-Image-Viewer.user.js`            | [FA Embedded Image Viewer](https://greasyfork.org/scripts/458971)            |
| `FA-Infini-Gallery.user.js`                   | [FA Infini-Gallery](https://greasyfork.org/scripts/462632)                   |
| `FA-Instant-Nuker.user.js`                    | [FA Instant Nuker](https://greasyfork.org/scripts/527752)                    |
| `FA-Watches-Favorites-Viewer.user.js`         | [FA Watches Favorites Viewer](https://greasyfork.org/scripts/463464)         |
| `FA-Webcomic-Auto-Loader.user.js`             | [FA Webcomic Auto Loader](https://greasyfork.org/scripts/457759)             |
| `Furaffinity-Custom-Pages.user.js`            | [Furaffinity-Custom-Pages](https://greasyfork.org/scripts/476762)            |
| `Furaffinity-Custom-Settings.user.js`         | [Furaffinity-Custom-Settings](https://greasyfork.org/scripts/475041)         |
| `Furaffinity-Loading-Animations.user.js`      | [Furaffinity-Loading-Animations](https://greasyfork.org/scripts/485153)      |
| `Furaffinity-Match-List.user.js`              | [Furaffinity-Match-List](https://greasyfork.org/scripts/485827)              |
| `Furaffinity-Message-Box.user.js`             | [Furaffinity-Message-Box](https://greasyfork.org/scripts/528997)             |
| `Furaffinity-Prototype-Extensions.user.js`    | [Furaffinity-Prototype-Extensions](https://greasyfork.org/scripts/525666)    |
| `Furaffinity-Request-Helper.user.js`          | [Furaffinity-Request-Helper](https://greasyfork.org/scripts/483952)          |
| `Furaffinity-Submission-Image-Viewer.user.js` | [Furaffinity-Submission-Image-Viewer](https://greasyfork.org/scripts/492931) |

## How it works

On every [release](../../releases), a GitHub Actions workflow builds all userscript modules and pushes the resulting bundles to this branch. GreasyFork's webhook detects the push and updates each script automatically.

For source code, development, and issue tracking, see the [main branch](../../tree/main).
