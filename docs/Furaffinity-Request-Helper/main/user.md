## User Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.GalleryRequests;
```

## Class Properties

- `GalleryRequests` - Class that holds all Gallery associated Requests (includes Favorites, Scraps and Journals) - [GalleryRequests](/user/gallery-requests)

## Static Properties

- `hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - user
  - watch
  - unwatch
  - block
  - unblock

## Class Functions

- `async getUserPage(username, action, delay)` - Returns the Users "Home" Page as a HTML Document
  - *`username` - Specifies the Users username (found in fa url)*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async watchUser(username, watchKey, action, delay)` - Adds the given User to your watches. Returns wether is was successful or not.
  - *`username` - Specifies the Users username (found in fa url)*
  - *`watchKey` - Specifies the Watch-Key that is needed for this Request (found in HTML Properties of the watch Button)*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async unwatchUser(username, unwatchKey, action, delay)` - Removes the given User from your watches. Returns wether is was successful or not.
  - *`username` - Specifies the Users username (found in fa url)*
  - *`unwatchKey` - Specifies the Unwatch-Key that is needed for this Request (found in HTML Properties of the unwatch Button)*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async blockUser(username, blockKey, action, delay)` - Adds the given User to your blocked Users. Returns wether is was successful or not.
  - *`username` - Specifies the Users username (found in fa url)*
  - *`blockKey` - Specifies the Block-Key that is needed for this Request (found in HTML Properties of the block Button)*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async unblockUser(username, unblockKey, action, delay)` - Removes the given User from your blocked Users. Returns wether is was successful or not.
  - *`username` - Specifies the Users username (found in fa url)*
  - *`blockKey` - Specifies the Unblock-Key that is needed for this Request (found in HTML Properties of the unblock Button)*
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*
