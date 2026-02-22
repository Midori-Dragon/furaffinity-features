## Search Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.SearchRequests.Browse;
```

## Class Properties

- `Browse` - Class that holds all Browse page associated Requests
- `Search` - Class that holds all Search page associated Requests

Example on how to call the `getPage()` function on Browse (without an action):

```javascript
await requestHelper.UserRequests.SearchRequests.Browse.getPage(1);
```

## Specific Search Request Functions

#### Both Properties of the **SearchRequests** (`Browse`, `Search`) share the same set of instance functions. They differ only in their options parameter (`BrowseOptions` vs `SearchOptions`).

- `async getPage(pageNumber, options, action, delay = 100)` - Returns the Browse / Search page for the given page number
  - *`pageNumber` - Specifies the number of the page you want to get*
  - *`options` - Optional `BrowseOptions` / `SearchOptions` object to filter results*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`*
  <br><br>
- `async getFigures(pageNumber, options, action, delay = 100)` - Returns the figures on the given Browse / Search page as an array
  - *`pageNumber` - Specifies the number of the page for which you want to get the figures*
  - *`options` - Optional `BrowseOptions` / `SearchOptions` object to filter results*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`*

  ---

- `async getFiguresBetweenPages(fromPageNumber, toPageNumber, options, action, delay = 100)` - Returns an array of arrays of figures for each page between the two specified pages
  - *`fromPageNumber` - Specifies the page number to start from*
  - *`toPageNumber` - Specifies the page number to end at*
  - *`options` - Optional `BrowseOptions` / `SearchOptions` object to filter results*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`*

  ---

- `async getFiguresBetweenIds(fromId, toId, options, action, delay = 100)` - Returns an array of arrays of figures between the two specified submission IDs
  - *`fromId` - Specifies the submission ID to start from (omit or set to `0` / `null` to start from the beginning)*
  - *`toId` - Specifies the submission ID to end at (omit or set to `0` / `null` to go to the end)*
  - *`options` - Optional `BrowseOptions` / `SearchOptions` object to filter results*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`*
  <br><br>
- `async getFiguresBetweenIdsBetweenPages(fromId, toId, fromPageNumber, toPageNumber, options, action, delay = 100)` - Returns an array of arrays of figures between the two specified submission IDs, constrained to the given page range
  - *`fromId` - Specifies the submission ID to start from*
  - *`toId` - Specifies the submission ID to end at*
  - *`fromPageNumber` - Specifies the page number to start from*
  - *`toPageNumber` - Specifies the page number to end at*
  - *`options` - Optional `BrowseOptions` / `SearchOptions` object to filter results*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`*

## Specific Static Class Properties

Both `Browse` and `Search` have the following static properties:

- `static hardLink` - The base URL for the page type. Default is **FA Domain** + `"/browse/"` or `"/search/"`
- `static newBrowseOptions` / `static newSearchOptions` - Returns a new `BrowseOptions` / `SearchOptions` instance with default values
- `static BrowseOptions` / `static SearchOptions` - Returns the `BrowseOptions` / `SearchOptions` class constructor

---

## BrowseOptions

Used to filter results when calling `Browse` functions. Create an instance via `requestHelper.UserRequests.SearchRequests.Browse.newBrowseOptions`.

### Instance Properties

- `category` - Category filter. Default is `BrowseOptions.category['all']`
- `type` - Type filter. Default is `BrowseOptions.type['all']`
- `species` - Species filter. Default is `BrowseOptions.species['any']`
- `gender` - Gender filter. Default is `BrowseOptions.gender['any']`
- `perPage` - Number of results per page. Default is `BrowseOptions.results['72']`
- `ratingGeneral` - Include general-rated content. Default is `true`
- `ratingMature` - Include mature-rated content. Default is `true`
- `ratingAdult` - Include adult-rated content. Default is `true`

### Static Option Getters

- `static category` - Available category values (e.g. `'all'`, `'artwork-digital'`, `'story'`, etc.)
- `static type` - Available type values
- `static species` - Available species values
- `static gender` - Available gender values
- `static results` - Available per-page count values

---

## SearchOptions

Used to filter results when calling `Search` functions. Create an instance via `requestHelper.UserRequests.SearchRequests.Search.newSearchOptions`.

### Instance Properties

- `input` - Search query string. Default is `''`
- `perPage` - Number of results per page. Default is `72`
- `orderBy` - Sort order. Default is `SearchOptions.orderBy['relevancy']`
- `orderDirection` - Sort direction. Default is `SearchOptions.orderDirection['descending']`
- `category` - Category filter (uses `BrowseOptions.category`). Default is `'all'`
- `type` - Type filter (uses `BrowseOptions.type`). Default is `'all'`
- `species` - Species filter (uses `BrowseOptions.species`). Default is `'any'`
- `range` - Date range filter. Default is `SearchOptions.range['alltime']`
- `rangeFrom` - Start date for manual range. Default is `undefined`
- `rangeTo` - End date for manual range. Default is `undefined`
- `ratingGeneral` - Include general-rated content. Default is `true`
- `ratingMature` - Include mature-rated content. Default is `true`
- `ratingAdult` - Include adult-rated content. Default is `true`
- `typeArt` - Include art submissions. Default is `true`
- `typeMusic` - Include music submissions. Default is `true`
- `typeFlash` - Include flash submissions. Default is `true`
- `typeStory` - Include story submissions. Default is `true`
- `typePhotos` - Include photo submissions. Default is `true`
- `typePoetry` - Include poetry submissions. Default is `true`
- `matching` - Keyword matching mode. Default is `SearchOptions.matching['all']`

### Static Option Getters

- `static orderBy` - Available sort order values: `'relevancy'`, `'date'`, `'popularity'`
- `static orderDirection` - Available direction values: `'ascending'`, `'descending'`
- `static range` - Available range values: `'1day'`, `'3days'`, `'7days'`, `'30days'`, `'90days'`, `'1year'`, `'3years'`, `'5years'`, `'alltime'`, `'manual'`
- `static matching` - Available matching values: `'all'`, `'any'`, `'extended'`
