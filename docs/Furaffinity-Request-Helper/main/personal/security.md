## Security Requests Usage

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests.PersonalUserRequests.Security;
```

## Statis Class Properties

- `static hardLinks` - Array that holds the urls to the specific Action. Default Keys are:
  - sessions
  - logs
  - labels

## Class Functions

- `async getSessionsPage(action, delay)` - Returns your Sessions Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async getLogsPage(action, delay)` - Returns your Logs Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*

  ---

- `async getLabelsPage(action, delay)` - Returns the your Labels Page
  - *`action` - Specifies the action function that gets executed while the Request is going*
  - *`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is*
