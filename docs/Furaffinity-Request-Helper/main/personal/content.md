## Manage Content Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.PersonalUserRequests.ManageContent;
```

## Statis Class Properties

- `static hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - submissions
  - folders
  - journals
  - favorites
  - buddylist
  - shouts
  - badges

## Class Functions

- `async getFoldersPages(action, delay)` - Returns your Folders Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async getAllWatchesPages(action, delay)` - Returns an array of all your watches Pages
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async getWatchesPage(pageNumber, action, delay)` - Returns your watches Page with the specified number
  - *`pageNumber` - Specifies the page number which will be requested*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*
