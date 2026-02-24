# GlobalUtils

An internal library module providing shared utility classes and functions used across all other modules. GlobalUtils is not published to GreasyFork as a standalone script — it is bundled as a dependency within each module that uses it.

## Documentation

### Logger

A static class for level-based console logging.

- `static setLogLevel(logLevel)` - Sets the global log level
- `static logError(...args)` - Logs at error level
- `static logWarning(...args)` - Logs at warning level
- `static logInfo(...args)` - Logs at info level

---

### LogLevel

Enum defining the available log levels:

- `Error` = `1` - Only errors are logged
- `Warning` = `2` - Errors and warnings are logged
- `Info` = `3` - All messages are logged

---

### Semaphore

A class for controlling concurrency of async operations.

Properties:
- `maxConcurrency` - Maximum number of concurrent operations allowed
- `currentConcurrency` - Current number of running operations
- `waitingQueue` - Queue of pending operations

Functions:
- `acquire()` - Waits until a concurrency slot is available, then claims it. Returns a `Promise<void>`.
- `release()` - Releases a concurrency slot, allowing the next waiting operation to proceed.

---

### PakoWrapper

A static utility class for compressing and decompressing strings using the [pako](https://github.com/nodeca/pako) library. Used for storing large data sets (e.g., favorites lists) within browser storage limits.

- `static compress(input)` - Compresses a string and returns a base64-encoded compressed string
- `static decompress(compressed)` - Decompresses a base64-encoded string back to its original form
- `static splitByCompressedSize(items, maxBytes)` - Splits an array of items into base64-encoded compressed chunks, each within the specified byte limit

---

### string

A static utility class for common string null-checks.

- `static isNullOrWhitespace(str)` - Returns `true` if the string is `null`, `undefined`, or contains only whitespace
- `static isNullOrEmpty(str)` - Returns `true` if the string is `null`, `undefined`, or empty (`""`)

---

## Browser-API

Utilities for abstracting differences between userscript (`GM_info`) and browser extension environments.

### GMInfo

A static class for detecting and accessing the current script/extension environment.

- `static isBrowserEnvironment()` - Returns `true` if running as a browser extension (Chrome or Firefox)
- `static getBrowserAPI()` - Returns the appropriate API object (`GM_info`, `browser`, or `chrome`)
- `static get scriptName` - The name of the current script or extension
- `static get scriptVersion` - The version of the current script or extension
- `static get scriptDescription` - The description of the current script or extension (may be `undefined`)

---

### StorageWrapper

A static class that combines `localStorage` with `SyncedStorage` for persistent key-value storage. Falls back to `localStorage` when synced storage is unavailable.

- `static async setItemAsync(key, value, retry?)` - Saves a value to both local and synced storage. If `retry` is `true`, retries on failure until successful.
- `static async getItemAsync(key)` - Retrieves a value, preferring synced storage over local
- `static async removeItemAsync(key)` - Removes a value from both storages
- `static async getAllItemsAsync()` - Returns all key-value pairs from both storages merged

---

### SyncedStorage

A static class that wraps the browser extension `chrome.storage.sync` / `browser.storage.sync` API. Only available in browser extension environments — calls are silently ignored in userscript environments.

- `static async setItem(key, value)` - Sets a value in synced storage
- `static async getItem(key)` - Gets a value from synced storage
- `static async removeItem(key)` - Removes a value from synced storage
- `static async getAllItems()` - Returns all items from synced storage

---

## FA-Functions

Utility functions for interacting with FurAffinity DOM structures.

### checkTags(element)

Checks if an image element's `data-tags` attribute contains any blocked tags (from the user's FA blocklist) and sets its blocked/visible state accordingly.

### checkTagsAll(doc)

Runs `checkTags` on all `img[data-tags]` elements within the given `Document`.

### getWatchesFromPage(page)

Parses a watchlist page document and returns an array of watch elements (`HTMLElement[]`) from the flex watch list.

### isSubmissionPageInGallery(doc)

Returns `true` if the submission page's favorite-nav points to the user's gallery (not scraps).

### isSubmissionPageInScraps(doc)

Returns `true` if the submission page's favorite-nav points to the user's scraps.

---

## URL-Functions

Utility functions for working with FurAffinity URLs.

### extractParameter(url, parameterName)

Parses a URL string and returns the key-value pair for the given query parameter name, or `undefined` if not found. Returns `{ key: string, value: string }`.

### getCurrGalleryFolder()

Parses the current `window.location` URL and returns the current gallery folder ID as a number, or `undefined` if not on a folder page.
