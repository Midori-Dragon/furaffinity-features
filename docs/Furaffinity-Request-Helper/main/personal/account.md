## Personal User Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.PersonalUserRequests.AccountInformation;
```

## Statis Class Properties

- `static hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - settings
  - siteSettings
  - userSettings

## Class Functions

- `async getSettingsPage(action, delay)` - Returns your Accounts Settings Page
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
- `async getSiteSettingsPage(action, delay)` - Returns your Accounts Site Page
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
- `async getUserSettingsPage(action, delay)` - Returns your Accounts User Page
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_
