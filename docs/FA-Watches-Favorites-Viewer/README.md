# FA Watches Favorites Viewer

A userscript/browser extension that adds a new function to scan for favorites of your watched users and display them in a new page. Also available on GreasyFork as [FA-Watches-Favorites-Viewer](https://greasyfork.org/scripts/463464-fa-watches-favorites-viewer).

## How to use

- Load this script from GreasyFork or use it inside the browser extensions
- Automatically adds a new "WF Scan" button to the top menu bar (where new submissions and messages are)
  - When clicked, the script will scan all your watchers for new favorites
  - When the scan is done, a new "WF" message will be added to the message bar showing the number of new favorites
  - When clicked, the script will show the new favorites in a new page
- To view the results of the last scan a new Option "Watches Favorites" is shown in the "Manage My Content" FA Section

## Feature Roadmap

| Feature                                                                      | Status      |
| ---------------------------------------------------------------------------- | ----------- |
| Scan watches for new favorites                                               | ✅ Completed |
| Custom favorites page                                                        | ✅ Completed |
| Ignore list management                                                       | ✅ Completed |
| Show favorite source (which watcher)                                         | ✅ Completed |
| Duplicate favorites filtering                                                | ✅ Completed |
| Loading animations                                                           | ✅ Completed |
| Integration with [Embedded-Image-Viewer](../FA-Embedded-Image-Viewer/README) | ✅ Completed |

## Settings

- `Max Favs Amount` - Maximum number of favorites loaded per watch *(default is `100`)*
- `Show Dublicate Favs` - Whether to show duplicate submissions when multiple people faved the same submission *(default is `true`)*
- `Show Fav From Watcher` - Whether to show which watcher faved each submission *(default is `true`)*
- `Loading Animation Speed` - Duration of the loading animation in milliseconds *(default is `1000`)*
- `Reset Last Seen Favs` - Action button to reset the last seen favorites to reinitialize the scanner
- `Show Ignore List` - Action button to open the ignore list in a new tab
- `Show Last Favs` - Action button to open the last watches favorites in a new tab

## Documentation

### WatchScanButton

The main button component that initiates the scanning process:

- Adds a "WF Scan" button to the FurAffinity menu bar
- Handles the scanning process for all watches' favorites
- Updates the notification count when new favorites are found

---

### WatchesFavoritesPage

Custom page component that displays the favorites from watches:

- Displays favorites in a gallery format similar to FurAffinity's submission pages
- Supports filtering and organization options
- Shows which watcher faved each submission (optional)

---

### BuddyListManager

Component for managing the ignore list:

- Allows users to add/remove users from the ignore list
- Provides a custom interface for ignore list management
- Integrates with FurAffinity's buddy list system

---

### FavsScanner

Core module for scanning favorites:

- Retrieves favorites from each watch
- Compares with previously seen favorites to identify new ones
- Handles pagination and request throttling
- Manages the scanning process efficiently
