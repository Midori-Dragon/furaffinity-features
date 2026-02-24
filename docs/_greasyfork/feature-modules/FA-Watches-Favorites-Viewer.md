# <img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/icons/logo.png" height="30"> FA Watches Favorites Viewer

A userscript/browser extension that adds a new function to scan for favorites of your watched users and display them in a new page.

See documentation on [FA-Watches-Favorites-Viewer](https://midori-dragon.github.io/furaffinity-features/#/FA-Watches-Favorites-Viewer/README).

<img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/screenshot-furaffinity-features-wfv-1.png" width="100%">
<img src="https://raw.githubusercontent.com/Midori-Dragon/furaffinity-features/refs/heads/main/assets/screenshot-furaffinity-features-wfv-2.png" width="100%">

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- Automatically adds a new "WF Scan" button to the top menu bar (where new submissions and messages are)
  - When clicked, the script will scan all your watchers for new favorites
  - When the scan is done, a new "WF" message will be added to the message bar showing the number of new favorites
  - When clicked, the script will show the new favorites in a new page
- To view the results of the last scan a new Option "Watches Favorites" is shown in the "Manage My Content" FA Section

## Feature Roadmap

| Feature                                                                                                  | Status      |
| -------------------------------------------------------------------------------------------------------- | ----------- |
| Scan watches for new favorites                                                                           | ✅ Completed |
| Custom favorites page                                                                                    | ✅ Completed |
| Ignore list management                                                                                   | ✅ Completed |
| Show favorite source (which watcher)                                                                     | ✅ Completed |
| Duplicate favorites filtering                                                                            | ✅ Completed |
| Loading animations                                                                                       | ✅ Completed |
| Integration with [Embedded-Image-Viewer](https://greasyfork.org/scripts/458971-fa-embedded-image-viewer) | ✅ Completed |

## Settings

- `Max Favs Amount` - Maximum number of favorites loaded per watch *(default is `100`)*
- `Show Dublicate Favs` - Whether to show duplicate submissions when multiple people faved the same submission *(default is `false`)*
- `Show Fav From Watcher` - Whether to show which watcher faved each submission *(default is `true`)*
- `Loading Animation Speed` - Duration of the loading animation in milliseconds *(default is `1000`)*
- `Max Amount of Scanned Pages per Watcher` - Maximum number of pages scanned per watcher *(default is `4`)*
- `Show Detailed MadeByText` - Whether to show "Made By" and "Faved by" instead of "By" and "From" text *(default is `true`)*
- `Reset Last Seen Favs` - Action button to reset the last seen favorites to reinitialize the scanner
- `Show Ignore List` - Action button to open the ignore list in a new tab
- `Show Last Favs` - Action button to open the last watches favorites in a new tab
