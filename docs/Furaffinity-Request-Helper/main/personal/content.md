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
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
- `async getAllWatchesPages(action, delay)` - Returns an array of all your watches Pages
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
- `async getWatchesPage(pageNumber, action, delay)` - Returns your watches Page with the specified number
  - _`pageNumber` - Specifies the page number which will be requested_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_

__Under Development...__