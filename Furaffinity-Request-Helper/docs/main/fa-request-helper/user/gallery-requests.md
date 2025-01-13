## Gallery Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.GalleryRequests.Gallery;
```

## Class Properties

- `Gallery` - Class that holds all only Gallery associated Requests
- `Scraps` - Class that holds all only Scraps associated Requests
- `Favorites` - Class that holds all only Favorites associated Requests
- `Journals` - Class that holds all only Journals associated Requests

Example on how to call the `getPage()` function (without an action):

```javascript
await requestHelper.UserRequests.GalleryRequests.Gallery.getPage("someusername", 1);
```

## Specific Gallery Request Functions

All Properties of the **RequestHelper** (`Gallery`, `Scraps`, `Favorites`, `Journals`) hold the same Functions, they just return their respective types of information. They all have the following Functions:

- `async getPage(username, pageNumber, action, delay = 100)` - Returns the Gallery (Favs, Scraps, Journals) Page of the given User
  - _`username` - Specifies the username of the User from which you want to get the Page_
  - _`pageNumber` - Specifies the Number of the page you want to get_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
- `async getFigures(username, pageNumber, action, delay = 100)` - Returns the Figures on the Page of the given User as an Array. (A Figure is the content holder of the target site. For Galleries for example Figures are the content holders for submissions)
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`pageNumber` - Specifies the Number of the page for which you want to get the figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
    <br/><br/>
- `async getFiguresTillPage(username, toPageNumber, action, delay = 100)` - Returns an Array of Arrays of Figures. For each Page you have an Array of Figures on that Page until the specified Page of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`toPageNumber` - Specifies the Number of the page till which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
- `async getFiguresSincePage(username, fromPageNumber, action, delay = 100)` - Returns an Array of Arrays of Figures. For each Page you have an Array of Figures on that Page since the specified Page until the last Page of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`fromPageNumber` - Specifies the Number of the page since which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
- `async getFiguresBetweenPages(username, fromPageNumber, toPageNumber, action, delay = 100)` - Returns an Array of Arrays of Figures. For each Page you have an Array of Figures on that Page since the specified Page and until the specified Page of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`fromPageNumber` - Specifies the Number of the page since which you want to get all figures_
  - _`toPageNumber` - Specifies the Number of the page till which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
    <br/><br/>
- `async getFiguresTillId(username, toId, action, delay = 100)` - Returns an Arrays of Arrays of Figures. For each Page you have an Array of Figures on that Page since the specified Figure Id of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`toId` - Specifies the Id of the Figure till which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
- `async getFiguresSinceId(username, fromId, action, delay = 100)` - Returns an Arrays of Arrays of Figures. For each Page you have an Array of Figures on that Page until the specified Figure Id of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`fromId` - Specifies the If of the Figure since which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
- `async getFiguresBetweenIds(username, fromId, toId, action, delay = 100)` - Returns an Arrays of Arrays of Figures. For each Page you have an Array of Figures on that Page since the specified Figure Id and until the specified Figure Id of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`toId` - Specifies the Id of the Figure till which you want to get all figures_
  - _`fromId` - Specifies the If of the Figure since which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
    <br/><br/>
- `async getFiguresTillIdSincePage(username, toId, fromPageNumber, action, delay = 100)` - Returns an Arrays of Arrays of Figures. For each Page you have an Array of Figures on that Page since the specified Page and until the specified Figure Id of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`toId` - Specifies the Id of the Figure till which you want to get all figures_
  - _`fromPageNumber` - Specifies the Number of the page since which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
- `async getFiguresSinceIdTillPage(username, fromId, toPageNumber, action, delay = 100)` - Returns an Arrays of Arrays of Figures. For each Page you have an Array of Figures on that Page since the specified Figure Id and until the specified Page of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`fromId` - Specifies the If of the Figure since which you want to get all figures_
  - _`toPageNumber` - Specifies the Number of the page till which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_
- `async getFiguresBetweenIdsBetweenPages(username, fromId, toId, fromPageNumber, toPageNumber, action, delay = 100)` - Returns an Arrays of Arrays of Figures. For each Page you have an Array of Figures on that Page since the specified Figure Id on the specified Page and until the specified Figure Id on the specified Page of the given User
  - _`username` - Specifies the username of the User from which you want to get the figures_
  - _`fromId` - Specifies the If of the Figure since which you want to get all figures_
  - _`toId` - Specifies the Id of the Figure till which you want to get all figures_
  - _`fromPageNumber` - Specifies the Number of the page since which you want to get all figures_
  - _`toPageNumber` - Specifies the Number of the page till which you want to get all figures_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is going. Default value is `100`_

## Specific Static Class Properties

All Properties of the **RequestHelper** (`Gallery`, `Scraps`, `Favorites`, `Journals`) hold the same Static Properties. They all have the following Static Properties:

- `static hardLink` - Link which to use for Gallery (Scraps, Favs, Journals) Request. Default is **FA Domain** (specified in [Request Helper](/fa-request-helper)) + `"/gallery/"` (`"/scraps/"`, `"/favorites/"`, `"/journals/"`)
