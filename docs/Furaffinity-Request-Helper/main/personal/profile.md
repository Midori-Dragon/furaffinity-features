## User Profile Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.PersonalUserRequests.UserProfile;
```

## Statis Class Properties

- `static hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - profile
  - profilebanner
  - contacts
  - avatar

## Class Functions

- `async getProfilePage(action, delay)` - Returns your profile Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async getProfilebannerPage(action, delay)` - Returns your profilebanner Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async getContactsPage(action, delay)` - Returns your contacts Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async getAvatarPage(action, delay)` - Returns your avatar Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*
