## Message Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.PersonalUserRequests.MessageRequests;
```

## Static Class Properties

- `static hardLink` - URL to the messages page. Default is `https://www.furaffinity.net/msg/others/`
- `static hardActions` - Object containing available actions for messages. Default actions are:
  - `remove` - Action to remove selected messages
  - `nuke` - Action to nuke selected messages

## Class Properties

- `Watches` - Instance of `NewWatches` class to manage watch notifications
- `JournalComments` - Instance of `NewJournalComments` class to manage journal comment notifications
- `Shouts` - Instance of `NewShouts` class to manage shout notifications
- `Favorites` - Instance of `NewFavorites` class to manage favorite notifications
- `Journals` - Instance of `NewJournals` class to manage journal notifications

## Class Functions

- `async getMessagesPage(action, delay)` - Returns the messages page document
  - *`action` - Optional function that gets executed while the request is processing*
  - *`delay` - Optional delay in milliseconds between each execution of the `action`. Default is 100ms*

  ---

- `async removeMessages(userIds, journalCommentIds, shoutIds, favoriteIds, journalIds, action, delay)` - Removes specified messages from different categories
  - *`userIds` - Optional array of user IDs for watch notifications to remove*
  - *`journalCommentIds` - Optional array of journal comment IDs to remove*
  - *`shoutIds` - Optional array of shout IDs to remove*
  - *`favoriteIds` - Optional array of favorite notification IDs to remove*
  - *`journalIds` - Optional array of journal notification IDs to remove*
  - *`action` - Optional function that gets executed while the request is processing*
  - *`delay` - Optional delay in milliseconds between each execution of the `action`. Default is 100ms*
