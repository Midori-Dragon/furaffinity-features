## User Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.GalleryRequests;
```

## Class Properties

- `GalleryRequests` - Class that holds all Gallery associated Requests (includes Favorites, Scraps and Journals) - [GalleryRequests](user/gallery-requests)

## Static Properties

- `hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - user
  - watch
  - unwatch
  - block
  - unblock

## Class Functions

- `async getUserPage(username, action, delay)` - Returns the Users "Home" Page as a HTML Document
  - _`username` - Specifies the Users username (found in fa url)_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
    <br/><br/>
- `async watchUser(username, watchKey, action, delay)` - Adds the given User to your watches. Returns wether is was successful or not.
  - _`username` - Specifies the Users username (found in fa url)_
  - _`watchKey` - Specifies the Watch-Key that is needed for this Request (found in HTML Properties of the watch Button)_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
    <br/><br/>
- `async unwatchUser(username, unwatchKey, action, delay)` - Removes the given User from your watches. Returns wether is was successful or not.
  - _`username` - Specifies the Users username (found in fa url)_
  - _`unwatchKey` - Specifies the Unwatch-Key that is needed for this Request (found in HTML Properties of the unwatch Button)_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
    <br/><br/>
- `async blockUser(username, blockKey, action, delay)` - Adds the given User to your blocked Users. Returns wether is was successful or not.
  - _`username` - Specifies the Users username (found in fa url)_
  - _`blockKey` - Specifies the Block-Key that is needed for this Request (found in HTML Properties of the block Button)_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
    <br/><br/>
- `async unblockUser(username, unblockKey, action, delay)` - Removes the given User from your blocked Users. Returns wether is was successful or not.
  - _`username` - Specifies the Users username (found in fa url)_
  - _`blockKey` - Specifies the Unblock-Key that is needed for this Request (found in HTML Properties of the unblock Button)_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
