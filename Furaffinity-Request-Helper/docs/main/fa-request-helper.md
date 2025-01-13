## FA Request Helper Usage

#### Create a instance of the Class

```javascript
const requestHelper = new FARequestHelper(2);
```

_The parameter (in this case 2) sets the max amounts of Requests for this instance._

#### Access a class Property

Access a class property by using your class instance and call a property using `.`.

```javascript
requestHelper.UserRequests;
```

## Class Properties

- `UserRequests` - Class that holds all User associated Requests - [UserRequests](fa-request-helper/user)
- `PersonalUserRequests` - Class that holds all Requests associated with your Account - [PersonalUserRequests](fa-request-helper/personal)
- `SubmissionRequests` - Class that holds all Submission associated Requests - [SubmissionRequests](fa-request-helper/submissions)

## Class Functions

- `async getHTML(url, action, delay)` - Function for getting any websites HTML
  - _`url` - Specifies the url to which the request goes_
  - _`action` - Specifies the action function that gets executed while the Request is going_
  - _`delay` - Specifies the delay in Milliseconds between each execution of the `action` while the Request is_ going. Default value is `100`

## Static Class Properties

- `logLevel` - Specifies the loglevel: 0 = None, 1 = Messages, 2 = Warnings, 3 = Errors
- `domain` - Specifies the domain of Furaffinity. By default is `www.furaffinity.net`
- `useHttps` - Specifies wether to use `https` or `http`

## Static Class Functions

- `getUrl()` - Returns the url to Furaffinty. Based on the static `domain` and `useHttps` variables.
